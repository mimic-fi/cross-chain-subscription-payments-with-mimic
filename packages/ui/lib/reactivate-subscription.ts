"use client"

import { Client, EthersSigner } from "@mimicprotocol/sdk"
import { ethers } from "ethers"

export async function reactivateSubscription(configSig: string) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const jsonRpcSigner = await provider.getSigner()
    const userAddress = await jsonRpcSigner.getAddress()

    console.log("[v0] Reactivating subscription:", configSig)
    console.log("[v0] Reactivating for address:", userAddress)

    const client = new Client({
      signer: EthersSigner.fromJsonRpcSigner(jsonRpcSigner),
      baseUrl: "https://api-protocol.mimic.fi",
    })

    // Get the existing config to reactivate it
    const result = await client.configs.signAndReactivate(configSig)

    console.log("[v0] Subscription reactivated successfully:", result.sig)
    return result
  } catch (error) {
    console.error("[v0] Error reactivating subscription:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
    }
    throw error
  }
}
