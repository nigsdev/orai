'use client'

import { useState, useEffect } from 'react'
import { Message } from '@/lib/store'
import { formatAddress, getChainName, getChainIcon } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface MessageBubbleProps {
  message: Message
}

// Client-side only timestamp component to prevent hydration mismatches
function ClientTimestamp({ timestamp }: { timestamp: Date | string }) {
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  if (!isClient) {
    return <span>--:--:-- --</span> // Placeholder during SSR
  }
  
  return <span>{new Date(timestamp).toLocaleTimeString()}</span>
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  const getStatusIcon = () => {
    switch (message.status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (message.status) {
      case 'success':
        return 'Executed'
      case 'failed':
        return 'Failed'
      case 'pending':
        return 'Pending'
      default:
        return ''
    }
  }

  const getExplorerUrl = () => {
    if (!message.transactionHash || !message.chainId) return null
    
    const explorers: Record<number, string> = {
      1: 'https://etherscan.io/tx/',
      137: 'https://polygonscan.com/tx/',
      42161: 'https://arbiscan.io/tx/',
      8453: 'https://basescan.org/tx/',
    }
    
    return explorers[message.chainId] + message.transactionHash
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-[85%] sm:max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <Card className={`${isUser ? 'bg-primary text-primary-foreground' : 'bg-card'} border-0`}>
          <CardContent className="p-3 md:p-4">
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </div>
            
            {/* Transaction metadata */}
            {isAssistant && message.metadata && (
              <div className="mt-3 pt-3 border-t border-border/20">
                <div className="flex items-center gap-2 text-xs opacity-80">
                  {message.metadata.type === 'transfer' && (
                    <>
                      <span>💸</span>
                      <span>
                        {message.metadata.amount} {message.metadata.token}
                      </span>
                      {message.metadata.fromChain && message.metadata.toChain && (
                        <>
                          <span>→</span>
                          <span>
                            {getChainIcon(1)} {message.metadata.fromChain} to {getChainIcon(137)} {message.metadata.toChain}
                          </span>
                        </>
                      )}
                    </>
                  )}
                  {message.metadata.type === 'analytics' && (
                    <>
                      <span>📊</span>
                      <span>Wallet Analytics</span>
                    </>
                  )}
                  {message.metadata.type === 'stake' && (
                    <>
                      <span>🥩</span>
                      <span>Staking Operation</span>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Transaction status and hash */}
            {isAssistant && (message.transactionHash || message.status) && (
              <div className="mt-3 pt-3 border-t border-border/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="text-xs opacity-80">
                      {getStatusText()}
                      {message.chainId && (
                        <span className="ml-1">
                          on {getChainIcon(message.chainId)} {getChainName(message.chainId)}
                        </span>
                      )}
                    </span>
                  </div>
                  
                  {message.transactionHash && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono opacity-60">
                        {formatAddress(message.transactionHash)}
                      </span>
                      {getExplorerUrl() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          onClick={() => {
                            const url = getExplorerUrl()
                            if (url) window.open(url, '_blank')
                          }}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <ClientTimestamp timestamp={message.timestamp} />
        </div>
      </div>
    </motion.div>
  )
}
