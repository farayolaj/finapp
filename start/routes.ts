import Route from '@ioc:Adonis/Core/Route'
import PaystackApi from 'App/Common/PaystackApi'
import PaystackEventHandler from 'App/Common/PaystackEventHandler'
import User from 'App/Models/User'

Route.get('me', async ({ auth }) => {
  const user = auth.user as User

  return { message: 'Fetched signed in user', data: user }
}).middleware('auth')

Route.group(() => {
  Route.post('signup', 'AuthController.signUp')
  Route.post('signin', 'AuthController.signIn')
}).prefix('auth')

Route.group(() => {
  Route.post('fund-account', 'AccountController.fundAccount')
  Route.post('send-money', 'AccountController.sendMoney')
  Route.get('', 'AccountController.getDetails')
  Route.post('beneficiary', 'AccountController.addBeneficiary')
  Route.post('withdraw', 'AccountController.withdraw')
  Route.get('transaction', 'AccountController.getTransactions')
})
  .prefix('account')
  .middleware('auth')

Route.get('bank', async () => {
  const banks = await PaystackApi.getBanks()
  return { message: 'List of valid banks fetched', data: banks }
})

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
    case 'transfer.success':
      PaystackEventHandler.handleTransferSuccess({
        amount: data.amount,
        accountName: data.recipient.details.accountName,
        email: data.recipient.metadata.email,
        status: data.status,
      })
  }

  return
})
