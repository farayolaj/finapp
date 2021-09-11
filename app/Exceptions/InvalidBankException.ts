import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InvalidBankException extends Exception {
  constructor(
    message: string = 'Get a list of valid bank names from `/banks`',
    status: number = 400,
    errorCode: string = 'InvalidBank'
  ) {
    super(message, status, errorCode)
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send({ error: error.code, message: error.message })
  }
}
