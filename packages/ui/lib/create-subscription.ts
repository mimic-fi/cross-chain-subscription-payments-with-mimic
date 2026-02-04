"use client"

import { Client, EthersSigner, TriggerType } from "@mimicprotocol/sdk"
import { ethers } from "ethers"
import { TASK_CID } from "@/lib/constants"

export async function createSubscription(body: {
  trigger: { cronSchedule: string; delta: string }
  config: {
    sourceChain: string
    destinationChain: string
    amountIn: string
    recipient: string
    maxFee: string
  }
}) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const jsonRpcSigner = await provider.getSigner()
    const userAddress = await jsonRpcSigner.getAddress()

    console.log("[v0] Creating subscription for:", userAddress)
    console.log("[v0] Task CID:", TASK_CID)

    const client = new Client({
      signer: EthersSigner.fromJsonRpcSigner(jsonRpcSigner),
      baseUrl: "https://api-protocol.mimic.fi",
    })

    console.log("[v0] Fetching manifest for:", TASK_CID)
    const manifest = await client.tasks.getManifest(TASK_CID)
    console.log("[v0] Manifest fetched successfully")

    // Generate a unique version based on timestamp to prevent duplicate config errors
    const timestamp = Date.now()
    const versionNumber = Math.floor(timestamp / 1000)
    const version = `1.0.${versionNumber}`

    console.log("[v0] Creating config with version:", version)
    console.log("[v0] Creating config with payload:", {
      taskCid: TASK_CID,
      trigger: body.trigger,
      input: body.config,
    })

    const newConfig = await client.configs.signAndCreate({
      taskCid: TASK_CID,
      version: version,
      description: `Recurring subscription: ${body.config.sourceChain} → ${body.config.destinationChain}`,
      manifest,
      trigger: {
        type: TriggerType.Cron,
        schedule: body.trigger.cronSchedule,
        delta: `${body.trigger.delta}m`,
        endDate: 0,
      },
      input: {
        sourceChain: Number.parseInt(body.config.sourceChain),
        destinationChain: Number.parseInt(body.config.destinationChain),
        amountIn: body.config.amountIn,
        recipient: body.config.recipient,
        maxFee: body.config.maxFee,
      },
      executionFeeLimit: "0",
      minValidations: 1,
    })

    console.log("[v0] Config created successfully:", newConfig.sig)

    if (newConfig.signer?.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error(`Signer mismatch expected=${userAddress} got=${newConfig.signer}`)
    }

    return newConfig
  } catch (error) {
    console.error("[v0] Error creating subscription:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    throw error
  }
}
