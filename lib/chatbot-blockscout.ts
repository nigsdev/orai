/**
 * Chatbot Integration with Blockscout SDK
 * 
 * This module provides chatbot-friendly functions for wallet analytics
 * and transaction monitoring using the Blockscout SDK.
 */

import { blockscoutService, WalletAnalytics, TransactionData, SupportedChainId } from './blockscout'

export interface ChatbotWalletResponse {
  success: boolean
  data?: WalletAnalytics | TransactionData[]
  error?: string
  message: string
  suggestions?: string[]
}

export interface ChatbotTransactionResponse {
  success: boolean
  data?: {
    hash: string
    status: string
    explorerUrl: string
  }
  error?: string
  message: string
}

/**
 * Chatbot-friendly wallet analytics functions
 */
export class ChatbotBlockscoutIntegration {
  
  /**
   * Get wallet analytics for chatbot response
   */
  static async getWalletAnalytics(address: string, chainId: SupportedChainId): Promise<ChatbotWalletResponse> {
    try {
      // Validate address
      if (!blockscoutService.isValidAddress(address)) {
        return {
          success: false,
          error: 'Invalid wallet address format',
          message: 'Please provide a valid Ethereum address (0x...)',
          suggestions: [
            'Make sure the address starts with 0x',
            'Check that the address is 42 characters long',
            'Verify the address is from the correct network'
          ]
        }
      }

      // Validate chain ID
      const supportedChains = blockscoutService.getSupportedChains()
      if (!supportedChains[chainId]) {
        return {
          success: false,
          error: 'Unsupported chain ID',
          message: `Chain ID ${chainId} is not supported. Supported chains: ${Object.keys(supportedChains).join(', ')}`,
          suggestions: [
            'Use chain ID 1 for Ethereum Mainnet',
            'Use chain ID 137 for Polygon',
            'Use chain ID 42161 for Arbitrum',
            'Use chain ID 10 for Optimism'
          ]
        }
      }

      const analytics = await blockscoutService.getWalletAnalytics(address, chainId)
      
      return {
        success: true,
        data: analytics,
        message: `📊 Wallet Analytics for ${blockscoutService.formatAddress(address)} on ${supportedChains[chainId].name}`,
        suggestions: [
          'View transaction history',
          'Monitor new transactions',
          'Check token balances',
          'View on explorer'
        ]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch wallet analytics',
        suggestions: [
          'Check if the address exists on this network',
          'Try a different chain ID',
          'Verify your internet connection'
        ]
      }
    }
  }

  /**
   * Get transaction history for chatbot response
   */
  static async getTransactionHistory(address: string, chainId: SupportedChainId, limit: number = 10): Promise<ChatbotWalletResponse> {
    try {
      if (!blockscoutService.isValidAddress(address)) {
        return {
          success: false,
          error: 'Invalid wallet address format',
          message: 'Please provide a valid Ethereum address (0x...)',
          suggestions: ['Check address format', 'Ensure address starts with 0x']
        }
      }

      const transactions = await blockscoutService.getTransactionHistory(address, chainId, limit)
      
      return {
        success: true,
        data: transactions,
        message: `📋 Recent ${transactions.length} transactions for ${blockscoutService.formatAddress(address)}`,
        suggestions: [
          'View full transaction history',
          'Monitor new transactions',
          'Check specific transaction details'
        ]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch transaction history',
        suggestions: ['Try again later', 'Check network connection']
      }
    }
  }

  /**
   * Monitor transaction and show toast
   */
  static async monitorTransaction(chainId: SupportedChainId, txHash: string): Promise<ChatbotTransactionResponse> {
    try {
      // Validate transaction hash
      if (!txHash.startsWith('0x') || txHash.length !== 66) {
        return {
          success: false,
          error: 'Invalid transaction hash format',
          message: 'Please provide a valid transaction hash (0x...)',
          suggestions: ['Check hash format', 'Ensure hash is 66 characters long']
        }
      }

      await blockscoutService.showTransactionToast(chainId, txHash)
      const explorerUrl = blockscoutService.getExplorerUrl(chainId, 'tx', txHash)
      
      return {
        success: true,
        data: {
          hash: txHash,
          status: 'monitoring',
          explorerUrl
        },
        message: `🔍 Now monitoring transaction ${txHash.slice(0, 10)}...`,
        suggestions: [
          'View on explorer',
          'Check transaction status',
          'Monitor other transactions'
        ]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to monitor transaction',
        suggestions: ['Check transaction hash', 'Try again later']
      }
    }
  }

  /**
   * Show transaction history popup
   */
  static showTransactionHistoryPopup(chainId: SupportedChainId, address?: string): ChatbotTransactionResponse {
    try {
      blockscoutService.showTransactionHistory(chainId, address)
      
      return {
        success: true,
        message: address 
          ? `📋 Showing transaction history for ${blockscoutService.formatAddress(address)}`
          : `📋 Showing transaction history for chain ${chainId}`,
        suggestions: [
          'Filter by address',
          'View transaction details',
          'Export transaction data'
        ]
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to show transaction history',
        suggestions: ['Try again later', 'Check if popup is blocked']
      }
    }
  }

  /**
   * Format wallet analytics for chatbot display
   */
  static formatWalletAnalytics(analytics: WalletAnalytics): string {
    const chain = blockscoutService.getSupportedChains()[analytics.chainId]
    
    return `
📊 **Wallet Analytics**
📍 Address: ${analytics.address}
🌐 Network: ${chain.name}
📈 Total Transactions: ${analytics.totalTransactions}
💰 Total Volume: ${analytics.totalVolume} ${chain.symbol}
⛽ Gas Spent: ${analytics.gasSpent} ${chain.symbol}
📅 First TX: ${analytics.firstTransactionDate ? new Date(analytics.firstTransactionDate).toLocaleDateString() : 'N/A'}
📅 Last TX: ${analytics.lastTransactionDate ? new Date(analytics.lastTransactionDate).toLocaleDateString() : 'N/A'}

📤 **Transaction Types**
• Sent: ${analytics.transactionTypes.sent}
• Received: ${analytics.transactionTypes.received}
• Contract Interactions: ${analytics.transactionTypes.contractInteractions}

🏆 **Top Tokens**
${analytics.topTokens.slice(0, 5).map(token => 
  `• ${token.symbol}: ${token.volume} (${token.transactions} txs)`
).join('\n')}
    `.trim()
  }

  /**
   * Format transaction history for chatbot display
   */
  static formatTransactionHistory(transactions: TransactionData[]): string {
    if (transactions.length === 0) {
      return '📋 No transactions found for this address.'
    }

    return `
📋 **Recent Transactions** (${transactions.length})

${transactions.slice(0, 5).map((tx, index) => `
${index + 1}. **${tx.status === 'success' ? '✅' : '❌'} ${tx.hash.slice(0, 10)}...**
   📅 ${new Date(tx.timestamp).toLocaleDateString()}
   💰 ${tx.value} ETH
   ⛽ Gas: ${tx.gasUsed}
   🔗 [View on Explorer](${blockscoutService.getExplorerUrl(1, 'tx', tx.hash)})
`).join('\n')}

${transactions.length > 5 ? `\n... and ${transactions.length - 5} more transactions` : ''}
    `.trim()
  }

  /**
   * Get supported chains info for chatbot
   */
  static getSupportedChainsInfo(): string {
    const chains = blockscoutService.getSupportedChains()
    
    return `
🌐 **Supported Networks**

${Object.entries(chains).map(([id, chain]) => 
  `• **${chain.name}** (ID: ${id}) - ${chain.symbol}`
).join('\n')}

💡 Use the chain ID when requesting wallet analytics or transaction data.
    `.trim()
  }

  /**
   * Parse user input for wallet address and chain ID
   */
  static parseWalletInput(input: string): { address?: string; chainId?: SupportedChainId; error?: string } {
    const addressMatch = input.match(/0x[a-fA-F0-9]{40}/)
    const chainIdMatch = input.match(/chain[:\s]*(\d+)/i)
    
    const address = addressMatch?.[0]
    const chainId = chainIdMatch ? parseInt(chainIdMatch[1]) as SupportedChainId : undefined
    
    if (!address) {
      return { error: 'No valid wallet address found. Please provide an address starting with 0x' }
    }
    
    if (chainId && !blockscoutService.getSupportedChains()[chainId]) {
      return { error: `Unsupported chain ID: ${chainId}` }
    }
    
    return { address, chainId: chainId || 1 } // Default to Ethereum mainnet
  }

  /**
   * Parse user input for transaction hash
   */
  static parseTransactionInput(input: string): { txHash?: string; chainId?: SupportedChainId; error?: string } {
    const txMatch = input.match(/0x[a-fA-F0-9]{64}/)
    const chainIdMatch = input.match(/chain[:\s]*(\d+)/i)
    
    const txHash = txMatch?.[0]
    const chainId = chainIdMatch ? parseInt(chainIdMatch[1]) as SupportedChainId : undefined
    
    if (!txHash) {
      return { error: 'No valid transaction hash found. Please provide a hash starting with 0x' }
    }
    
    if (chainId && !blockscoutService.getSupportedChains()[chainId]) {
      return { error: `Unsupported chain ID: ${chainId}` }
    }
    
    return { txHash, chainId: chainId || 1 } // Default to Ethereum mainnet
  }
}

// Export for easy use in chatbot
export const chatbotBlockscout = ChatbotBlockscoutIntegration

