import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class RecipientNotFoundException extends Exception {
  constructor(
    message: string = 'Recipient account not found',
    status: number = 404,
    errorCode: string = 'RecipientNotFound'
  ) {
    super(message, status, errorCode)
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send({ error: error.code, message: error.message })
  }
}
