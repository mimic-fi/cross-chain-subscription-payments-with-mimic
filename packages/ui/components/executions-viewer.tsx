"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import { getExecutions } from "@/lib/get-executions"

interface ExecutionsViewerProps {
  signer: string
}

export function ExecutionsViewer({ signer }: ExecutionsViewerProps) {
  const [executions, setExecutions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchExecutions = async () => {
    try {
      setRefreshing(true)
      console.log("[v0] ExecutionsViewer: Refreshing executions for signer:", signer)

      if (!signer) {
        console.log("[v0] ExecutionsViewer: signer is empty, skipping fetch")
        setExecutions([])
        setError(null)
        setRefreshing(false)
        return
      }

      const data = await getExecutions(signer)
      console.log("[v0] ExecutionsViewer: data received:", data)
      setExecutions(data || [])
      setError(null)
    } catch (err) {
      console.error("[v0] ExecutionsViewer: Error:", err)
      setError(err instanceof Error ? err.message : "Failed to load executions")
      setExecutions([])
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchExecutions().then(() => setLoading(false))

    // Set up auto-refresh every 60 seconds
    const intervalId = setInterval(() => {
      console.log("[v0] ExecutionsViewer: Auto-refreshing executions")
      fetchExecutions()
    }, 60000) // 60 seconds

    return () => clearInterval(intervalId)
  }, [signer])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading executions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-4 px-4 rounded-lg border border-destructive/30 bg-destructive/5">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (executions.length === 0) {
    return (
      <div className="py-4 px-4 rounded-lg border border-border bg-muted/30 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">No executions yet</p>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchExecutions}
          disabled={refreshing}
          className="ml-2 bg-transparent"
        >
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "succeeded":
        return "bg-green-500/10 text-green-700 border-green-500/30"
      case "failed":
        return "bg-red-500/10 text-red-700 border-red-500/30"
      case "pending":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-500/30"
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date"
    const date = typeof timestamp === "string" ? new Date(timestamp) : new Date(timestamp * 1000)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-muted-foreground">Recent Executions ({executions.length})</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchExecutions}
          disabled={refreshing}
        >
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </div>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {executions.map((execution: any, index: number) => (
          <Card key={index} className="p-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={getStatusColor(execution.status || "unknown")}>
                    {execution.status || "unknown"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-mono text-foreground break-all">
                    {execution.transactionHash || "No tx"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(execution.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
