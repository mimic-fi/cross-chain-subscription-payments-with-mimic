"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CHAINS } from "@/lib/constants"
import Image from "next/image"

interface EditSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: {
    id: string
    destinationChain: string
    sourceChain: string
    amount: string
  } | null
  onUpdate: (newDestinationChain: string) => Promise<void>
}

export function EditSubscriptionDialog({
  open,
  onOpenChange,
  subscription,
  onUpdate,
}: EditSubscriptionDialogProps) {
  const [selectedChain, setSelectedChain] = useState(subscription?.destinationChain || "8453")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Sync selectedChain when subscription changes
  useEffect(() => {
    if (subscription?.destinationChain) {
      setSelectedChain(subscription.destinationChain)
    }
  }, [subscription?.destinationChain, open])

  const handleUpdate = async () => {
    if (!subscription || selectedChain === subscription.destinationChain) {
      toast({
        title: "No changes",
        description: "Select a different chain to update",
      })
      return
    }

    setIsLoading(true)
    try {
      await onUpdate(selectedChain)
      onOpenChange(false)
      toast({
        title: "Subscription updated",
        description: `Destination chain changed to ${CHAINS.find((c) => c.id === selectedChain)?.name}`,
      })
    } catch (error) {
      console.error("[v0] Error updating subscription:", error)
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update subscription",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!subscription) return null

  const getChainLogoUrl = (chainName: string) => {
    const logoUrls: { [key: string]: string } = {
      Base: "https://cryptologos.cc/logos/base-base-logo.png",
      Ethereum: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      Arbitrum: "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
      Polygon: "https://cryptologos.cc/logos/polygon-matic-logo.png",
      Avalanche: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
    }
    return logoUrls[chainName] || `https://cryptologos.cc/logos/${chainName.toLowerCase()}-logo.png`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Subscription Settings</DialogTitle>
          <DialogDescription>
            Adjust your subscription configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-base mb-3 block">Recipient Chain</Label>
            <div className="grid grid-cols-2 gap-2">
              {CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => setSelectedChain(chain.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    selectedChain === chain.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Image
                      src={getChainLogoUrl(chain.name) || "/placeholder.svg"}
                      alt={chain.name}
                      width={16}
                      height={16}
                      className="rounded-full"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        img.style.display = "none"
                      }}
                    />
                    <span className="font-medium text-sm">{chain.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Button
              onClick={handleUpdate}
              disabled={isLoading || selectedChain === subscription.destinationChain}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Subscription"
              )}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
