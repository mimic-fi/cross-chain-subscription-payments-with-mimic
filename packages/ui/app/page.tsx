import { SubscriptionPlans } from "@/components/subscription-plans"
import { ActiveSubscription } from "@/components/active-subscription"
import { TransactionViewer } from "@/components/transaction-viewer"
import { AlertCircle } from "lucide-react"
import Image from "next/image"
import { useAccount } from "wagmi"
import { useSmartAccountCheck } from "@/hooks/use-smart-account-check"
import { baseChain } from "@/lib/chains"
import { ConnectWallet } from "@/components/connect-wallet"

export default function Home() {
  const { address, isConnected } = useAccount()
  const { isSmartAccount, isSmartAccountLoading } = useSmartAccountCheck(baseChain)

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/mimic-logo.svg" alt="Mimic" width={120} height={30} />
            <span className="text-sm text-muted-foreground">SUBSCRIPTIONS</span>
          </div>
          <ConnectWallet />
        </header>

        {!isConnected && (
          <div className="mb-8 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive font-medium">
                This app can be used only for EIP-7702 delegated accounts.
              </p>
            </div>
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Connect your wallet to get started</p>
          </div>
        ) : isSmartAccountLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Checking account delegation...</p>
          </div>
        ) : !isSmartAccount ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-destructive font-medium">Your account is not EIP-7702 delegated</p>
            <p className="text-sm text-muted-foreground">Please use a delegated smart account to access this service</p>
          </div>
        ) : (
          <>
            <ActiveSubscription />
            <SubscriptionPlans />
            <TransactionViewer />
          </>
        )}

        <footer className="mt-12 pt-6 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            Powered by{" "}
            <a
              href="https://www.mimic.fi/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <Image src="/mimic-logo.svg" alt="Mimic" width={80} height={20} className="inline-block" />
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
