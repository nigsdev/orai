import { NextRequest, NextResponse } from 'next/server'
import { parseQueryWithAI } from '@/lib/aiParser'
import { parseUserIntent, executeHederaOperation, getHederaBalance } from '@/lib/hederaAgent'
import { getWalletAnalytics } from '@/lib/blockscout'
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
        if (walletAddress) {
          try {
            const analytics = await getWalletAnalytics(walletAddress, chainId || 1)
            response = `📊 **Wallet Analytics for ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}**\n\n` +
              `**Balance:** ${analytics.wallet.balance} ETH\n` +
              `**Total Transactions:** ${analytics.wallet.transactionCount}\n` +
              `**Top Tokens:**\n` +
              analytics.topTokens.map(token => 
                `• ${token.symbol}: ${token.balance} (${token.value})`
              ).join('\n') +
              `\n\n**Recent Activity:**\n` +
              analytics.recentTransactions.slice(0, 3).map(tx => 
                `• ${new Date(tx.timestamp).toLocaleDateString()} - ${tx.method || 'transfer'} ${tx.value} ETH`
              ).join('\n')
            
            metadata = {
              type: 'analytics',
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
