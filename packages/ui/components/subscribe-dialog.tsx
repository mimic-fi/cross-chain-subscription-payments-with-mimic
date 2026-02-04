"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Settings } from "lucide-react"
import { TriggerConfig } from "./trigger-config"
import { useToast } from "@/hooks/use-toast"
import { useAccount } from "wagmi"
import { createSubscription } from "@/lib/create-subscription"
import Image from "next/image"
import { CHAINS } from "@/lib/constants"

interface SubscribeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: {
    name: string
    price: string
  }
}

export function SubscribeDialog({ open, onOpenChange, plan }: SubscribeDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [loadingBalance, setLoadingBalance] = useState(false)
  const { toast } = useToast()
  const { address } = useAccount()

  const [config, setConfig] = useState({
    sourceChain: "8453",
    destinationChain: "8453",
    amountIn: plan.price,
    recipient: "0x70b75Ea2C35208caf61777085bcaB9cfaD72f7f4",
    maxFee: "1",
  })
  const [trigger, setTrigger] = useState({
    cronSchedule: "0/1 * * * *",
    delta: "10",
  })

  // Fetch USDC balances when dialog opens or address changes
  useEffect(() => {
    if (open && address) {
      fetchBalances()
    }
  }, [open, address])

  const fetchBalances = async () => {
    setLoadingBalance(true)
    try {
      // Fetch USDC balance for each chain
      for (const chain of CHAINS) {
        // This is a placeholder - in production you'd use the actual RPC endpoints
        // For now, we'll show a loading state
        const balance = await getUSDCBalance(address!, chain.id)
        setBalances((prev) => ({ ...prev, [chain.id]: balance }))
      }
    } catch (error) {
      console.error("[v0] Error fetching balances:", error)
    } finally {
      setLoadingBalance(false)
    }
  }

  const getUSDCBalance = async (walletAddress: string, chainId: string): Promise<string> => {
    // Placeholder implementation - in production, use ethers.js or viem to read balance
    // from USDC contract for each chain
    try {
      // Mock balance for demo
      const mockBalances: Record<string, string> = {
        "8453": "10.5",
        "1": "5.2",
        "42161": "0",
        "137": "0",
        "43114": "0",
      }
      return mockBalances[chainId] || "0"
    } catch {
      return "0"
    }
  }

  const handleSubscribe = async () => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await createSubscription({
        trigger: {
          cronSchedule: trigger.cronSchedule,
          delta: trigger.delta,
        },
        config: {
          sourceChain: config.sourceChain,
          destinationChain: config.destinationChain,
          amountIn: config.amountIn,
          recipient: config.recipient,
          slippage: config.slippage,
          maxFee: config.maxFee,
        },
      })

      console.log("[v0] Subscription created:", result)

      toast({
        title: "Subscription created!",
        description: `You're now subscribed to ${plan.name}`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("[v0] Subscription error:", error)
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Failed to create subscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedChain = CHAINS.find((c) => c.id === config.sourceChain)
  const selectedBalance = balances[config.sourceChain] || "0"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Subscribe to {plan.name}</DialogTitle>
          <DialogDescription>Configure your subscription billing schedule</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source Chain Selector */}
          <div className="space-y-2">
            <Label htmlFor="sourceChain" className="text-xs font-semibold">
              Source Chain
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setConfig({ ...config, sourceChain: chain.id })}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    config.sourceChain === chain.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Image 
                      src={chain.logo || "/placeholder.svg"} 
                      alt={chain.name}
                      width={20}
                      height={20}
                      className="rounded-full"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const img = e.target as HTMLImageElement
                        img.style.display = 'none'
                      }}
                    />
                    <span className="font-medium text-sm">{chain.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {loadingBalance ? "Loading..." : `${balances[chain.id] || "0"} USDC`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <TriggerConfig
            cronSchedule={trigger.cronSchedule}
            delta={trigger.delta}
            onCronChange={useCallback((value: string) => {
              setTrigger((prev) => ({ ...prev, cronSchedule: value }))
            }, [])}
            onDeltaChange={useCallback(() => {
              // Delta never changes - always 10
            }, [])}
          />

          {/* Settings Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Advanced settings"
            >
              <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          </div>

          {/* Configuration Parameters - Hidden by default */}
          {showSettings && (
            <div className="space-y-4 p-4 rounded-lg border bg-muted/50">
              <h3 className="font-semibold text-sm">Advanced Configuration</h3>

              <div className="space-y-2">
                <Label className="text-xs">Recipient Chain</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CHAINS.map((chain) => (
                    <button
                      key={chain.id}
                      onClick={() => setConfig((prev) => ({ ...prev, destinationChain: chain.id }))}
                      className={`p-2 rounded-lg border-2 transition-all text-left flex flex-col items-center gap-1 ${
                        config.destinationChain === chain.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <Image
                        src={chain.logo || ""}
                        alt={chain.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <div className="font-medium text-xs">{chain.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-xs">
                  Recipient Address
                </Label>
                <Input
                  id="recipient"
                  value={config.recipient}
                  onChange={(e) => setConfig({ ...config, recipient: e.target.value })}
                  className="h-9 font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFee" className="text-xs">
                  Max Fee
                </Label>
                <Input
                  id="maxFee"
                  value={config.maxFee}
                  onChange={(e) => setConfig({ ...config, maxFee: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubscribe} className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Subscription"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
