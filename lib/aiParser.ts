/**
 * AI Parser Module
 * 
 * This module handles LLM integration for natural language processing
 * and intent parsing. It provides a chain-of-thought parser that converts
 * natural language queries into structured blockchain actions.
 * 
 * Key Features:
 * - OpenAI GPT integration
 * - Chain-of-thought reasoning
 * - Intent classification
 * - Response generation
 * - Error handling and fallbacks
 */

import OpenAI from 'openai'

export interface ParsedIntent {
  action: 'transfer' | 'bridge' | 'stake' | 'swap' | 'analytics' | 'query'
  parameters: Record<string, any>
  confidence: number
  reasoning: string
  response: string
}

export interface AIResponse {
  intent: ParsedIntent
  suggestions?: string[]
  warnings?: string[]
}

/**
 * Initialize OpenAI client
 */
function initializeOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    console.warn('OpenAI API key not found. Using mock responses.')
    return null
  }
  
  return new OpenAI({
    apiKey,
  })
}

/**
 * Parse user query using OpenAI GPT with chain-of-thought reasoning
 * 
 * @param query - User's natural language query
 * @param context - Additional context (wallet address, chain info, etc.)
 * @returns Promise<AIResponse> - Parsed intent and AI response
 */
export async function parseQueryWithAI(
  query: string,
  context: {
    walletAddress?: string
    currentChain?: number
    availableTokens?: string[]
  } = {}
): Promise<AIResponse> {
  const openai = initializeOpenAI()
  
  if (!openai) {
    // Fallback to mock response
    return generateMockResponse(query, context)
  }
  
  try {
    const systemPrompt = `
You are Orai, an intelligent assistant for cross-chain Web3 transactions. 
Your role is to parse user queries and convert them into structured blockchain actions.

Available actions:
- transfer: Send tokens to another address
- bridge: Move tokens between different blockchains
- stake: Stake tokens for yield
- swap: Exchange one token for another
- analytics: Get wallet information and transaction history
- blockscout: Use Blockscout SDK for wallet analytics, transaction history, and monitoring
- query: General questions or clarifications

        Available chains: Ethereum (1), Polygon (137), Arbitrum (42161), Base (8453)
        Common tokens: ETH, USDC, USDT, MATIC, WETH
        
        IMPORTANT: Bitcoin is NOT supported as it's not an EVM-compatible blockchain.
        For Bitcoin queries, explain that Blockscout only works with EVM chains.

Use chain-of-thought reasoning to:
1. Analyze the user's intent
2. Extract relevant parameters (amount, token, chains, etc.)
3. Determine the appropriate action
4. Generate a helpful response
5. Provide suggestions and warnings when appropriate

Respond in JSON format with this structure:
{
  "intent": {
    "action": "action_type",
    "parameters": {
      "amount": "string",
      "token": "string",
      "chainFrom": number,
      "chainTo": number,
      "recipientAddress": "string"
    },
    "confidence": 0.0-1.0,
    "reasoning": "step-by-step analysis",
    "response": "helpful response to user"
  },
  "suggestions": ["suggestion1", "suggestion2"],
  "warnings": ["warning1", "warning2"]
}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `User query: "${query}"\n\nContext: ${JSON.stringify(context)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    const parsed = JSON.parse(response)
    return parsed as AIResponse
  } catch (error) {
    console.error('Error parsing query with AI:', error)
    // Fallback to mock response
    return generateMockResponse(query, context)
  }
}

/**
 * Generate mock response for demo purposes
 */
function generateMockResponse(
  query: string,
  context: {
    walletAddress?: string
    currentChain?: number
    availableTokens?: string[]
  }
): AIResponse {
  const lowerQuery = query.toLowerCase()
  
  // Simple keyword-based parsing
  if (lowerQuery.includes('send') && lowerQuery.includes('usdc')) {
    const amountMatch = query.match(/(\d+(?:\.\d+)?)\s*usdc/i)
    const amount = amountMatch ? amountMatch[1] : '10'
    
    return {
      intent: {
        action: 'transfer',
        parameters: {
          amount,
          token: 'USDC',
          recipientAddress: null,
        },
        confidence: 0.9,
        reasoning: 'Detected transfer request with USDC token and amount specified',
        response: `I'll help you send ${amount} USDC. Please provide the recipient address.`,
      },
      suggestions: [
        'Enter recipient wallet address',
        'Choose network (Ethereum, Polygon, Arbitrum, Base)',
        'Review gas fees before confirming',
      ],
      warnings: [
        'Double-check the recipient address',
        'Ensure you have sufficient gas for the transaction',
      ],
    }
  }
  
  if (lowerQuery.includes('bridge') || (lowerQuery.includes('from') && lowerQuery.includes('to'))) {
    const amountMatch = query.match(/(\d+(?:\.\d+)?)\s*(usdc|usdt|eth|matic)/i)
    const amount = amountMatch ? amountMatch[1] : '10'
    const token = amountMatch ? amountMatch[2].toUpperCase() : 'USDC'
    
    return {
      intent: {
        action: 'bridge',
        parameters: {
          amount,
          token,
          chainFrom: 1, // Ethereum
          chainTo: 137, // Polygon
        },
        confidence: 0.85,
        reasoning: 'Detected cross-chain bridge request with source and destination chains',
        response: `I'll bridge ${amount} ${token} from Ethereum to Polygon. This will take approximately 2-5 minutes.`,
      },
      suggestions: [
        'Confirm bridge route and fees',
        'Set appropriate slippage tolerance',
        'Monitor transaction progress',
      ],
      warnings: [
        'Bridge transactions cannot be reversed',
        'Network congestion may affect timing',
        'Verify destination chain before bridging',
      ],
    }
  }
  
  if (lowerQuery.includes('stake') || lowerQuery.includes('yield')) {
    const amountMatch = query.match(/(\d+(?:\.\d+)?)\s*(eth|matic)/i)
    const amount = amountMatch ? amountMatch[1] : '1'
    const token = amountMatch ? amountMatch[2].toUpperCase() : 'ETH'
    
    return {
      intent: {
        action: 'stake',
        parameters: {
          amount,
          token,
        },
        confidence: 0.8,
        reasoning: 'Detected staking request for yield generation',
        response: `I'll help you stake ${amount} ${token} for yield. Current APY is approximately 4-6%.`,
      },
      suggestions: [
        'Choose staking pool or protocol',
        'Set staking duration',
        'Review yield projections and risks',
      ],
      warnings: [
        'Staking involves lock-up periods',
        'Yield rates may fluctuate',
        'Consider impermanent loss risks',
      ],
    }
  }
  
          if (lowerQuery.includes('bitcoin') || lowerQuery.includes('btc')) {
            return {
              intent: {
                action: 'query',
                parameters: {},
                confidence: 0.9,
                reasoning: 'Detected Bitcoin-related query - not supported by Blockscout',
                response: `I understand you're asking about Bitcoin, but I can only provide analytics for EVM-compatible blockchains like Ethereum, Polygon, Arbitrum, and Base. Bitcoin uses a different technology (UTXO model) and is not supported by Blockscout.\n\nFor Bitcoin analytics, you would need to use Bitcoin-specific tools like:\n• Blockstream Explorer\n• Blockchain.info\n• Mempool.space\n\nWould you like me to help you with analytics for any EVM-compatible chains instead?`,
              },
              suggestions: [
                'Check Ethereum wallet analytics',
                'View Polygon transaction history',
                'Analyze Arbitrum wallet balance',
                'Show Base network activity',
              ],
              warnings: [
                'Bitcoin is not supported by this platform',
                'Use Bitcoin-specific explorers for BTC data',
              ],
            }
          }
          
          if (lowerQuery.includes('transaction') || lowerQuery.includes('history') || lowerQuery.includes('analytics')) {
            return {
              intent: {
                action: 'analytics',
                parameters: {
                  limit: 5,
                  chain: context.currentChain || 1,
                },
                confidence: 0.95,
                reasoning: 'Detected request for wallet analytics and transaction history',
                response: `I'll fetch your transaction history and wallet analytics.`,
              },
              suggestions: [
                'View detailed transaction information',
                'Export transaction history',
                'Analyze spending patterns',
              ],
            }
          }
  
  // Default response for unrecognized queries
  return {
    intent: {
      action: 'query',
      parameters: {},
      confidence: 0.3,
      reasoning: 'Generic query - may need clarification',
      response: `I can help you with cross-chain transactions, wallet analytics, and DeFi operations. Could you be more specific about what you'd like to do?`,
    },
    suggestions: [
      'Send tokens between chains',
      'Check wallet balance and history',
      'Stake assets for yield',
      'Bridge tokens to another network',
    ],
  }
}

/**
 * Generate contextual suggestions based on user's wallet and history
 */
export function generateContextualSuggestions(
  walletAddress: string,
  recentTransactions: any[],
  tokenBalances: any[]
): string[] {
  const suggestions: string[] = []
  
  // Based on token balances
  if (tokenBalances.some(token => token.symbol === 'USDC' && parseFloat(token.balance) > 100)) {
    suggestions.push('Bridge USDC to another chain for better yields')
  }
  
  if (tokenBalances.some(token => token.symbol === 'ETH' && parseFloat(token.balance) > 1)) {
    suggestions.push('Stake your ETH for 4-6% APY')
  }
  
  // Based on recent activity
  const recentBridgeTxs = recentTransactions.filter(tx => 
    tx.method === 'bridge' || tx.tokenTransfers?.some((tt: any) => tt.type === 'bridge')
  )
  
  if (recentBridgeTxs.length === 0) {
    suggestions.push('Try cross-chain bridging for better liquidity')
  }
  
  // General suggestions
  suggestions.push('Check your transaction history for insights')
  suggestions.push('Optimize gas fees by choosing the right time')
  
  return suggestions.slice(0, 3) // Return top 3 suggestions
}

/**
 * Validate parsed intent parameters
 */
export function validateIntent(intent: ParsedIntent): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (intent.confidence < 0.5) {
    errors.push('Low confidence in intent parsing - please clarify your request')
  }
  
  if (intent.action === 'transfer' || intent.action === 'bridge') {
    if (!intent.parameters.amount || parseFloat(intent.parameters.amount) <= 0) {
      errors.push('Valid amount is required')
    }
    if (!intent.parameters.token) {
      errors.push('Token symbol is required')
    }
  }
  
  if (intent.action === 'bridge') {
    if (!intent.parameters.chainFrom || !intent.parameters.chainTo) {
      errors.push('Source and destination chains are required')
    }
    if (intent.parameters.chainFrom === intent.parameters.chainTo) {
      errors.push('Source and destination chains must be different')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
