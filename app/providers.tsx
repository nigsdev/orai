'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, optimism, polygon, arbitrum, base, sepolia } from 'wagmi/chains'
import { defineChain } from 'viem'
import { Toaster } from '@/components/ui/toaster'
import { ChatbotBlockscoutProvider } from '@/components/BlockscoutIntegration'
import { http } from 'wagmi'

import '@rainbow-me/rainbowkit/styles.css'

// Define Arbitrum Sepolia chain
// Arbitrum Sepolia (custom) — wagmi exports arbitrumSepolia in newer versions,
// but define explicitly to avoid version mismatch
const arbitrumSepolia = defineChain({
  id: 421614,
  name: 'Arbitrum Sepolia',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
    public: { http: ['https://sepolia-rollup.arbitrum.io/rpc'] },
  },
  blockExplorers: {
    default: { name: 'Arbiscan', url: 'https://sepolia.arbiscan.io' },
  },
  testnet: true,
})

const config = getDefaultConfig({
  appName: 'Orai',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1f2e3d4c5b6a7980',
  chains: [mainnet, optimism, polygon, arbitrum, arbitrumSepolia, base],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
})

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ChatbotBlockscoutProvider>
            {children}
            <Toaster />
          </ChatbotBlockscoutProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
