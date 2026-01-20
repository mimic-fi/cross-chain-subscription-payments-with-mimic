import { type NextRequest, NextResponse } from "next/server"
import { Client, ApiKeyAuth } from "@mimicprotocol/sdk"
import { TASK_CID } from "@/lib/constants"

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Missing address parameter" }, { status: 400 })
  }

  if (!process.env.MIMIC_API_KEY) {
    console.error("[v0] MIMIC_API_KEY not configured")
    return NextResponse.json({ error: "API key not configured" }, { status: 500 })
  }

  try {
    const client = new Client({
      auth: new ApiKeyAuth(process.env.MIMIC_API_KEY),
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-protocol.mimic.fi",
    })

    // Fetch ALL configs for this signer
    const allConfigs = await client.configs.get({
      signer: address,
      offset: 0,
      limit: 100,
    })

    console.log("[v0] All configs fetched:", allConfigs.length)

    // Filter to only this task's configs
    const taskConfigs = allConfigs.filter((config: any) => config.taskCid === TASK_CID)
    console.log("[v0] Task configs found:", taskConfigs.length)

    // Transform to subscription format
    const transformConfig = (config: any, isActive: boolean) => ({
      id: config.sig,
      amount: config.input?.amountIn || "0",
      frequency: config.trigger?.schedule || "Every minute",
      recipient: config.input?.recipient || "0x...",
      status: isActive ? "active" : "paused",
      createdAt: config.createdAt || new Date().toISOString(),
    })

    // Separate active and inactive - check if config is disabled
    const currentSubscriptions = taskConfigs
      .filter((config: any) => !config.disabled)
      .map((c: any) => transformConfig(c, true))
    
    const pastSubscriptions = taskConfigs
      .filter((config: any) => config.disabled)
      .map((c: any) => transformConfig(c, false))

    console.log("[v0] Current subscriptions:", currentSubscriptions.length)
    console.log("[v0] Past subscriptions:", pastSubscriptions.length)

    return NextResponse.json({
      currentSubscriptions,
      pastSubscriptions,
    })
  } catch (error) {
    console.error("[v0] Error fetching subscriptions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch subscriptions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
