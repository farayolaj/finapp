import Env from '@ioc:Adonis/Core/Env'
import axios from 'axios'

export default class PaystackApi {
  private static authorization = 'Bearer ' + Env.get('PAYSTACK_SECRET', '')
  private static baseUrl = Env.get('PAYSTACK_URL')

  public static async initializeTransaction({ email, amount }: { email: string; amount: string }) {
    const channels = ['card', 'bank_transfer']
    const url = PaystackApi.baseUrl + '/transaction/initialize'

    const res = await axios.post(
      url,
      {
        email,
        amount,
        channels,
      },
      {
        headers: { Authorization: PaystackApi.authorization },
      }
    )

    return res.data.data
  }

  public static async verifyTransation(reference: string): Promise<'success' | 'failed'> {
    const url = PaystackApi.baseUrl + '/transaction/verify/' + reference
    const res = await axios.get(url, {
      headers: { Authorization: PaystackApi.authorization },
    })

    return res.data.data.status
  }
}
