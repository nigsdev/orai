"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { ChatWindow } from "@/components/ChatWindow"
import { SimpleWalletCard } from "@/components/SimpleWalletCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Zap, Shield, Globe } from "lucide-react"
import { motion } from "framer-motion"

export default function ChatPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Chat</h2>
          <p className="text-gray-400">
            Ask me anything about your transactions, assets, or DeFi activities.
          </p>
        </div>
        
        {/* Chat Interface */}
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

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass">
            <CardContent className="p-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Globe className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Cross-Chain</p>
                  <p className="text-xs text-gray-400">Bridge between networks</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Zap className="h-4 w-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">AI Powered</p>
                  <p className="text-xs text-gray-400">Natural language processing</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3"
              >
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Shield className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Secure</p>
                  <p className="text-xs text-gray-400">Audited smart contracts</p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
