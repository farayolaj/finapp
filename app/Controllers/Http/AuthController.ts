import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import CreateUserValidator from 'App/Validators/CreateUserValidator'

export default class AuthController {
  public async signUp({ request }: HttpContextContract) {
    const { email, firstName, lastName, password } = await request.validate(CreateUserValidator)
    const user = await User.create({
      email,
      firstName,
      lastName,
      password,
    })

    await user.related('account').create({})
    await user.load('account')
    return { message: 'User successfully created', data: user }
  }

  public async signIn({ auth, request }: HttpContextContract) {
    const { email, password } = request.body()
    const token = await auth.attempt(email, password)
    return {
      message: 'Sign in successful',
      data: {
        accessToken: token,
      },
    }
  }
}
