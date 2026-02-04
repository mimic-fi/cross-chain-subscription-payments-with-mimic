import { type NextRequest, NextResponse } from "next/server"
import { findExecutions } from "@/lib/find-executions"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const signer = searchParams.get("signer")

  if (!signer) {
    console.log("[v0] API executions: Missing signer parameter")
    return NextResponse.json({ error: "Missing signer parameter" }, { status: 400 })
  }

  try {
    console.log("[v0] API executions: Fetching executions for signer:", signer)

    const executions = await findExecutions(signer)

    console.log("[v0] API executions: Total executions found:", executions.length)

    // Transform executions for display
    const transformedExecutions = executions.map((execution: any) => ({
      id: execution.id,
      status: execution.status,
      transactionHash: execution.transactionHash,
      createdAt: execution.createdAt,
      amount: execution.amount,
      configActive: execution.configActive,
    }))

    return NextResponse.json(transformedExecutions)
  } catch (error) {
    console.error("[v0] API executions error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch executions",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
