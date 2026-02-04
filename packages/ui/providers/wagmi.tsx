'use client'

import type React from 'react'

import { createConfig, http, WagmiProvider } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'

const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'Mimic Subscription App',
      preference: 'all',
    }),
  ],
  transports: {
    [base.id]: http(),
  },
})

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProvider config={config}>{children}</WagmiProvider>
}
