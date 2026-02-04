"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SubscribeDialog } from "./subscribe-dialog"
import { EditSubscriptionDialog } from "./edit-subscription-dialog"
import { ExecutionsViewer } from "./executions-viewer"
import { useAccount } from "wagmi"
import { Loader2, Pause, Play, X, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { deactivateSubscription } from "@/lib/deactivate-subscription"
import { reactivateSubscription } from "@/lib/reactivate-subscription"
import { cancelSubscription } from "@/lib/cancel-subscription"
import { CHAINS } from "@/lib/constants"

const plans = [
  {
    name: "Starter",
    price: "1",
  },
  {
    name: "Professional",
    price: "1.2",
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "1.5",
  },
]

interface Subscription {
  id: string
  amount: string
  frequency: string
  recipient: string
  sourceChain: string
  destinationChain: string
  status: "active" | "paused"
  createdAt: string
}

export function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { address } = useAccount()
  const { toast } = useToast()

  useEffect(() => {
    console.log("[v0] SubscriptionPlans: address available:", address)
    if (address) {
      fetchSubscriptions()
    }
  }, [address])

  const fetchSubscriptions = async () => {
    if (!address) return
    setLoading(true)
    try {
      const response = await fetch(`/api/subscription?address=${address}`)
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.currentSubscriptions || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching subscriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getFrequencyLabel = (cron: string) => {
    if (cron.includes("0/1")) return "Every minute"
    if (cron.includes("0/5")) return "Every 5 minutes"
    if (cron.includes("0/10")) return "Every 10 minutes"
    if (cron === "0 * * * *") return "Hourly"
    if (cron === "0 0 * * *") return "Daily"
    if (cron === "0 0 * * 0") return "Weekly"
    return cron
  }

  const getPlanName = (amountIn: string) => {
    if (amountIn === "1") return "Starter"
    if (amountIn === "1.2") return "Professional"
    if (amountIn === "1.5") return "Enterprise"
    return "Custom"
  }

  const getChainName = (chainId: string) => {
    return CHAINS.find((c) => c.id === chainId)?.name || `Chain ${chainId}`
  }

  const handleEditClick = (sub: Subscription) => {
    setEditingSubscription(sub)
    setEditDialogOpen(true)
  }

  const handleUpdateDestinationChain = async (newChainId: string) => {
    if (!editingSubscription) return
    
    setActionLoading(true)
    try {
      setSubscriptions(
        subscriptions.map((s) =>
          s.id === editingSubscription.id ? { ...s, destinationChain: newChainId } : s
        )
      )
    } catch (error) {
      console.error("[v0] Error updating subscription:", error)
      throw error
    } finally {
      setActionLoading(false)
    }
  }

  const handlePause = async (subscriptionId: string) => {
    setActionLoading(true)
    try {
      await deactivateSubscription(subscriptionId)
      setSubscriptions(
        subscriptions.map((s) =>
          s.id === subscriptionId ? { ...s, status: "paused" as const } : s
        )
      )
      toast({
        title: "Subscription paused",
        description: "Your subscription has been paused. You can reactivate it anytime.",
      })
    } catch (error) {
      console.error("[v0] Error pausing subscription:", error)
      toast({
        title: "Pause failed",
        description: error instanceof Error ? error.message : "Could not pause subscription",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivate = async (subscriptionId: string) => {
    setActionLoading(true)
    try {
      await reactivateSubscription(subscriptionId)
      setSubscriptions(
        subscriptions.map((s) =>
          s.id === subscriptionId ? { ...s, status: "active" as const } : s
        )
      )
      toast({
        title: "Subscription reactivated",
        description: "Your subscription is now active again.",
      })
    } catch (error) {
      console.error("[v0] Error reactivating subscription:", error)
      toast({
        title: "Reactivation failed",
        description: error instanceof Error ? error.message : "Could not reactivate subscription",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubscribe = (plan: (typeof plans)[0]) => {
    setSelectedPlan(plan)
    setDialogOpen(true)
  }

  const handleCancel = async (subscriptionId: string) => {
    setActionLoading(true)
    try {
      await cancelSubscription(subscriptionId)
      setSubscriptions(subscriptions.filter((s) => s.id !== subscriptionId))
      toast({
        title: "Subscription cancelled",
        description: "Your subscription has been cancelled.",
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

  const onDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      // Refresh subscriptions after dialog closes (subscription created)
      fetchSubscriptions()
    }
  }

  return (
    <>
      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Your Active Subscriptions</h2>
          <div className="space-y-3">
            {subscriptions.map((sub) => {
              const planName = getPlanName(sub.amount)
              return (
                <Card key={sub.id} className="p-4 border-primary/20 bg-primary/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{planName} Plan</h3>
                        <Badge variant={sub.status === "active" ? "default" : "outline"}>
                          {sub.status}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <p>Amount: {sub.amount} USDC</p>
                        <p>Frequency: {getFrequencyLabel(sub.frequency)}</p>
                        <p>From: {getChainName(sub.sourceChain)} → To: {getChainName(sub.destinationChain)}</p>
                        <p>Recipient: {sub.recipient.slice(0, 10)}...{sub.recipient.slice(-4)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleEditClick(sub)}
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        disabled={actionLoading}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      {sub.status === "active" ? (
                        <Button
                          onClick={() => handlePause(sub.id)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Pause className="w-4 h-4" />
                              Pause
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleReactivate(sub.id)}
                          variant="default"
                          size="sm"
                          className="gap-2"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Reactivate
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        onClick={() => handleCancel(sub.id)}
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        disabled={actionLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Available Plans */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.name} className={`p-6 ${plan.recommended ? "border-primary shadow-md" : "border-border"}`}>
              {plan.recommended && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Recommended
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold mb-3">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">USDC</span>
              </div>

              <Button
                onClick={() => handleSubscribe(plan)}
                className="w-full"
                variant={plan.recommended ? "default" : "outline"}
              >
                Subscribe
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {selectedPlan && <SubscribeDialog open={dialogOpen} onOpenChange={onDialogClose} plan={selectedPlan} />}
      {editingSubscription && (
        <EditSubscriptionDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          subscription={editingSubscription}
          onUpdate={handleUpdateDestinationChain}
        />
      )}
    </>
  )
}
