import { NextRequest, NextResponse } from 'next/server'
import { parseQueryWithAI } from '@/lib/aiParser'
import { parseUserIntent, executeHederaOperation, getHederaBalance } from '@/lib/hederaAgent'
import { serverBlockscoutService } from '@/lib/server-blockscout'
import { executeCrossChainIntent } from '@/lib/avail'

export async function POST(request: NextRequest) {
  try {
    const { message, walletAddress, chainId } = await request.json()
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check if this is a Blockscout-related query
    if (isBlockscoutQuery(message)) {
      try {
        const blockscoutResponse = await handleBlockscoutQuery(message, walletAddress, chainId)
        
        return NextResponse.json({
          response: blockscoutResponse.message,
          status: blockscoutResponse.success ? 'success' : 'failed',
          metadata: {
            type: 'blockscout_query',
            data: blockscoutResponse.data,
            suggestions: blockscoutResponse.suggestions
          },
          suggestions: blockscoutResponse.suggestions,
          warnings: blockscoutResponse.error ? [blockscoutResponse.error] : []
        })
      } catch (error) {
        return NextResponse.json({
          response: `❌ Failed to process Blockscout query: ${error instanceof Error ? error.message : 'Unknown error'}`,
          status: 'failed',
          metadata: { type: 'blockscout_error' }
        })
      }
    }

    // Parse user intent using Hedera AgentKit
    const agentResponse = await parseUserIntent(message, walletAddress)
    
    // Generate AI response using OpenAI
    const aiResponse = await parseQueryWithAI(message, {
      walletAddress,
      currentChain: chainId,
    })

    let response = aiResponse.intent.response
    let transactionHash: string | undefined
    let status: 'pending' | 'success' | 'failed' | undefined
    let metadata: any = undefined

    // Execute action based on intent
    switch (agentResponse.intent.action) {
      case 'transfer':
        response = `I'll help you send ${agentResponse.intent.amount} ${agentResponse.intent.token}. Please provide the recipient address to complete the transfer.`
        metadata = {
          type: 'transfer',
          amount: agentResponse.intent.amount,
          token: agentResponse.intent.token,
        }
        break

      case 'bridge':
        if (agentResponse.intent.chainFrom && agentResponse.intent.chainTo) {
          try {
            const bridgeResult = await executeCrossChainIntent({
              chainFrom: agentResponse.intent.chainFrom,
              chainTo: agentResponse.intent.chainTo,
              token: agentResponse.intent.token || 'USDC',
              amount: agentResponse.intent.amount || '10',
              walletAddress: walletAddress || '0x0000000000000000000000000000000000000000',
            })
            
            transactionHash = bridgeResult.transactionHash
            status = bridgeResult.status
            
            if (bridgeResult.status === 'success') {
              response = `✅ **Bridge Successful!**\n\n` +
                `**Amount:** ${agentResponse.intent.amount} ${agentResponse.intent.token}\n` +
                `**Route:** ${getChainName(agentResponse.intent.chainFrom)} → ${getChainName(agentResponse.intent.chainTo)}\n` +
                `**Gas Cost:** ${bridgeResult.gasCost}\n` +
                `**Estimated Time:** ${bridgeResult.estimatedTime}\n` +
                `**Transaction:** ${bridgeResult.transactionHash.slice(0, 10)}...\n\n` +
                `Your tokens are being bridged and will arrive in approximately ${bridgeResult.estimatedTime}.`
            } else if (bridgeResult.status === 'pending') {
              response = `🔄 **Bridge Initiated**\n\n` +
                `**Amount:** ${agentResponse.intent.amount} ${agentResponse.intent.token}\n` +
                `**Route:** ${getChainName(agentResponse.intent.chainFrom)} → ${getChainName(agentResponse.intent.chainTo)}\n` +
                `**Status:** Processing...\n` +
                `**Transaction:** ${bridgeResult.transactionHash.slice(0, 10)}...\n\n` +
                `Your bridge transaction is being processed. You can track the progress above.`
            } else {
              response = `❌ **Bridge Failed**\n\n` +
                `The bridge operation could not be completed. Please try again or contact support.`
            }
            
            metadata = {
              type: 'bridge',
              amount: agentResponse.intent.amount,
              token: agentResponse.intent.token,
              fromChain: getChainName(agentResponse.intent.chainFrom),
              toChain: getChainName(agentResponse.intent.chainTo),
            }
          } catch (error) {
            response = `❌ **Bridge Failed**\n\n` +
              `**Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n\n` +
              `Please check your wallet connection and try again. Make sure you have sufficient balance and gas fees.`
            status = 'failed'
          }
        }
        break

      case 'stake':
        response = `I'll help you stake ${agentResponse.intent.amount} ${agentResponse.intent.token} for yield. Current APY is approximately 4-6%. Please confirm the staking pool and duration.`
        metadata = {
          type: 'stake',
          amount: agentResponse.intent.amount,
          token: agentResponse.intent.token,
        }
        break

      case 'analytics':
      case 'blockscout':
        if (walletAddress) {
          try {
            // Use Blockscout service for comprehensive analytics
            const analyticsResponse = await serverBlockscoutService.getWalletAnalytics(walletAddress, chainId || 1)
            
            if (analyticsResponse.success && analyticsResponse.data) {
              response = serverBlockscoutService.formatWalletAnalytics(analyticsResponse.data)
              metadata = {
                type: 'blockscout_analytics',
                address: walletAddress,
                chainId: chainId || 1,
                analytics: analyticsResponse.data
              }
            } else {
              response = analyticsResponse.message
              status = 'failed'
            }
          } catch (error) {
            response = `❌ Failed to fetch wallet analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
            status = 'failed'
          }
        } else {
          response = 'Please connect your wallet to view analytics.'
        }
        break

      case 'hedera_operation':
        try {
          const hederaResponse = await executeHederaOperation(message, {
            walletAddress,
            chainId
          })
          
          response = hederaResponse.response
          transactionHash = hederaResponse.executionResult?.transactionId
          status = hederaResponse.executionResult?.success ? 'success' : 'failed'
          
          metadata = {
            type: 'hedera_operation',
            operation: agentResponse.intent.hederaOperation?.type,
            details: hederaResponse.executionResult
          }
        } catch (error) {
          response = `❌ Failed to execute Hedera operation: ${error instanceof Error ? error.message : 'Unknown error'}`
          status = 'failed'
        }
        break

      default:
        response = aiResponse.intent.response
    }

    return NextResponse.json({
      response,
      transactionHash,
      chainId: agentResponse.intent.chainTo || chainId,
      status,
      metadata,
      suggestions: aiResponse.suggestions,
      warnings: aiResponse.warnings,
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { 
        response: 'Sorry, I encountered an error processing your request. Please try again.',
        status: 'failed'
      },
      { status: 500 }
    )
  }
}

function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    42161: 'Arbitrum',
    8453: 'Base',
  }
  return chains[chainId] || `Chain ${chainId}`
}

// Helper functions for Blockscout integration
function isBlockscoutQuery(message: string): boolean {
  const blockscoutKeywords = [
    'wallet-analytics', 'transaction-history', 'monitor-transaction',
    'show-transaction-history', 'supported-chains', 'parse-wallet',
    'parse-transaction', 'analytics', 'transactions', 'wallet',
    'address', 'hash', 'explorer', 'blockscout'
  ]
  
  const lowerMessage = message.toLowerCase()
  return blockscoutKeywords.some(keyword => lowerMessage.includes(keyword))
}

async function handleBlockscoutQuery(message: string, walletAddress?: string, chainId?: number): Promise<{
  success: boolean
  message: string
  data?: any
  suggestions?: string[]
  error?: string
}> {
  const lowerMessage = message.toLowerCase()
  
  // Extract wallet address from message if not provided
  const addressMatch = message.match(/0x[a-fA-F0-9]{40}/)
  const address = addressMatch?.[0] || walletAddress
  
  // Extract chain ID from message
  const chainMatch = message.match(/chain[:\s]*(\d+)/i)
  const targetChainId = chainMatch ? parseInt(chainMatch[1]) : (chainId || 1)
  
  // Handle different query types
  if (lowerMessage.includes('wallet-analytics') || lowerMessage.includes('analytics')) {
    if (!address) {
      return {
        success: false,
        message: 'Please provide a wallet address to analyze',
        suggestions: ['Provide an address like: wallet-analytics 0x1234...5678']
      }
    }
    
    const result = await serverBlockscoutService.getWalletAnalytics(address, targetChainId as any)
    if (result.success && result.data) {
      return {
        success: true,
        message: serverBlockscoutService.formatWalletAnalytics(result.data),
        data: result.data,
        suggestions: result.suggestions
      }
    } else {
      return result
    }
  }
  
  if (lowerMessage.includes('transaction-history') || lowerMessage.includes('transactions')) {
    if (!address) {
      return {
        success: false,
        message: 'Please provide a wallet address to view transactions',
        suggestions: ['Provide an address like: transaction-history 0x1234...5678']
      }
    }
    
    const limitMatch = message.match(/last\s+(\d+)/i)
    const limit = limitMatch ? parseInt(limitMatch[1]) : 5
    
    const result = await serverBlockscoutService.getTransactionHistory(address, targetChainId as any, limit)
    if (result.success && result.data) {
      return {
        success: true,
        message: serverBlockscoutService.formatTransactionHistory(result.data as any[]),
        data: result.data,
        suggestions: result.suggestions
      }
    } else {
      return result
    }
  }
  
  if (lowerMessage.includes('supported-chains')) {
    return {
      success: true,
      message: serverBlockscoutService.getSupportedChainsInfo(),
      suggestions: ['Use chain ID 1 for Ethereum', 'Use chain ID 137 for Polygon']
    }
  }
  
  // Default response for Blockscout queries
  return {
    success: true,
    message: `I can help you with wallet analytics and transaction history using Blockscout. Try:\n\n• "wallet-analytics 0x1234...5678" - Get comprehensive wallet analytics\n• "transaction-history 0x1234...5678" - View recent transactions\n• "supported-chains" - See supported networks`,
    suggestions: [
      'wallet-analytics <address>',
      'transaction-history <address>',
      'supported-chains'
    ]
  }
}
