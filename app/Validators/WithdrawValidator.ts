import { schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class WithdrawValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    beneficiaryId: schema.number(),
    amount: schema.number(),
  })

  public messages = {}
}
