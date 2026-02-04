"use client"

export async function getExecutions(signerAddress: string) {
  try {
    console.log("[v0] getExecutions: Fetching for signer:", signerAddress)
    console.log("[v0] getExecutions: signer type:", typeof signerAddress)
    console.log("[v0] getExecutions: signer length:", signerAddress?.length)
    console.log("[v0] getExecutions: signer empty?:", !signerAddress || signerAddress.trim() === "")

    if (!signerAddress || signerAddress.trim() === "") {
      throw new Error("Signer address is empty")
    }

    const url = `/api/executions?signer=${encodeURIComponent(signerAddress)}`
    console.log("[v0] getExecutions: calling URL:", url)

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `API error: ${response.status}`)
    }

    const executions = await response.json()
    console.log("[v0] getExecutions: Executions received:", executions.length)
    return executions
  } catch (error) {
    console.error("[v0] getExecutions: Error:", error)
    throw error
  }
}
