import Database from '@ioc:Adonis/Lucid/Database'
import Transaction from 'App/Models/Transaction'
import User from 'App/Models/User'

export default class PaystackEventHandler {
  public static async handleChargeSuccess(data: {
    reference: string
    amount: number
    status: string
    email: string
  }) {
    Database.transaction(async (trx) => {
      const user = await User.query().where('email', data.email).preload('account').firstOrFail()
      const account = user.account

      account.useTransaction(trx)

      account.balance += data.amount
      await account.save()

      const transaction = new Transaction()

      transaction.amount = data.amount
      transaction.recipient = user.email
      transaction.sender = user.email
      transaction.status = data.status

      transaction.useTransaction(trx)
      await transaction.save()
    })
  }

  public static async handleTransferSuccess(data: {
    accountName: string
    amount: number
    status: string
    email: string
  }) {
    Database.transaction(async (trx) => {
      const user = await User.query().where('email', data.email).preload('account').firstOrFail()
      const account = user.account

      account.useTransaction(trx)

      account.balance -= data.amount
      await account.save()

      const transaction = new Transaction()

      transaction.amount = data.amount
      transaction.recipient = data.accountName
      transaction.sender = user.email
      transaction.status = data.status

      transaction.useTransaction(trx)
      await transaction.save()
    })
  }
}
