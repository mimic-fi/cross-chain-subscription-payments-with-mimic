import { type NextRequest, NextResponse } from "next/server"
import { Client, EthersSigner, TriggerType, ApiKeyAuth } from "@mimicprotocol/sdk"
import { TASK_CID } from "@/lib/constants"

interface CreateConfigRequest {
  address: string
  trigger: {
    cronSchedule: string
    delta: string
  }
  config: {
    sourceChain: string
    destinationChain: string
    amountIn: string
    recipient: string
    slippage: string
    maxFee: string
  }
}

export async function POST(request: NextRequest) {
  let body: CreateConfigRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.address) return NextResponse.json({ error: "Missing address" }, { status: 400 })
  if (!body.trigger) return NextResponse.json({ error: "Missing trigger" }, { status: 400 })
  if (!body.config) return NextResponse.json({ error: "Missing config" }, { status: 400 })
  if (!process.env.PRIVATE_KEY) return NextResponse.json({ error: "PRIVATE_KEY not configured" }, { status: 500 })
  if (!process.env.MIMIC_API_KEY) return NextResponse.json({ error: "MIMIC_API_KEY not configured" }, { status: 500 })

  try {
    // Use ApiKeyAuth to check existing configs
    const readClient = new Client({
      auth: new ApiKeyAuth(process.env.MIMIC_API_KEY),
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-protocol.mimic.fi",
    })

    // Use EthersSigner to create configs
    const signer = EthersSigner.fromPrivateKey(process.env.PRIVATE_KEY)
    const createClient = new Client({
      signer: signer,
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-protocol.mimic.fi",
    })

    // Get the manifest for the task first
    const manifest = await createClient.tasks.getManifest(TASK_CID)
    console.log("[v0] Manifest retrieved for task:", TASK_CID)

    // Create config using Mimic SDK with manifest and signer
    const newConfig = await createClient.configs.signAndCreate({
      taskCid: TASK_CID,
      version: "1.0.0",
      description: `Recurring subscription: ${body.config.sourceChain} → ${body.config.destinationChain}`,
      manifest: manifest,
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
        slippage: body.config.slippage,
        maxFee: body.config.maxFee,
      },
      signer: body.address,
      executionFeeLimit: "0",
      minValidations: 1,
    })

    console.log("[v0] Config created successfully:", newConfig)

    return NextResponse.json({
      success: true,
      config: newConfig,
      message: "Subscription configured successfully",
    })
  } catch (error) {
    console.error("[v0] Config creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create subscription configuration",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
