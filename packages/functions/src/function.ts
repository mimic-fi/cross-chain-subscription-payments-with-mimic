import {
  Arbitrum,
  Base,
  BigInt,
  ChainId,
  Ethereum,
  Gnosis,
  Optimism,
  SwapBuilder,
  Token,
  TokenAmount,
  TransferBuilder,
} from '@mimicprotocol/lib-ts'

import { inputs } from './types'

const BPS_DENOMINATOR = BigInt.fromI32(10_000)

export default function main(): void {
  const slippageBps = BigInt.fromI32(inputs.slippageBps as i32)
  if (slippageBps.gt(BPS_DENOMINATOR)) throw new Error('Slippage must be between 0 and 100')

  const sourceChain = inputs.sourceChain
  const destinationChain = inputs.destinationChain

  const tokenIn = getUsdc(sourceChain)
  const tokenAmountIn = TokenAmount.fromStringDecimal(tokenIn, inputs.amountIn)

  if (sourceChain == destinationChain) {
    const maxFee = TokenAmount.fromStringDecimal(tokenIn, inputs.maxFee)

    TransferBuilder.forChain(sourceChain)
      .addTransferFromTokenAmount(tokenAmountIn, inputs.recipient)
      .addMaxFee(maxFee)
      .build()
      .send()
  } else {
    const tokenOut = getUsdc(destinationChain)
    const tokenAmountOut = TokenAmount.fromStringDecimal(tokenOut, inputs.amountIn)
    const minAmountOut = tokenAmountOut.applySlippageBps(inputs.slippageBps as i32)

    SwapBuilder.forChains(sourceChain, destinationChain)
      .addTokenInFromTokenAmount(tokenAmountIn)
      .addTokenOutFromTokenAmount(minAmountOut, inputs.recipient)
      .build()
      .send()
  }
}

function getUsdc(chainId: i32): Token {
  if (chainId == ChainId.ARBITRUM) return Arbitrum.USDC
  if (chainId == ChainId.BASE) return Base.USDC
  if (chainId == ChainId.ETHEREUM) return Ethereum.USDC
  if (chainId == ChainId.OPTIMISM) return Optimism.USDC
  if (chainId == ChainId.GNOSIS) return Gnosis.USDC
  throw new Error(`Invalid chain ${chainId}`)
}
