import { TASK_CID } from "@/lib/constants"
import ClientSingleton from "@/lib/sdk"

export async function findExecutions(signerAddress: string) {
  try {
    if (!process.env.MIMIC_API_KEY) {
      throw new Error("MIMIC_API_KEY not configured")
    }

    // Set the auth token for the singleton client
    ClientSingleton.setAuthToken(process.env.MIMIC_API_KEY)
    const client = ClientSingleton.getInstance() as any

    console.log("[v0] findExecutions: Looking for configs for signer:", signerAddress)

    // First try to find active config
    let configs = await client.configs.get({
      signer: signerAddress,
      active: true,
      taskCid: TASK_CID,
      offset: 0,
      limit: 10,
    })

    console.log("[v0] findExecutions: Active configs found:", configs.length)

    // Only use active configs - don't search for inactive ones
    if (configs.length === 0) {
      console.log("[v0] findExecutions: No active configs found")
      return []
    }

    // Fetch executions for all configs
    const allExecutions: any[] = []

    for (const config of configs) {
      try {
        console.log("[v0] findExecutions: Fetching executions for configSig:", config.sig)

        const executions = await client.executions.get({
          configSig: config.sig,
          sort: -1,
          limit: 50,
        })

        console.log("[v0] findExecutions: Executions for this config:", executions?.length || 0)

        if (executions && executions.length > 0) {
          // Filter only succeeded executions with a hash - check result field and hash
          const succeededExecutions = executions.filter(
            (e: any) => e.result === "succeeded" && (e.hash || e.transactionHash || e.txHash)
          )

          console.log("[v0] findExecutions: Succeeded executions in this config:", succeededExecutions.length)

          allExecutions.push(
            ...succeededExecutions.map((execution: any) => ({
              configSig: config.sig,
              configActive: config.active,
              id: execution.id || execution.sig,
              status: execution.result || "pending",
              transactionHash: execution.hash || execution.transactionHash || execution.txHash,
              createdAt: execution.createdAt,
              amount: execution.amount || "-",
            }))
          )
        }
      } catch (err) {
        console.error("[v0] findExecutions: Error fetching executions for config:", config.sig, err)
        // Continue to next config
      }
    }

    // Sort all executions by createdAt descending (newest first)
    allExecutions.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return timeB - timeA
    })

    console.log("[v0] findExecutions: Total executions found:", allExecutions.length)
    return allExecutions.slice(0, 50) // Return top 50 most recent
  } catch (error) {
    console.error("[v0] findExecutions error:", error)
    throw error
  }
}
