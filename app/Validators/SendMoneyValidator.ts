import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class SendMoneyValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({}, [rules.email()]),
    amount: schema.number([rules.unsigned()]),
  })

  public messages = {
    'amount.unsigned': 'You cannot send negative amounts',
  }
}
