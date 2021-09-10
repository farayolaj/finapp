import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PaystackApi from 'App/Common/PaystackApi'
import FundAccountValidator from 'App/Validators/FundAccountValidator'

export default class AccountController {
  public async fundAccount({ auth, request }: HttpContextContract) {
    const { amount } = await request.validate(FundAccountValidator)
    const data = await PaystackApi.initializeTransaction({
      email: auth.user?.email as string,
      amount: amount.toString(),
    })

    return { authorization_url: data.authorization_url }
  }
}
