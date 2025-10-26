/**
 * Blockscout Integration Component for Chatbot
 * 
 * This component provides the necessary providers and hooks for
 * integrating Blockscout SDK with your chatbot interface.
 */

'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { 
  NotificationProvider, 
  TransactionPopupProvider,
  useNotification,
  useTransactionPopup 
} from '@blockscout/app-sdk'
import { 
  chatbotBlockscout, 
  ChatbotWalletResponse, 
  ChatbotTransactionResponse,
  SupportedChainId 
} from '@/lib/chatbot-blockscout'

// Context for chatbot blockscout integration
interface ChatbotBlockscoutContextType {
  // Wallet Analytics
  getWalletAnalytics: (address: string, chainId?: SupportedChainId) => Promise<ChatbotWalletResponse>
  getTransactionHistory: (address: string, chainId?: SupportedChainId, limit?: number) => Promise<ChatbotWalletResponse>
  
  // Transaction Monitoring
  monitorTransaction: (chainId: SupportedChainId, txHash: string) => Promise<ChatbotTransactionResponse>
  showTransactionHistory: (chainId: SupportedChainId, address?: string) => ChatbotTransactionResponse
  
  // Utility Functions
  formatWalletAnalytics: (analytics: any) => string
  formatTransactionHistory: (transactions: any[]) => string
  getSupportedChainsInfo: () => string
  parseWalletInput: (input: string) => { address?: string; chainId?: SupportedChainId; error?: string }
  parseTransactionInput: (input: string) => { txHash?: string; chainId?: SupportedChainId; error?: string }
  
  // State
  isLoading: boolean
  lastError: string | null
}

const ChatbotBlockscoutContext = createContext<ChatbotBlockscoutContextType | null>(null)

// Provider component that wraps the Blockscout providers
export function ChatbotBlockscoutProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  // Wallet Analytics Functions
  const getWalletAnalytics = useCallback(async (address: string, chainId: SupportedChainId = 1): Promise<ChatbotWalletResponse> => {
    setIsLoading(true)
    setLastError(null)
    
    try {
      const result = await chatbotBlockscout.getWalletAnalytics(address, chainId)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setLastError(errorMessage)
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to fetch wallet analytics',
        suggestions: ['Try again later', 'Check address format']
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTransactionHistory = useCallback(async (address: string, chainId: SupportedChainId = 1, limit: number = 10): Promise<ChatbotWalletResponse> => {
    setIsLoading(true)
    setLastError(null)
    
    try {
      const result = await chatbotBlockscout.getTransactionHistory(address, chainId, limit)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setLastError(errorMessage)
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to fetch transaction history',
        suggestions: ['Try again later', 'Check address format']
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Transaction Monitoring Functions
  const monitorTransaction = useCallback(async (chainId: SupportedChainId, txHash: string): Promise<ChatbotTransactionResponse> => {
    setIsLoading(true)
    setLastError(null)
    
    try {
      const result = await chatbotBlockscout.monitorTransaction(chainId, txHash)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setLastError(errorMessage)
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to monitor transaction',
        suggestions: ['Check transaction hash', 'Try again later']
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const showTransactionHistory = useCallback((chainId: SupportedChainId, address?: string): ChatbotTransactionResponse => {
    try {
      return chatbotBlockscout.showTransactionHistoryPopup(chainId, address)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setLastError(errorMessage)
      return {
        success: false,
        error: errorMessage,
        message: 'Failed to show transaction history',
        suggestions: ['Try again later', 'Check if popup is blocked']
      }
    }
  }, [])

  // Utility Functions
  const formatWalletAnalytics = useCallback((analytics: any) => {
    return chatbotBlockscout.formatWalletAnalytics(analytics)
  }, [])

  const formatTransactionHistory = useCallback((transactions: any[]) => {
    return chatbotBlockscout.formatTransactionHistory(transactions)
  }, [])

  const getSupportedChainsInfo = useCallback(() => {
    return chatbotBlockscout.getSupportedChainsInfo()
  }, [])

  const parseWalletInput = useCallback((input: string) => {
    return chatbotBlockscout.parseWalletInput(input)
  }, [])

  const parseTransactionInput = useCallback((input: string) => {
    return chatbotBlockscout.parseTransactionInput(input)
  }, [])

  const contextValue: ChatbotBlockscoutContextType = {
    getWalletAnalytics,
    getTransactionHistory,
    monitorTransaction,
    showTransactionHistory,
    formatWalletAnalytics,
    formatTransactionHistory,
    getSupportedChainsInfo,
    parseWalletInput,
    parseTransactionInput,
    isLoading,
    lastError
  }

  return (
    <NotificationProvider>
      <TransactionPopupProvider>
        <ChatbotBlockscoutContext.Provider value={contextValue}>
          {children}
        </ChatbotBlockscoutContext.Provider>
      </TransactionPopupProvider>
    </NotificationProvider>
  )
}

// Hook to use the chatbot blockscout context
export function useChatbotBlockscout(): ChatbotBlockscoutContextType {
  const context = useContext(ChatbotBlockscoutContext)
  if (!context) {
    throw new Error('useChatbotBlockscout must be used within a ChatbotBlockscoutProvider')
  }
  return context
}

// Chatbot message handler component
export function ChatbotBlockscoutHandler() {
  const {
    getWalletAnalytics,
    getTransactionHistory,
    monitorTransaction,
    showTransactionHistory,
    formatWalletAnalytics,
    formatTransactionHistory,
    getSupportedChainsInfo,
    parseWalletInput,
    parseTransactionInput,
    isLoading,
    lastError
  } = useChatbotBlockscout()

  // This component can be used to handle chatbot messages
  // and provide blockscout functionality
  return null // This is just for the context, actual implementation would be in your chatbot
}

// Example usage component
export function BlockscoutChatbotExample() {
  const {
    getWalletAnalytics,
    getTransactionHistory,
    monitorTransaction,
    showTransactionHistory,
    formatWalletAnalytics,
    formatTransactionHistory,
    getSupportedChainsInfo,
    parseWalletInput,
    parseTransactionInput,
    isLoading,
    lastError
  } = useChatbotBlockscout()

  const [walletAddress, setWalletAddress] = useState('')
  const [chainId, setChainId] = useState<SupportedChainId>(1)
  const [result, setResult] = useState<string>('')

  const handleWalletAnalytics = async () => {
    if (!walletAddress) return
    
    const response = await getWalletAnalytics(walletAddress, chainId)
    if (response.success && response.data) {
      setResult(formatWalletAnalytics(response.data))
    } else {
      setResult(`Error: ${response.message}`)
    }
  }

  const handleTransactionHistory = async () => {
    if (!walletAddress) return
    
    const response = await getTransactionHistory(walletAddress, chainId, 10)
    if (response.success && response.data) {
      setResult(formatTransactionHistory(response.data as any[]))
    } else {
      setResult(`Error: ${response.message}`)
    }
  }

  const handleShowSupportedChains = () => {
    setResult(getSupportedChainsInfo())
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Blockscout Chatbot Integration</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Wallet Address:</label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="0x..."
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Chain ID:</label>
          <select
            value={chainId}
            onChange={(e) => setChainId(parseInt(e.target.value) as SupportedChainId)}
            className="w-full p-2 border rounded"
          >
            <option value={1}>Ethereum Mainnet (1)</option>
            <option value={137}>Polygon (137)</option>
            <option value={42161}>Arbitrum (42161)</option>
            <option value={10}>Optimism (10)</option>
            <option value={8453}>Base (8453)</option>
          </select>
        </div>
      </div>

      <div className="space-x-4 mb-6">
        <button
          onClick={handleWalletAnalytics}
          disabled={isLoading || !walletAddress}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Get Wallet Analytics
        </button>
        
        <button
          onClick={handleTransactionHistory}
          disabled={isLoading || !walletAddress}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Get Transaction History
        </button>
        
        <button
          onClick={handleShowSupportedChains}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
        >
          Show Supported Chains
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Loading...</p>
        </div>
      )}

      {lastError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {lastError}
        </div>
      )}

      {result && (
        <div className="bg-gray-100 border rounded p-4">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  )
}

