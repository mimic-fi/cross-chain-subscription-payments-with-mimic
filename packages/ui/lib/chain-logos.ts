// Chain logos from cryptologos.cc
const CHAIN_LOGOS: Record<string, string> = {
  "1": "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  "56": "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  "137": "https://cryptologos.cc/logos/polygon-matic-logo.png",
  "43114": "https://cryptologos.cc/logos/avalanche-avax-logo.png",
  "250": "https://cryptologos.cc/logos/fantom-ftm-logo.png",
  "42161": "https://cryptologos.cc/logos/arbitrum-arb-logo.png",
  "10": "https://cryptologos.cc/logos/optimism-op-logo.png",
  "8453": "https://cryptologos.cc/logos/base-base-logo.png",
  "42170": "https://cryptologos.cc/logos/arbitrum-nova-logo.png",
}

const CHAIN_NAMES: Record<string, string> = {
  "1": "Ethereum",
  "56": "BSC",
  "137": "Polygon",
  "43114": "Avalanche",
  "250": "Fantom",
  "42161": "Arbitrum",
  "10": "Optimism",
  "8453": "Base",
  "42170": "Arbitrum Nova",
}

export function getChainLogo(chainId: string | number): string {
  return CHAIN_LOGOS[String(chainId)] || "https://cryptologos.cc/logos/ethereum-eth-logo.png"
}

export function getChainName(chainId: string | number): string {
  return CHAIN_NAMES[String(chainId)] || `Chain ${chainId}`
}
