import dotenv from 'dotenv'
import { ethers } from 'ethers'

dotenv.config()

// const SMART_ACCOUNT_ADDRESS = '0x93eA260a11B45945a67E52Ea8B3CF4FBFbbd1393'
const NEW_SMART_ACCOUNT = '0x4634a26fde6a69bE03b51fb0F9F3f62795050732'
const SMART_ACCOUNT_ADDRESS = NEW_SMART_ACCOUNT

async function main(): Promise<void> {
  const RPC_URL = process.env.RPC_URL
  if (!RPC_URL) throw new Error('Missing RPC_URL env variable')

  const PRIVATE_KEY = process.env.PRIVATE_KEY
  if (!PRIVATE_KEY) throw new Error('Missing PRIVATE_KEY env variable')

  const provider = new ethers.JsonRpcProvider(RPC_URL)
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
  const nonce = await provider.getTransactionCount(wallet.address)
  const authorization = await wallet.authorize({
    address: SMART_ACCOUNT_ADDRESS,
    nonce: nonce + 1,
  })

  const tx = await wallet.sendTransaction({
    to: wallet.address,
    value: 0,
    gasLimit: 1e6,
    authorizationList: [authorization],
  })
  const receipt = await tx.wait()
  console.log(`\n✅ Account upgraded successfully!: ${receipt!.hash}`)
}

main().catch(console.error)
