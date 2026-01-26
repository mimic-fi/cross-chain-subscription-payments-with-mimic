"use client"

import type React from "react"

import WalletProvider from "./wagmi"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useMemo } from "react"

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), [])

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  )
}
