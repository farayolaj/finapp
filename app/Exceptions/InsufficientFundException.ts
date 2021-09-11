import { Exception } from '@adonisjs/core/build/standalone'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/*
|--------------------------------------------------------------------------
| Exception
|--------------------------------------------------------------------------
|
| The Exception class imported from `@adonisjs/core` allows defining
| a status code and error code for every exception.
|
| @example
| new InsufficientFundException('message', 500, 'E_RUNTIME_EXCEPTION')
|
*/
export default class InsufficientFundException extends Exception {
  constructor(
    message: string = 'Your balance is not enough to complete the transaction',
    status: number = 403,
    errorCode?: string
  ) {
    super(message, status, errorCode)
  }

  public async handle(error: this, ctx: HttpContextContract) {
    ctx.response.status(error.status).send({ error: 'Insufficient Funds', message: error.message })
  }
}
