"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { useAccount } from "wagmi"

type Execution = {
  id: string
  type: string
  amount: string
  status: "success" | "pending" | "failed"
  timestamp: string
  hash: string
}

export function TransactionViewer() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const { address } = useAccount()

  useEffect(() => {
    if (address) {
      fetchExecutions()
    }
  }, [address])

  const fetchExecutions = async () => {
    setLoading(true)
    try {
      // Fetch executions from Mimic API
      const response = await fetch(`/api/executions?address=${address}`)
      if (response.ok) {
        const data = await response.json()
        setExecutions(data.executions || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching executions:", error)
      setExecutions([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Execution["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20"
    }
  }

  if (loading) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Executions</h2>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading executions...</p>
        </Card>
      </section>
    )
  }

  if (executions.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-6">Executions</h2>
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No executions registered yet</p>
        </Card>
      </section>
    )
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Executions</h2>
      <Card className="divide-y divide-border">
        {executions.map((execution) => (
          <div key={execution.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-medium">{execution.type}</h3>
                <Badge variant="outline" className={getStatusColor(execution.status)}>
                  {execution.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{new Date(execution.timestamp).toLocaleDateString()}</span>
                <span className="font-mono">{execution.hash}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold">{execution.amount}</span>
              <a
                href={`https://protocol.mimic.fi/intents/${execution.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </Card>
    </section>
  )
}
