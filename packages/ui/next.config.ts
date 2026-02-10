import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    }
    config.externals = [...(config.externals || []), 'pino-pretty', 'encoding']
    return config
  },
}

export default nextConfig
