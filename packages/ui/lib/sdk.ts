import { Client, BearerAuth } from '@mimicprotocol/sdk'

class ClientSingleton {
  private static instance: Client | null = null
  private static currentToken: string | null = null

  static getInstance(): Client {
    if (!ClientSingleton.instance) {
      ClientSingleton.instance = new Client({
        baseUrl: "https://api-protocol.mimic.fi",
      })
    }
    return ClientSingleton.instance
  }

  static setAuthToken(token: string): void {
    if (ClientSingleton.currentToken !== token) {
      ClientSingleton.currentToken = token

      ClientSingleton.instance = new Client({
        baseUrl: "https://api-protocol.mimic.fi",
        auth: new BearerAuth(token),
      })
    }
  }

  static getAuthToken(): string | null {
    return ClientSingleton.currentToken
  }

  static clearAuth(): void {
    ClientSingleton.currentToken = null
    ClientSingleton.instance = new Client({
      baseUrl: "https://api-protocol.mimic.fi",
    })
  }

  private constructor() {}
}

export { ClientSingleton }
export default ClientSingleton
