"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import { useAccount } from "wagmi"

interface Subscription {
  id: string
  amount: string
  frequency: string
  recipient: string
  status: "active" | "paused"
  createdAt: string
}

export function SubscriptionsList() {
  const [currentSubscriptions, setCurrentSubscriptions] = useState<Subscription[]>([])
  const [pastSubscriptions, setPastSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const { address } = useAccount()

  useEffect(() => {
    if (address) {
      fetchSubscriptions()
    }
  }, [address])

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/subscription?address=${address}`)
      if (response.ok) {
        const data = await response.json()
        setCurrentSubscriptions(data.currentSubscriptions || [])
        setPastSubscriptions(data.pastSubscriptions || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching subscriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8 mt-8">
        <p className="text-sm text-muted-foreground">Loading subscriptions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Current Subscriptions */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Current Subscriptions</h2>
        {currentSubscriptions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No active subscriptions</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {currentSubscriptions.map((sub) => (
              <Card key={sub.id} className="p-4 border-primary/20 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{sub.amount} USDC</h3>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Frequency: {sub.frequency}</span>
                      <span>Recipient: {sub.recipient.slice(0, 10)}...{sub.recipient.slice(-4)}</span>
                    </div>
                  </div>
                  <a
                    href={`https://protocol.mimic.fi/configs/${sub.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Past Subscriptions */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Past Subscriptions</h2>
        {pastSubscriptions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No past subscriptions</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pastSubscriptions.map((sub) => (
              <Card key={sub.id} className="p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-sm">{sub.amount} USDC</h3>
                      <Badge variant="secondary" className="text-xs">Cancelled</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Frequency: {sub.frequency}</span>
                      <span>Created: {new Date(sub.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <a
                    href={`https://protocol.mimic.fi/configs/${sub.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
