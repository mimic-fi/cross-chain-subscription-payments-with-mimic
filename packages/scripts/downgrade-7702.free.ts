import dotenv from 'dotenv'
import { ethers } from 'ethers'

dotenv.config()

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

async function main(): Promise<void> {
  const RPC_URL = process.env.RPC_URL
  if (!RPC_URL) throw new Error('Missing RPC_URL env variable')

  const PRIVATE_KEY = process.env.PRIVATE_KEY
  if (!PRIVATE_KEY) throw new Error('Missing PRIVATE_KEY env variable')

  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider)

  const codeBefore = await provider.getCode(wallet.address)
  const txNonce = await provider.getTransactionCount(wallet.address)

  const authorization = await wallet.authorize({
    address: ZERO_ADDRESS,
    nonce: txNonce + 1,
  })

  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: 0n,
    gasLimit: 1_000_000n,
    authorizationList: [authorization],
  })

  const receipt = await tx.wait()
  const codeAfter = await provider.getCode(wallet.address)

  console.log(`\ncodeBefore: ${codeBefore}`)
  console.log(`txHash: ${receipt?.hash}`)
  console.log(`codeAfter: ${codeAfter}`)
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
