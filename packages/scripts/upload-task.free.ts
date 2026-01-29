import { Chains, Client, EthersSigner, TriggerType } from '@mimicprotocol/sdk'

const TASK_TEMPLATE_CID = 'QmSWkfZiXY4697T1n82WMXVSPQBuFaJykYkdhFn2UBJpkH'
const PRIVATE_KEY_WALLET = '4196c5ccf0fc1b98ab8cf536a2c72e8eace5ba73b03d6df309dcf06827493ca7'
const WALLET = '0x96aAebbcBc6D91419Ea7EBf2977dc17e97D3c7C6'

const configs = [
  {
    sourceChain: Chains.Base,
    destinationChain: Chains.Base,
    amountIn: 1,
    recipient: '0x93eA260a11B45945a67E52Ea8B3CF4FBFbbd1393',
    slippage: 1,
    maxFee: 1,
  },
]

async function main(): Promise<void> {
  const client = new Client({
    signer: EthersSigner.fromPrivateKey(PRIVATE_KEY_WALLET),
  })

  // Get the manifest for the task
  const manifest = await client.tasks.getManifest(TASK_TEMPLATE_CID)

  await client.configs.signAndCreate({
    taskCid: TASK_TEMPLATE_CID,
    version: '1.0.1', // TODO: Update to match your task version
    description: `cross chain script subscription`,
    input: {
      sourceChain: Chains.Base,
      destinationChain: Chains.Base,
      amountIn: 1,
      recipient: '0x93eA260a11B45945a67E52Ea8B3CF4FBFbbd1393',
      slippage: 1,
      maxFee: 1,
    },
    trigger: {
      type: TriggerType.Cron,
      // Schedule: runs at minute X of hour 3 (03:XX) every day
      // TODO: Adjust schedule based on your needs
      schedule: `* 01 * * *`,
      delta: '10m', // Time window for execution
      endDate: 0, // 0 means no end date
    },
    manifest: manifest,
    signer: WALLET,
    executionFeeLimit: '0',
    minValidations: 1,
  })

  console.log(`Successfully created ${configs.length} config(s)`)
}

main().catch((error) => {
  console.error('Error creating configs:', error)
  process.exit(1)
})
