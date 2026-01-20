import { type NextRequest, NextResponse } from "next/server"
import { Client, EthersSigner } from "@mimicprotocol/sdk"
import { TASK_CID } from "@/lib/constants"

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Missing address parameter" }, { status: 400 })
  }

  if (!process.env.PRIVATE_KEY) {
    return NextResponse.json({ error: "PRIVATE_KEY not configured" }, { status: 500 })
  }

  try {
    const signer = EthersSigner.fromPrivateKey(process.env.PRIVATE_KEY)
    const client = new Client({
      signer: signer,
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-protocol.mimic.fi",
    })

    // Fetch active config first
    const activeConfigs = await client.configs.get({
      signer: address,
      active: true,
      taskCid: TASK_CID,
      limit: 1,
    })

    if (activeConfigs.length === 0) {
      return NextResponse.json({ executions: [] })
    }

    const config = activeConfigs[0]

    // Fetch executions for this config using configSig
    const executions = await client.executions.get({
      configSig: config.sig,
    })

    // Transform executions
    const transformedExecutions = executions.map((execution: any) => ({
      id: execution.id,
      type: "Subscription Payment",
      amount: `${config.input?.amountIn || "0"} USDC`,
      status: execution.status || "pending",
      timestamp: execution.createdAt?.toISOString() || new Date().toISOString(),
      hash: execution.id,
    }))

    return NextResponse.json({ executions: transformedExecutions })
  } catch (error) {
    console.error("[v0] Error fetching executions:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch executions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
