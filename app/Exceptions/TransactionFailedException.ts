import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class TransactionFailedException extends Exception {
  constructor(
    message: string = 'Transaction could not be completed successfully',
    status: number = 502,
    errorCode: string = 'TransactionFailed'
  ) {
    super(message, status, errorCode)
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send({ error: error.code, message: error.message })
  }
}
