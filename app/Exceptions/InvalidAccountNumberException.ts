import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InvalidAccountNumberException extends Exception {
  constructor(
    message: string = 'Send a valid account number',
    status: number = 403,
    errorCode: string = 'InvalidAccountNumber'
  ) {
    super(message, status, errorCode)
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send({ error: error.code, message: error.message })
  }
}
