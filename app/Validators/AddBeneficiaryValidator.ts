import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class AddBeneficiaryValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    bankCode: schema.string(),
    accountNumber: schema.string({ trim: true }, [rules.minLength(10)]),
  })

  public messages = {}
}
