import { type NextRequest, NextResponse } from "next/server"
import { Client, EthersSigner, ApiKeyAuth } from "@mimicprotocol/sdk"

export async function GET(request: NextRequest) {
  const configId = request.nextUrl.searchParams.get("configId")

  if (!configId) {
    return NextResponse.json({ error: "Missing configId parameter" }, { status: 400 })
  }

  if (!process.env.PRIVATE_KEY) {
    return NextResponse.json({ error: "PRIVATE_KEY not configured" }, { status: 500 })
  }

  if (!process.env.MIMIC_API_KEY) {
    return NextResponse.json({ error: "MIMIC_API_KEY not configured" }, { status: 500 })
  }

  try {
    const signer = EthersSigner.fromPrivateKey(process.env.PRIVATE_KEY)
    const client = new Client({
      signer: signer,
      baseUrl: "https://api-protocol.mimic.fi",
    })

    // Get the deactivation message for this config using the signer
    const deactivateMessage = await client.configs.signDeactivateMessage(configId, signer)

    console.log("[v0] Deactivation message obtained for:", configId)

    return NextResponse.json({
      deactivateMessage,
    })
  } catch (error) {
    console.error("[v0] Error getting deactivation message:", error)
    return NextResponse.json(
      {
        error: "Failed to get deactivation message",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
