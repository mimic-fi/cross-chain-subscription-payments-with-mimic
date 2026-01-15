import {
  Arbitrum,
  Base,
  ChainId,
  environment,
  Ethereum,
  Gnosis,
  Optimism,
  SwapBuilder,
  Token,
  TokenAmount,
  TransferBuilder,
} from '@mimicprotocol/lib-ts'

import { inputs } from './types'

export default function main(): void {
  const context = environment.getContext()
  const sourceChain = inputs.sourceChain
  const destinationChain = inputs.destinationChain

  const tokenIn = getUsdc(sourceChain)
  const tokenAmountIn = TokenAmount.fromStringDecimal(tokenIn, inputs.amountIn)

  if (sourceChain == destinationChain) {
    const maxFee = TokenAmount.fromStringDecimal(tokenIn, inputs.maxFee)

    TransferBuilder.forChain(sourceChain)
      .addTransferFromTokenAmount(tokenAmountIn, inputs.recipient)
      .addUser(context.user)
      .addMaxFee(maxFee)
      .build()
      .send()
  } else {
    const tokenOut = getUsdc(destinationChain)
    const tokenAmountOut = TokenAmount.fromStringDecimal(tokenOut, inputs.amountIn)
    const maxFee = TokenAmount.fromStringDecimal(tokenOut, inputs.maxFee)
    const minAmountOut = tokenAmountOut.minus(maxFee)

    SwapBuilder.forChains(sourceChain, destinationChain)
      .addTokenInFromTokenAmount(tokenAmountIn)
      .addTokenOutFromTokenAmount(minAmountOut, inputs.recipient)
      .addUser(context.user)
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
