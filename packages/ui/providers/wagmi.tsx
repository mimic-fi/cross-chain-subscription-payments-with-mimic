"use client"

import type React from "react"

import { createConfig, http, WagmiProvider } from "wagmi"
import { base } from "wagmi/chains"
import { coinbaseWallet } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "Mimic Subscription App",
      preference: "all",
    }),
  ],
  transports: {
    [base.id]: http(),
  },
})

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
