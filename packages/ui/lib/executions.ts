import { Config } from '@mimicprotocol/sdk'
import sdk from '@/lib/sdk'
import { TASK_CID } from '@/lib/constants'

export interface Execution {
  description: string
  createdAt: Date
  result: string
  url: string
}

export async function findCurrentConfig(signer: string, active = true): Promise<Config | null> {
  const configs = await sdk().configs.get({ signer, active, taskCid: TASK_CID, offset: 0, limit: 1 })
  return configs.length == 1 ? configs[0] : null
}

export async function findExecutions(signer: string): Promise<Execution[]> {
  const config = (await findCurrentConfig(signer)) || (await findCurrentConfig(signer, false))
  if (!config) return []

  const executions = await sdk().executions.get({ configSig: config.sig })
  return Promise.all(
    executions.map(async (execution) => {
      const output = execution.outputs[0]
      const intent = await sdk().intents.getByHash(output.hash)
      return {
        description: config.description,
        createdAt: execution.createdAt,
        result: intent.status,
        url: `https://protocol.mimic.fi/intents/${intent.hash}`,
      }
    })
  )
}
