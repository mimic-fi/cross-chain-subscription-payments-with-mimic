import { type NextRequest, NextResponse } from "next/server"
import { Client, EthersSigner, ApiKeyAuth } from "@mimicprotocol/sdk"

interface ActionRequest {
  address: string
  action: "pause" | "resume" | "cancel"
  configId: string
  deactivateSig?: string
}

export async function POST(request: NextRequest) {
  let body: ActionRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body.address || !body.action || !body.configId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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

    if (body.action === "pause" || body.action === "cancel") {
      // For deactivation, we need the signature from the config signer (user)
      // The client will provide the deactivateSig after signing the message
      if (!body.deactivateSig) {
        return NextResponse.json(
          { error: "Missing deactivation signature" },
          { status: 400 }
        )
      }

      // Use the deactivate method with the config sig and the signed deactivation message
      await client.configs.deactivate(body.configId, body.deactivateSig)
      console.log(`[v0] Config ${body.action}ed:`, body.configId)
    } else if (body.action === "resume") {
      // Cannot resume a deactivated config - need to create a new one
      console.log("[v0] Resume not supported - config is deactivated")
      return NextResponse.json(
        {
          error: "Cannot resume deactivated subscription",
          details: "Please create a new subscription instead",
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Subscription ${body.action}ed successfully`,
    })
  } catch (error) {
    console.error("[v0] Error performing action:", error)
    return NextResponse.json(
      {
        error: "Failed to perform action",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
