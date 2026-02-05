import { Chains, ONES_ADDRESS, OpType, ZERO_ADDRESS } from '@mimicprotocol/sdk'
import { runFunction, Swap, Transfer } from '@mimicprotocol/test-ts'
import { expect } from 'chai'

describe('Subscription Payment Function', () => {
  const buildDir = './build'

  const chainId = Chains.Optimism
  const context = {
    user: '0x756f45e3fa69347a9a973a725e3c98bc4db0b5a0',
    settlers: [{ address: '0xdcf1d9d12a0488dfb70a8696f44d6d3bc303963d', chainId }],
    timestamp: Date.now(),
  }

  describe('when the chain is supported', () => {
    const baseUsdc = '0x0b2c639c533813f4aa9d7837caf62653d097ff85'

    describe('when source and destination chain are the same', () => {
      const inputs = {
        sourceChain: chainId,
        destinationChain: chainId,
        amountIn: '1.5', // 1.5 USDC
        payer: ONES_ADDRESS,
        recipient: ZERO_ADDRESS,
        maxFee: '0.1',
      }

      it('produces the expected intents', async () => {
        const result = await runFunction(buildDir, context, { inputs })

        expect(result.success).to.be.true
        expect(result.timestamp).to.be.equal(context.timestamp)

        const intents = result.intents as Transfer[]
        expect(intents).to.have.lengthOf(1)

        expect(intents[0].op).to.be.equal(OpType.Transfer)
        expect(intents[0].settler).to.be.equal(context.settlers[0].address)
        expect(intents[0].user).to.be.equal(context.user)
        expect(intents[0].chainId).to.be.equal(inputs.sourceChain)
        expect(intents[0].maxFees).to.have.lengthOf(1)
        expect(intents[0].maxFees[0].token).to.be.equal(baseUsdc)

        expect(intents[0].transfers).to.have.lengthOf(1)
        expect(intents[0].transfers[0].token).to.be.equal(baseUsdc)
        expect(intents[0].transfers[0].recipient).to.be.equal(inputs.recipient)
      })
    })

    describe('when source an destination chain are different', () => {
      const inputs = {
        sourceChain: chainId,
        destinationChain: Chains.Base,
        amountIn: '1.5', // 1.5 USDC
        payer: ONES_ADDRESS,
        recipient: ZERO_ADDRESS,
        maxFee: '0.1',
      }

      it('produces the expected intents', async () => {
        const result = await runFunction(buildDir, context, { inputs })

        expect(result.success).to.be.true
        expect(result.timestamp).to.be.equal(context.timestamp)

        const intents = result.intents as Swap[]
        expect(intents).to.have.lengthOf(1)

        expect(intents[0].op).to.be.equal(OpType.Swap)
        expect(intents[0].settler).to.be.equal(context.settlers[0].address)
        expect(intents[0].user).to.be.equal(context.user)

        expect(intents[0].destinationChain).to.be.equal(Chains.Base)
        expect(intents[0].sourceChain).to.be.equal(Chains.Optimism)

        expect(intents[0].tokensIn).to.have.lengthOf(1)
        expect(intents[0].tokensIn[0].token).to.be.equal(baseUsdc)
        expect(intents[0].tokensIn[0].amount).to.be.equal('1500000')

        expect(intents[0].tokensOut).to.have.lengthOf(1)
        expect(intents[0].tokensOut[0].token).to.be.equal('0x833589fcd6edb6e08f4c7c32d4f71b54bda02913')
        expect(intents[0].tokensOut[0].minAmount).to.be.equal('1500000')
        expect(intents[0].tokensOut[0].recipient).to.be.equal(ZERO_ADDRESS)
      })
    })
  })

  describe('when the chain is not supported', () => {
    const inputs = {
      sourceChain: 0,
      destinationChain: Chains.Base,
      amountIn: '1.5', // 1.5 USDC
      payer: ONES_ADDRESS,
      recipient: ZERO_ADDRESS,
      maxFee: '0.1',
    }

    it('throws an error', async () => {
      const result = await runFunction(buildDir, context, { inputs })
      expect(result.success).to.be.false
      expect(result.intents).to.have.lengthOf(0)

      expect(result.logs).to.have.lengthOf(1)
      expect(result.logs[0]).to.include(`Invalid chain ${0}`)
    })
  })
})
