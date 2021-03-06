import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InsufficientFundException extends Exception {
  constructor(
    message: string = 'Your balance is not enough to complete the transaction',
    status: number = 403,
    errorCode: string = 'InsufficientFund'
  ) {
    super(message, status, errorCode)
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send({ error: error.code, message: error.message })
  }
}
