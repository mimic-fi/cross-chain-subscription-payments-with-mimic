"use client"

import type React from "react"

import WalletProvider from "./wagmi"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/toaster"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </WalletProvider>
  )
}
