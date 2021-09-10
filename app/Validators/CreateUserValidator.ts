import { rules, schema } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateUserValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    email: schema.string({ trim: true }, [
      rules.email(),
      rules.required(),
      rules.unique({ table: 'users', column: 'email' }),
    ]),
    firstName: schema.string({ trim: true }, [rules.required()]),
    lastName: schema.string({ trim: true }, [rules.required()]),
    password: schema.string(),
  })

  public messages = {}
}
