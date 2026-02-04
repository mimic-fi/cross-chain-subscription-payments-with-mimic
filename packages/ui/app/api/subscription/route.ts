import { type NextRequest, NextResponse } from "next/server"
import ClientSingleton from "@/lib/sdk"
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
    // Set the auth token for the singleton client
    ClientSingleton.setAuthToken(process.env.MIMIC_API_KEY)
    const client = ClientSingleton.getInstance() as any

    // Fetch active configs for this signer with taskCid filter
    const activeConfigs = await client.configs.get({
      signer: address,
      offset: 0,
      limit: 100,
      active: true,
      taskCid: TASK_CID,
    })

    console.log("[v0] Active configs fetched:", activeConfigs.length)

    // Configs already filtered by taskCid from API, no need to filter again
    const currentSubscriptions = activeConfigs.map((c: any) => transformConfig(c))

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
