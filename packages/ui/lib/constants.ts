export const TASK_CID = process.env.NEXT_PUBLIC_INVEST_TASK_CID!
export const EIP7702_SMART_ACCOUNT = '0xef0100000000000000000000000000000000000000000000000000000000000000000000'
export const SMART_ACCOUNT_ADDRESS = '0x96aAebbcBc6D91419Ea7EBf2977dc17e97D3c7C6'

export const CHAINS = [
  { id: "10", name: "Optimism", logo: "https://cryptologos.cc/logos/optimism-ethereum-op-logo.png" },
  { id: "42161", name: "Arbitrum", logo: "https://cryptologos.cc/logos/arbitrum-arb-logo.png" },
  { id: "8453", name: "Base", logo: "https://base.org/images/logo.svg" },
]

export const transformConfig = (config: any) => ({
  id: config.sig,
  amount: config.input?.amountIn || "0",
  frequency: config.trigger?.schedule || "Every minute",
  recipient: config.input?.recipient || "0x...",
  sourceChain: String(config.input?.sourceChain) || "8453",
  destinationChain: String(config.input?.destinationChain) || "8453",
  status: "active",
  createdAt: config.createdAt || new Date().toISOString(),
})
