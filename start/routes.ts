/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import PaystackApi from 'App/Common/PaystackApi'
import PaystackEventHandler from 'App/Common/PaystackEventHandler'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.group(() => {
  Route.post('signup', 'AuthController.signUp')
  Route.post('signin', 'AuthController.signIn')
}).prefix('auth')

Route.group(() => {
  Route.post('fund-account', 'AccountController.fundAccount')
  Route.post('send-money', 'AccountController.sendMoney')
})
  .prefix('account')
  .middleware('auth')

Route.get('callback', async ({ request }) => {
  const { reference } = request.qs()

  const status = await PaystackApi.verifyTransation(reference)

  if (status === 'failed') return { message: 'Transaction failed' }
  else return { message: 'Transaction successful' }
})

Route.post('webhook', async ({ request }) => {
  const res = request.body()
  const data = res.data

  switch (res.event) {
    case 'charge.success':
      PaystackEventHandler.handleChargeSuccess({
        reference: data.reference,
        amount: data.amount,
        email: data.customer.email,
        status: data.status,
      })
      break
  }

  return
})
