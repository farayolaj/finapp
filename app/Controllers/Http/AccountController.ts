import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import PaystackApi from 'App/Common/PaystackApi'
import InsufficientFundException from 'App/Exceptions/InsufficientFundException'
import InvalidBankException from 'App/Exceptions/InvalidBankException'
import Transaction from 'App/Models/Transaction'
import User from 'App/Models/User'
import AddBeneficiaryValidator from 'App/Validators/AddBeneficiaryValidator'
import FundAccountValidator from 'App/Validators/FundAccountValidator'
import SendMoneyValidator from 'App/Validators/SendMoneyValidator'

export default class AccountController {
  public async fundAccount({ auth, request }: HttpContextContract) {
    const { amount } = await request.validate(FundAccountValidator)
    const data = await PaystackApi.initializeTransaction({
      email: auth.user?.email as string,
      amount: amount.toString(),
    })

    return { authorization_url: data.authorization_url }
  }

  public async sendMoney({ auth, request }: HttpContextContract) {
    const { email, amount } = await request.validate(SendMoneyValidator)
    const user = auth.user as User
    await user.load('account')
    const userAccount = user.account

    if (amount > userAccount.balance) throw new InsufficientFundException()

    const recipient = await User.findByOrFail('email', email)
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
      return {
        error: 'Transaction failed',
      }
    }
  }

  public async getDetails({ auth }: HttpContextContract) {
    const user = auth.user as User
    await user.load('account')
    await user.account.load('beneficiaries')

    return user.account
  }

  public async addBeneficiary({ auth, request }: HttpContextContract) {
    const { bankName, accountNumber } = await request.validate(AddBeneficiaryValidator)

    const banks = await PaystackApi.getBanks()
    const bank = banks.find((bank) => bank.name === bankName)
    if (!bank) throw new InvalidBankException()
    const { accountName } = await PaystackApi.resolveAccount(accountNumber, bank.code)

    const user = auth.user as User
    await user.load('account')
    const beneficiary = await user.account
      .related('beneficiaries')
      .create({ accountName, accountNumber, bankCode: bank.code, bankName: bank.name })

    return beneficiary
  }
}
