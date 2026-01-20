"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscribeDialog } from "./subscribe-dialog"

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

export function SubscriptionPlans() {
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSubscribe = (plan: (typeof plans)[0]) => {
    setSelectedPlan(plan)
    setDialogOpen(true)
  }

  return (
    <>
      <section className="mt-8">
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

      {selectedPlan && <SubscribeDialog open={dialogOpen} onOpenChange={setDialogOpen} plan={selectedPlan} />}
    </>
  )
}
