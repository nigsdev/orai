'use client'

import { ChatWindow } from '@/components/ChatWindow'
import { SimpleWalletCard } from '@/components/SimpleWalletCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAccount } from 'wagmi'
import { useChatStore } from '@/lib/store'
import { Bot, Zap, Shield, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const { isConnected } = useAccount()
  const { wallet } = useChatStore()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Bot className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">Orai</h1>
              </div>
              <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                <span>Powered by</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded">Avail Nexus</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded">Hedera AgentKit</span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded">Blockscout MCP</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {wallet.isConnected && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Connected: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[calc(100vh-200px)]">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Assistant
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Ask me to send tokens, check analytics, or execute cross-chain transactions
                </p>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden">
                <ChatWindow />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Card */}
            <SimpleWalletCard />

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cross-Chain</p>
                    <p className="text-xs text-muted-foreground">Bridge between networks</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Powered</p>
                    <p className="text-xs text-muted-foreground">Natural language processing</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Secure</p>
                    <p className="text-xs text-muted-foreground">Audited smart contracts</p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Network Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ethereum</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Polygon</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Arbitrum</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Base</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Built for ETHGlobal with</span>
              <span className="text-primary">❤️</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Avail Nexus SDK</span>
              <span>•</span>
              <span>Hedera AgentKit</span>
              <span>•</span>
              <span>Blockscout MCP</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
