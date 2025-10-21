import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Orai - Intelligent Cross-Chain Web3 Assistant',
  description: 'AI-powered chatbot for cross-chain transactions, analytics, and DeFi operations across multiple EVM networks.',
  keywords: ['Web3', 'Cross-chain', 'AI', 'DeFi', 'Blockchain', 'Ethereum', 'Polygon', 'Arbitrum'],
  authors: [{ name: 'Orai Team' }],
  openGraph: {
    title: 'Orai',
    description: 'Intelligent cross-chain chatbot for Web3 transactions',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
