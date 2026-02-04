import { SubscriptionPlans } from "@/components/subscription-plans"
import { ExecutionsViewer } from "@/components/executions-viewer"
import Image from "next/image"
import { useAccount } from "wagmi"
import { ConnectWallet } from "@/components/connect-wallet"
import { TransactionViewer } from "@/components/transaction-viewer" // Added import for TransactionViewer

export default function Home() {
  const { address, isConnected } = useAccount()

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

        {!isConnected ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Connect your wallet to get started</p>
          </div>
        ) : (
          <>
            <SubscriptionPlans />
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Executions</h2>
              <ExecutionsViewer signer={address || ""} />
            </section>
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
