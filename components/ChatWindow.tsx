'use client'

import { useState, useRef, useEffect } from 'react'
import { useChatStore, Message } from '@/lib/store'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './Loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Bot, User, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function ChatWindow() {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { messages, isLoading, addMessage, setLoading, resetChat, wallet } = useChatStore()

  const scrollToBottom = (force = false) => {
    if (messagesEndRef.current) {
      // Use setTimeout to ensure DOM updates are complete
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: force ? 'auto' : 'smooth',
          block: 'end'
        })
      }, force ? 0 : 100)
    }
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Scroll to bottom when loading state changes
  useEffect(() => {
    if (isLoading) {
      scrollToBottom()
    }
  }, [isLoading])

  // Scroll to bottom on initial mount
  useEffect(() => {
    scrollToBottom(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    addMessage({
      content: userMessage,
      role: 'user',
    })

    // Force scroll to bottom after user message
    setTimeout(() => scrollToBottom(true), 50)

    // Set loading state
    setLoading(true)

    try {
      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: userMessage,
          walletAddress: wallet.address,
          chainId: wallet.chainId
        }),
      })

      const data = await response.json()

      // Add AI response
      addMessage({
        content: data.response,
        role: 'assistant',
        transactionHash: data.transactionHash,
        chainId: data.chainId,
        status: data.status,
        metadata: data.metadata,
      })

      // Force scroll to bottom after AI response
      setTimeout(() => scrollToBottom(true), 100)
    } catch (error) {
      console.error('Error sending message:', error)
      addMessage({
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        status: 'failed',
      })
      
      // Force scroll to bottom after error message
      setTimeout(() => scrollToBottom(true), 100)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleResetChat = () => {
    resetChat()
    // Force scroll to top after reset
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = 0
      }
    }, 100)
  }

  const quickActions = [
    {
      label: 'Send 10 USDC from Ethereum to Polygon',
      action: () => setInput('Send 10 USDC from Ethereum to Polygon'),
    },
    {
      label: 'Show my last 5 transactions on Arbitrum',
      action: () => setInput('Show my last 5 transactions on Arbitrum'),
    },
    {
      label: 'Stake my ETH for yield',
      action: () => setInput('Stake my ETH for yield'),
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 min-h-0"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex justify-start"
          >
            <Card className="bg-card border-0">
              <CardContent className="p-4">
                <TypingIndicator />
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-3 md:px-4 pb-2 flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.action}
                className="text-xs h-7 md:h-8 px-2 md:px-3"
              >
                <span className="hidden sm:inline">{action.label}</span>
                <span className="sm:hidden">{action.label.split(' ')[0]}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-3 md:p-4 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChat}
            className="text-xs h-6 md:h-7 px-2 md:px-3"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Reset Chat</span>
            <span className="sm:hidden">Reset</span>
          </Button>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {messages.length > 1 ? `${messages.length - 1} messages` : 'Fresh chat'}
          </span>
          <span className="text-xs text-muted-foreground sm:hidden">
            {messages.length > 1 ? `${messages.length - 1}` : '0'}
          </span>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-1.5 md:gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to send tokens, check analytics, or stake assets..."
            disabled={isLoading}
            className="flex-1 text-sm md:text-base"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-8 w-8 md:h-10 md:w-10"
          >
            <Send className="h-3 w-3 md:h-4 md:w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
