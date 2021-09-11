import Env from '@ioc:Adonis/Core/Env'
import Logger from '@ioc:Adonis/Core/Logger'
import InternalServerException from 'App/Exceptions/InternalServerException'
import InvalidAccountNumberException from 'App/Exceptions/InvalidAccountNumberException'
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

  public static async getBanks(): Promise<{ name: string; code: string }[]> {
    const url = PaystackApi.baseUrl + '/bank?country=nigeria'

    const res = await axios.get(url, {
      headers: { Authorization: PaystackApi.authorization },
    })

    return res.data.data.map((bank) => ({ name: bank.name, code: bank.code }))
  }

  public static async resolveAccount(
    accountNumber: string,
    bankCode: string
  ): Promise<{ accountNumber: string; accountName: string }> {
    const url = `${PaystackApi.baseUrl}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`

    try {
      const res = await axios.get(url, {
        headers: { Authorization: PaystackApi.authorization },
      })
      return {
        accountName: res.data.data.account_name,
        accountNumber: res.data.data.account_number,
      }
    } catch (e) {
      if (e?.response?.status === 422) throw new InvalidAccountNumberException()
      else {
        Logger.error(e)
        throw new InternalServerException()
      }
    }
  }
}
