"use client"

import { Client, EthersSigner } from "@mimicprotocol/sdk"
import { ethers } from "ethers"

export async function deactivateSubscription(configSig: string) {
  try {
    console.log("[v0] Deactivating subscription:", configSig)

    const provider = new ethers.BrowserProvider(window.ethereum)
    const jsonRpcSigner = await provider.getSigner()
    const userAddress = await jsonRpcSigner.getAddress()

    console.log("[v0] Deactivating for address:", userAddress)

    const client = new Client({
      signer: EthersSigner.fromJsonRpcSigner(jsonRpcSigner),
      baseUrl: "https://api-protocol.mimic.fi",
    })

    console.log("[v0] Calling signAndDeactivate for config:", configSig)
    const deactivatedConfig = await client.configs.signAndDeactivate(configSig)

    console.log("[v0] Subscription deactivated successfully:", deactivatedConfig.sig)

    return deactivatedConfig
  } catch (error) {
    console.error("[v0] Error deactivating subscription:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    throw error
  }
}
