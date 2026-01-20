"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pause, Play, X, Loader2 } from "lucide-react"
import { useAccount } from "wagmi"
import { useSignMessage } from "wagmi"
import { useToast } from "@/hooks/use-toast"

interface Subscription {
  id: string
  plan: string
  amount: string
  frequency: string
  nextBilling: string
  recipient: string
  status: "active" | "paused"
}

export function ActiveSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { toast } = useToast()

  useEffect(() => {
    if (address) {
      fetchActiveSubscription()
    }
  }, [address])

  const fetchActiveSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/subscription?address=${address}`)
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Subscription data:", data)
        
        // Get the first active subscription if available
        if (data.currentSubscriptions && data.currentSubscriptions.length > 0) {
          const activeSub = data.currentSubscriptions[0]
          setSubscription({
            id: activeSub.id,
            plan: "Subscription",
            amount: activeSub.amount,
            frequency: activeSub.frequency,
            nextBilling: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
            recipient: activeSub.recipient,
            status: "active",
          })
        }
      } else if (response.status !== 404) {
        console.error("[v0] Error fetching subscription, status:", response.status)
      }
    } catch (error) {
      console.error("[v0] Error fetching active subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseResume = async () => {
    if (!subscription) return

    setActionLoading(true)
    try {
      // Step 1: Get the deactivation message
      const messageResponse = await fetch(`/api/subscription/deactivate-message?configId=${subscription.id}`)
      if (!messageResponse.ok) {
        throw new Error("Failed to get deactivation message")
      }
      
      const { deactivateMessage } = await messageResponse.json()
      console.log("[v0] Got deactivation message")

      // Step 2: Sign the message with user's wallet
      const signature = await signMessageAsync({ message: deactivateMessage })
      console.log("[v0] Message signed")

      // Step 3: Send signed message to API
      const response = await fetch("/api/subscription/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          action: subscription.status === "active" ? "pause" : "resume",
          configId: subscription.id,
          deactivateSig: signature,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || "Failed to update subscription")
      }

      setSubscription({
        ...subscription,
        status: subscription.status === "active" ? "paused" : "active",
      })

      toast({
        title: subscription.status === "active" ? "Subscription paused" : "Subscription resumed",
        description: `Your subscription is now ${subscription.status === "active" ? "paused" : "active"}`,
      })
    } catch (error) {
      console.error("[v0] Error updating subscription:", error)
      toast({
        title: "Action failed",
        description: error instanceof Error ? error.message : "Could not update subscription status",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!subscription) return

    setActionLoading(true)
    try {
      // Step 1: Get the deactivation message
      const messageResponse = await fetch(`/api/subscription/deactivate-message?configId=${subscription.id}`)
      if (!messageResponse.ok) {
        throw new Error("Failed to get deactivation message")
      }
      
      const { deactivateMessage } = await messageResponse.json()
      console.log("[v0] Got deactivation message")

      // Step 2: Sign the message with user's wallet
      const signature = await signMessageAsync({ message: deactivateMessage })
      console.log("[v0] Message signed")

      // Step 3: Send signed message to API
      const response = await fetch("/api/subscription/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          action: "cancel",
          configId: subscription.id,
          deactivateSig: signature,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || "Failed to cancel subscription")
      }

      setSubscription(null)

      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled",
      })
    } catch (error) {
      console.error("[v0] Error cancelling subscription:", error)
      toast({
        title: "Cancellation failed",
        description: error instanceof Error ? error.message : "Could not cancel subscription",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }
      
  if (loading) {
    return (
      <Card className="p-6 mb-8 opacity-50">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading subscription status...</p>
        </div>
      </Card>
    )
  }

  if (!subscription) return null

  return (
    <Card className="p-6 mb-8 border-primary/20 bg-primary/5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold">{subscription.plan} Plan</h3>
            <Badge variant={subscription.status === "paused" ? "secondary" : "default"}>
              {subscription.status === "active" ? "Active" : "Paused"}
            </Badge>
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Amount: {subscription.amount} USDC</p>
            <p>Frequency: {subscription.frequency}</p>
            <p>Next billing: {subscription.nextBilling}</p>
            <p className="font-mono text-xs">Wallet: {subscription.recipient.slice(0, 10)}...{subscription.recipient.slice(-4)}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePauseResume}
            variant="outline"
            size="sm"
            className="gap-2 bg-transparent"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : subscription.status === "active" ? (
              <>
                <Pause className="w-4 h-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Resume
              </>
            )}
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive bg-transparent"
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
