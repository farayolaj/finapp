import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import PaystackApi from 'App/Common/PaystackApi'
import InsufficientFundException from 'App/Exceptions/InsufficientFundException'
import RecipientNotFoundException from 'App/Exceptions/RecipientNotFoundException'
import TransactionFailedException from 'App/Exceptions/TransactionFailedException'
import Transaction from 'App/Models/Transaction'
import User from 'App/Models/User'
import AddBeneficiaryValidator from 'App/Validators/AddBeneficiaryValidator'
import FundAccountValidator from 'App/Validators/FundAccountValidator'
import SendMoneyValidator from 'App/Validators/SendMoneyValidator'
import WithdrawValidator from 'App/Validators/WithdrawValidator'

export default class AccountController {
  public async fundAccount({ auth, request }: HttpContextContract) {
    const { amount } = await request.validate(FundAccountValidator)
    const data = await PaystackApi.initializeTransaction({
      email: auth.user?.email as string,
      amount: amount.toString(),
    })

    return {
      message: 'Follow authorization url to complete payment',
      data: { authorizationUrl: data.authorization_url },
    }
  }

  public async sendMoney({ auth, request }: HttpContextContract) {
    const { email, amount } = await request.validate(SendMoneyValidator)
    const user = auth.user as User
    await user.load('account')
    const userAccount = user.account

    if (amount > userAccount.balance) throw new InsufficientFundException()

    const recipient = await User.findBy('email', email)
    if (!recipient) throw new RecipientNotFoundException()
    await recipient.load('account')
    const recipientAccount = await recipient.account

    const trx = await Database.transaction()

    try {
      userAccount.useTransaction(trx)
      recipientAccount.useTransaction(trx)

      userAccount.balance -= amount
      recipientAccount.balance += amount

      await userAccount.save()
      await recipientAccount.save()

      const transaction = new Transaction()
      transaction.amount = amount
      transaction.recipient = email
      transaction.sender = user.email
      transaction.status = 'success'

      transaction.useTransaction(trx)
      await transaction.save()

      await trx.commit()

      return {
        message: 'Transaction successful',
      }
    } catch (e) {
      await trx.rollback()
      throw new TransactionFailedException()
    }
  }

  public async getDetails({ auth }: HttpContextContract) {
    const user = auth.user as User
    await user.load('account')
    await user.account.load('beneficiaries')

    return { message: 'User details fetched successfully', data: user.account }
  }

  public async addBeneficiary({ auth, request }: HttpContextContract) {
    const { bankCode, accountNumber } = await request.validate(AddBeneficiaryValidator)
    const { accountName } = await PaystackApi.resolveAccount(accountNumber, bankCode)
    const { recipientCode } = await PaystackApi.transferRecipient({
      name: accountName,
      bankCode: bankCode,
      email: auth.user?.email || '',
      accountNumber,
    })

    const banks = await PaystackApi.getBanks()
    const bankName = banks.find((bank) => bank.code === bankCode)?.name

    const user = auth.user as User
    await user.load('account')
    const beneficiary = await user.account.related('beneficiaries').create({
      accountName,
      recipientCode,
      accountNumber,
      bankCode: bankCode,
      bankName: bankName,
    })

    return { message: 'Beneficiary successfully created', data: beneficiary }
  }

  public async withdraw({ auth, request }: HttpContextContract) {
    const { beneficiaryId, amount } = await request.validate(WithdrawValidator)
    const user = auth.user as User

    await user.load('account', (builder) =>
      builder.preload('beneficiaries', (query) => query.where('id', beneficiaryId))
    )

    if (user.account.balance < amount) throw new InsufficientFundException()

    const beneficiary = user.account.beneficiaries[0]
    if (!beneficiary) throw new Error('Beneficiary does not exist')

    const { status } = await PaystackApi.transfer({
      amount,
      recipient: beneficiary.recipientCode,
    })

    return { message: 'Transaction is been processed', data: { status } }
  }

  public async getTransactions({ auth }: HttpContextContract) {
    const user = auth.user as User
    const transactions = await Transaction.query()
      .where('recipient', user.email)
      .orWhere('sender', user.email)

    return { message: 'Transactions fetched', data: transactions }
  }
}
