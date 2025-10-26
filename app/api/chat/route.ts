import { NextRequest, NextResponse } from 'next/server'
import { parseQueryWithAI } from '@/lib/aiParser'
import { parseUserIntent, executeHederaOperation, getHederaBalance } from '@/lib/hederaAgent'
import { getWalletAnalytics, getRecentTransactions, getTransactionDetails } from '@/lib/blockscout'
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
    let status: 'pending' | 'success' | 'failed' | 'submitted' | undefined
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
                `**Transaction:** ${bridgeResult.transactionHash?.slice(0, 10)}...\n\n` +
                `Your tokens are being bridged and will arrive in approximately ${bridgeResult.estimatedTime}.`
            } else if (bridgeResult.status === 'pending') {
              response = `🔄 **Bridge Initiated**\n\n` +
                `**Amount:** ${agentResponse.intent.amount} ${agentResponse.intent.token}\n` +
                `**Route:** ${getChainName(agentResponse.intent.chainFrom)} → ${getChainName(agentResponse.intent.chainTo)}\n` +
                `**Status:** Processing...\n` +
                `**Transaction:** ${bridgeResult.transactionHash?.slice(0, 10)}...\n\n` +
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
        // Extract wallet address from message if provided
        const analyticsAddressMatch = message.match(/0x[a-fA-F0-9]{40}/)
        const analyticsTargetAddress = analyticsAddressMatch ? analyticsAddressMatch[0] : walletAddress
        
        // Extract chain from message if mentioned
        let targetChainId = chainId || 1
        if (message.toLowerCase().includes('optimism') || message.toLowerCase().includes('op')) {
          targetChainId = 10
        } else if (message.toLowerCase().includes('polygon')) {
          targetChainId = 137
        } else if (message.toLowerCase().includes('arbitrum')) {
          targetChainId = 42161
        } else if (message.toLowerCase().includes('base')) {
          targetChainId = 8453
        } else if (message.toLowerCase().includes('ethereum') || message.toLowerCase().includes('eth')) {
          targetChainId = 1
        }
        
        if (analyticsTargetAddress) {
          try {
            const analytics = await getWalletAnalytics(analyticsTargetAddress, targetChainId)
            
            const chainName = getChainName(targetChainId)
            response = `📊 **Wallet Analytics for ${analyticsTargetAddress.slice(0, 6)}...${analyticsTargetAddress.slice(-4)} on ${chainName}**\n\n` +
              `**Balance:** ${analytics.wallet.balance} ETH\n` +
              `**Total Transactions:** ${analytics.wallet.transactionCount}\n` +
              `**Top Tokens:**\n` +
              (analytics.topTokens.length > 0 ? analytics.topTokens.map(token => 
                `• ${token.symbol}: ${token.balance} (${token.value})`
              ).join('\n') : '• No token holdings found') +
              `\n\n**Recent Activity:**\n` +
              (analytics.recentTransactions.length > 0 ? analytics.recentTransactions.slice(0, 5).map(tx => 
                `• ${new Date(tx.timestamp).toLocaleDateString()} - ${tx.method || 'transfer'} ${tx.value} ETH`
              ).join('\n') : '• No recent transactions found')
            
            // Add error info if available
            if (analytics.error) {
              response += `\n\n⚠️ **Note:** ${analytics.error}`
            }
            
            metadata = {
              type: 'analytics',
              targetAddress: analyticsTargetAddress,
              chainId: targetChainId,
            }
          } catch (error) {
            response = `❌ Failed to fetch wallet analytics: ${error instanceof Error ? error.message : 'Unknown error'}\n\n**Troubleshooting:**\n• Make sure the wallet address is valid\n• Try a different chain (Ethereum, Polygon, Arbitrum)\n• The wallet might not have activity on this chain`
            status = 'failed'
          }
        } else {
          response = 'Please provide a wallet address (0x...) or connect your wallet to view analytics.\n\n**Example:** "Show analytics for 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"'
        }
        break

      case 'transaction_history':
        // Extract wallet address from message if provided
        const addressMatch = message.match(/0x[a-fA-F0-9]{40}/)
        const targetAddress = addressMatch ? addressMatch[0] : walletAddress
        
        // Extract chain from message if mentioned
        let txChainId = chainId || 1
        if (message.toLowerCase().includes('optimism') || message.toLowerCase().includes('op')) {
          txChainId = 10
        } else if (message.toLowerCase().includes('polygon')) {
          txChainId = 137
        } else if (message.toLowerCase().includes('arbitrum')) {
          txChainId = 42161
        } else if (message.toLowerCase().includes('base')) {
          txChainId = 8453
        } else if (message.toLowerCase().includes('ethereum') || message.toLowerCase().includes('eth')) {
          txChainId = 1
        }
        
        if (targetAddress) {
          try {
            const transactions = await getRecentTransactions(targetAddress, txChainId, 20)
            const chainName = getChainName(txChainId)
            
            response = `📋 **Transaction History for ${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)} on ${chainName}**\n\n` +
              `**Recent Transactions (${transactions.length}):**\n` +
              (transactions.length > 0 ? transactions.map((tx, index) => 
                `${index + 1}. **${tx.method || 'transfer'}** - ${tx.value} ETH\n` +
                `   Hash: ${tx.hash.slice(0, 10)}...${tx.hash.slice(-8)}\n` +
                `   Status: ${tx.status} | Block: ${tx.blockNumber}\n` +
                `   Time: ${new Date(tx.timestamp).toLocaleString()}\n`
              ).join('\n') : '• No transactions found for this address on this chain') +
              `\n\n💡 **Tip:** Click on any transaction hash to view details in the explorer!`
            
            metadata = {
              type: 'transaction_history',
              transactions: transactions.slice(0, 5), // Include first 5 transactions in metadata
              targetAddress,
              chainId: txChainId,
            }
          } catch (error) {
            response = `❌ Failed to fetch transaction history: ${error instanceof Error ? error.message : 'Unknown error'}\n\n**Troubleshooting:**\n• Make sure the wallet address is valid\n• Try a different chain (Ethereum, Polygon, Arbitrum)\n• The wallet might not have activity on this chain`
            status = 'failed'
          }
        } else {
          response = 'Please provide a wallet address (0x...) or connect your wallet to view transaction history.\n\n**Example:** "Show transactions for 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"'
        }
        break

      case 'transaction_details':
        // Extract transaction hash from message
        const txHashMatch = message.match(/0x[a-fA-F0-9]{64}/)
        if (txHashMatch) {
          try {
            const txHash = txHashMatch[0]
            const txDetails = await getTransactionDetails(txHash, chainId || 1)
            response = `🔍 **Transaction Details**\n\n` +
              `**Hash:** ${txDetails.hash}\n` +
              `**Block:** ${txDetails.blockNumber}\n` +
              `**From:** ${txDetails.from}\n` +
              `**To:** ${txDetails.to}\n` +
              `**Value:** ${txDetails.value} ETH\n` +
              `**Gas Used:** ${txDetails.gasUsed}\n` +
              `**Gas Price:** ${txDetails.gasPrice}\n` +
              `**Status:** ${txDetails.status}\n` +
              `**Method:** ${txDetails.method || 'transfer'}\n` +
              `**Timestamp:** ${new Date(txDetails.timestamp).toLocaleString()}\n\n` +
              `💡 **Tip:** This transaction is now tracked with real-time updates!`
            
            metadata = {
              type: 'transaction_details',
              transaction: txDetails,
            }
          } catch (error) {
            response = `❌ Failed to fetch transaction details: ${error instanceof Error ? error.message : 'Unknown error'}`
            status = 'failed'
          }
        } else {
          response = 'Please provide a valid transaction hash (0x...) to get transaction details.'
        }
        break

      case 'wallet_summary':
        // Extract wallet address from message if provided
        const summaryAddressMatch = message.match(/0x[a-fA-F0-9]{40}/)
        const summaryTargetAddress = summaryAddressMatch ? summaryAddressMatch[0] : walletAddress
        
        if (summaryTargetAddress) {
          try {
            const [analytics, transactions] = await Promise.all([
              getWalletAnalytics(summaryTargetAddress, chainId || 1),
              getRecentTransactions(summaryTargetAddress, chainId || 1, 10)
            ])
            
            response = `👛 **Wallet Summary for ${summaryTargetAddress.slice(0, 6)}...${summaryTargetAddress.slice(-4)}**\n\n` +
              `**💰 Balance:** ${analytics.wallet.balance} ETH\n` +
              `**📊 Total Transactions:** ${analytics.wallet.transactionCount}\n` +
              `**🪙 Token Holdings:**\n` +
              analytics.wallet.tokenBalances.slice(0, 5).map(token => 
                `• ${token.symbol}: ${token.balance}`
              ).join('\n') +
              `\n\n**🔄 Recent Activity:**\n` +
              transactions.slice(0, 5).map(tx => 
                `• ${new Date(tx.timestamp).toLocaleDateString()} - ${tx.method || 'transfer'} ${tx.value} ETH (${tx.status})`
              ).join('\n') +
              `\n\n💡 **Tip:** Ask me to show transaction history or specific transaction details!`
            
            metadata = {
              type: 'wallet_summary',
              analytics,
              recentTransactions: transactions.slice(0, 3),
              targetAddress: summaryTargetAddress,
            }
          } catch (error) {
            response = `❌ Failed to fetch wallet summary: ${error instanceof Error ? error.message : 'Unknown error'}`
            status = 'failed'
          }
        } else {
          response = 'Please provide a wallet address (0x...) or connect your wallet to view wallet summary.\n\n**Example:** "Show wallet summary for 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"'
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
