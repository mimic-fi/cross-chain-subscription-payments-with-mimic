import { type NextRequest, NextResponse } from "next/server"
import { Client, ApiKeyAuth } from "@mimicprotocol/sdk"
import { TASK_CID, transformConfig } from "@/lib/constants"

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
      baseUrl: "https://api-protocol.mimic.fi",
    })

    // Fetch active configs for this signer with taskCid filter
    const activeConfigs = await client.configs.get({
      signer: address,
      offset: 0,
      limit: 100,
      active: true,
      taskCid: TASK_CID,
    })

    console.log("[v0] Active configs fetched:", activeConfigs.length)
    
    if (activeConfigs.length > 0) {
      console.log("[v0] First config structure:", activeConfigs[0])
      console.log("[v0] First config sig:", activeConfigs[0].sig)
    }

    // Configs already filtered by taskCid from API, no need to filter again
    const currentSubscriptions = activeConfigs.map((c: any) => transformConfig(c))
    
    if (currentSubscriptions.length > 0) {
      console.log("[v0] First transformed subscription:", currentSubscriptions[0])
      console.log("[v0] First subscription ID:", currentSubscriptions[0].id)
    }

    console.log("[v0] Current subscriptions:", currentSubscriptions.length)

    return NextResponse.json({
      currentSubscriptions,
      pastSubscriptions: [],
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
