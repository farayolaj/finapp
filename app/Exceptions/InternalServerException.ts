import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class InternalServerException extends Exception {
  constructor(
    message: string = 'Internal problems. This should not happen',
    status: number = 500,
    errorCode: string = 'InternalServerError'
  ) {
    super(message, status, errorCode)
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send({ error: error.code, message: error.message })
  }
}
