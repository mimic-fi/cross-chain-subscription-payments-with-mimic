'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { getBytecode } from '@wagmi/core'
import type { Chain } from '@/lib/chains'
import { EIP7702_SMART_ACCOUNT, SMART_ACCOUNT_ADDRESS } from '@/lib/constants'

export function useSmartAccountCheck(chain: Chain) {
  const { address, isConnected } = useAccount()
  const wagmiConfig = useConfig()

  const [isSmartAccount, setIsSmartAccount] = useState<boolean | null>(null)
  const [isSmartAccountLoading, setIsSmartAccountLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function check() {
      if (!isConnected || !address) {
        setIsSmartAccount(null)
        setIsSmartAccountLoading(false)
        return
      }

      setIsSmartAccountLoading(true)

      try {
        // First check if address matches the known smart account address
        const addressMatch = address.toLowerCase() === SMART_ACCOUNT_ADDRESS.toLowerCase()
        console.log('[v0] Connected address:', address)
        console.log('[v0] Smart account address:', SMART_ACCOUNT_ADDRESS)
        console.log('[v0] Address match:', addressMatch)

        if (addressMatch) {
          if (!cancelled) setIsSmartAccount(true)
          setIsSmartAccountLoading(false)
          return
        }

        // Then check bytecode
        const code = await getBytecode(wagmiConfig, { chainId: chain.id, address })
        console.log('[v0] Bytecode retrieved:', code)
        console.log('[v0] Expected bytecode:', EIP7702_SMART_ACCOUNT)
        const bytecodeMatch = !!code && code.toLowerCase() === EIP7702_SMART_ACCOUNT.toLowerCase()
        console.log('[v0] Bytecode match:', bytecodeMatch)
        if (!cancelled) setIsSmartAccount(bytecodeMatch)
      } catch (err) {
        console.error('Delegation check error', err)
        if (!cancelled) setIsSmartAccount(null)
      } finally {
        if (!cancelled) setIsSmartAccountLoading(false)
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [isConnected, address, chain, wagmiConfig])

  return { isSmartAccount, isSmartAccountLoading }
}
