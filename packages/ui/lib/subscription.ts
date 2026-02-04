import { fp, Config, TriggerType } from '@mimicprotocol/sdk'
import { Chain } from '@/lib/chains'
import { Token } from '@/lib/tokens'
import sdk from '@/lib/sdk'
import { WagmiSigner } from '@/lib/wagmi-signer'
import { TASK_CID } from '@/lib/constants'
import { findCurrentConfig } from '@/lib/executions'

interface InvestParams {
  chain: Chain
  token: Token
  amount: string
  maxFee: string
  frequency: Frequency
  signer: WagmiSigner
}

interface DeactivateParams {
  config: Config
  signer: WagmiSigner
}

export const CRON_SCHEDULES = {
  minutely: '* * * * *',
  hourly: '0 * * * *',
  daily: '0 0 * * *',
  weekly: '0 0 * * 1', // Monday
  monthly: '0 0 1 * *', // 1st of every month
  quarterly: '0 0 1 */3 *', // Jan, Apr, Jul, Oct
  yearly: '0 0 1 1 *', // Jan 1st
} as const

export type Frequency = keyof typeof CRON_SCHEDULES

export function getFrequencyFromSchedule(schedule: string): Frequency | null {
  const entry = Object.entries(CRON_SCHEDULES).find(([, s]) => s === schedule)
  return entry ? (entry[0] as Frequency) : null
}

function bumpPatch(version: string): string {
  const [major = '0', minor = '0', patch = '0'] = version.split('.')
  return `${major}.${minor}.${Number(patch) + 1}`
}

export async function deactivate(params: DeactivateParams): Promise<Config> {
  const { config, signer } = params
  return sdk().configs.signAndDeactivate(config.sig, signer)
}

export async function invest(params: InvestParams): Promise<Config> {
  const { chain, token, amount, maxFee, frequency, signer } = params
  const description = `Invest ${amount} ${token.symbol} on ${chain.name} ${frequency}`
  const manifest = await sdk().tasks.getManifest(TASK_CID)
  const config = (await findCurrentConfig(signer.address)) || (await findCurrentConfig(signer.address, false))
  const version = config ? bumpPatch(config.version) : '0.0.1'
  return sdk().configs.signAndCreate(
    {
      taskCid: TASK_CID,
      version,
      manifest,
      description,
      trigger: {
        type: TriggerType.Cron,
        schedule: CRON_SCHEDULES[frequency],
        delta: '10m',
        endDate: 0,
      },
      input: {
        chainId: chain.id,
        token: token.address,
        amount,
        maxFee,
      },
      executionFeeLimit: fp(1).toString(),
      minValidations: 1,
    },
    signer
  )
}
