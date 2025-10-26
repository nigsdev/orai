/**
 * Hedera AgentKit Integration
 * 
 * This module integrates with the actual Hedera AgentKit for AI-powered transaction reasoning
 * and autonomous agent operations. It handles natural language processing,
 * intent parsing, and structured transaction generation using LangChain and Hedera SDK.
 * 
 * Key Features:
 * - Real Hedera AgentKit integration with LangChain
 * - AI agent reasoning for complex DeFi operations
 * - Autonomous transaction execution
 * - Multiple AI provider support (OpenAI, Claude, Groq, Ollama)
 * - Hedera network operations (HBAR transfers, token operations, etc.)
 */

import { AgentMode, HederaLangchainToolkit } from 'hedera-agent-kit'
import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { ChatGroq } from '@langchain/groq'
import { ChatOllama } from '@langchain/ollama'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents'
import { BufferMemory } from 'langchain/memory'
import { Client, PrivateKey } from '@hashgraph/sdk'
import { coreQueriesPlugin, coreAccountPlugin, coreTokenPlugin, coreConsensusPlugin } from 'hedera-agent-kit'

export interface AgentMessage {
  id: string
  type: 'user_query' | 'agent_response' | 'transaction_intent'
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface TransactionIntent {
  action: 'transfer' | 'bridge' | 'stake' | 'swap' | 'analytics' | 'query' | 'hedera_operation' | 'transaction_history' | 'transaction_details' | 'wallet_summary'
  chainFrom?: number
  chainTo?: number
  token?: string
  amount?: string
  recipientAddress?: string
  walletAddress?: string
  parameters?: Record<string, any>
  confidence: number
  reasoning: string
  hederaOperation?: {
    type: 'transfer_hbar' | 'create_token' | 'transfer_token' | 'create_topic' | 'submit_message'
    details: Record<string, any>
  }
}

export interface AgentResponse {
  intent: TransactionIntent
  response: string
  suggestions?: string[]
  warnings?: string[]
  executionResult?: {
    success: boolean
    transactionId?: string
    error?: string
  }
}

/**
 * Create LLM instance based on available API keys
 */
function createLLM() {
  // Option 1: OpenAI (requires OPENAI_API_KEY in .env)
  if (process.env.OPENAI_API_KEY) {
    return new ChatOpenAI({ 
      model: 'gpt-4o-mini',
      temperature: 0.3,
    })
  }
  
  // Option 2: Anthropic Claude (requires ANTHROPIC_API_KEY in .env)
  if (process.env.ANTHROPIC_API_KEY) {
    return new ChatAnthropic({ 
      model: 'claude-3-haiku-20240307',
      temperature: 0.3,
    })
  }
  
  // Option 3: Groq (requires GROQ_API_KEY in .env)
  if (process.env.GROQ_API_KEY) {
    return new ChatGroq({ 
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
    })
  }
  
  // Option 4: Ollama (free, local - requires Ollama installed and running)
  try {
    return new ChatOllama({ 
      model: 'llama3.2',
      baseUrl: 'http://localhost:11434',
      temperature: 0.3,
    })
  } catch (e) {
    throw new Error('No AI provider available')
  }
}

/**
 * Initialize Hedera AgentKit with real implementation
 */
export function initializeHederaAgent() {
  try {
    // Check for required environment variables
    if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
      return null
    }

    // Initialize AI model
    const llm = createLLM()

    // Hedera client setup (Testnet by default)
    const client = Client.forTestnet().setOperator(
      process.env.HEDERA_ACCOUNT_ID,
      PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY),
    )

    // Prepare Hedera toolkit with core plugins
    const hederaAgentToolkit = new HederaLangchainToolkit({
      client,
      configuration: {
        tools: [], // Load all available tools
        context: {
          mode: AgentMode.AUTONOMOUS, // Execute transactions autonomously
        },
        plugins: [
          coreQueriesPlugin,    // Query operations
          coreAccountPlugin,    // Account operations
          coreTokenPlugin,      // Token operations
          coreConsensusPlugin,  // Consensus operations
        ],
      },
    })

    // Load the structured chat prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are Orai, an intelligent assistant for cross-chain Web3 transactions and Hedera operations.
      
You can help users with:
- Cross-chain transactions (Ethereum, Polygon, Arbitrum, Base)
- Hedera network operations (HBAR transfers, token creation, consensus messages)
- Wallet analytics and transaction history
- DeFi operations and staking

When users ask about Hedera operations, use the available Hedera tools to execute transactions.
For cross-chain operations, provide guidance and use the appropriate bridge tools.

Always be helpful, accurate, and provide clear explanations of what you're doing.`],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ])

    // Fetch tools from toolkit
    const tools = hederaAgentToolkit.getTools()

    // Create the underlying agent
    const agent = createToolCallingAgent({
      llm,
      tools,
      prompt,
    })

    // In-memory conversation history
    const memory = new BufferMemory({
      memoryKey: 'chat_history',
      inputKey: 'input',
      outputKey: 'output',
      returnMessages: true,
    })

    // Wrap everything in an executor that will maintain memory
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      memory,
      returnIntermediateSteps: false,
    })

    return {
      agentExecutor,
      client,
      isConnected: true,
      version: '3.3.0',
      model: llm.constructor.name,
    }
  } catch (error) {
    return null
  }
}

// Global agent instance
let globalAgent: any = null

/**
 * Get or initialize the global Hedera agent
 */
function getGlobalAgent() {
  if (!globalAgent) {
    globalAgent = initializeHederaAgent()
  }
  return globalAgent
}

/**
 * Parse user query and generate transaction intent using Hedera AgentKit
 * 
 * @param userQuery - Natural language query from user
 * @param walletAddress - User's wallet address for context
 * @returns Promise<AgentResponse> - Parsed intent and AI response
 */
export async function parseUserIntent(userQuery: string, walletAddress?: string): Promise<AgentResponse> {
  try {
    
    const agent = getGlobalAgent()
    
    if (!agent) {
      return parseUserIntentMock(userQuery, walletAddress)
    }

    // Check if this is a Hedera-specific operation
    const query = userQuery.toLowerCase()
    const isHederaOperation = query.includes('hbar') || 
                             query.includes('hedera') || 
                             query.includes('create token') ||
                             query.includes('create topic') ||
                             query.includes('consensus')

    if (isHederaOperation) {
      // Use Hedera AgentKit for Hedera operations
      try {
        const response = await agent.agentExecutor.invoke({ 
          input: userQuery,
          context: {
            walletAddress,
            availableChains: [1, 137, 42161, 8453],
            supportedTokens: ['USDC', 'USDT', 'ETH', 'MATIC', 'HBAR'],
          }
        })

        return {
          intent: {
            action: 'hedera_operation',
            walletAddress,
            confidence: 0.9,
            reasoning: 'Executed using Hedera AgentKit',
            hederaOperation: {
              type: 'transfer_hbar', // This would be determined by the agent
              details: response
            }
          },
          response: response.output || response,
          suggestions: [
            'Check transaction status',
            'View transaction details',
            'Monitor network activity'
          ],
          executionResult: {
            success: true,
            transactionId: response.transactionId
          }
        }
      } catch (error) {
        return {
          intent: {
            action: 'query',
            walletAddress,
            confidence: 0.3,
            reasoning: 'Hedera operation failed, providing guidance'
          },
          response: `I encountered an error with the Hedera operation: ${error instanceof Error ? error.message : 'Unknown error'}. Let me help you with alternative approaches.`,
          warnings: ['Hedera operation failed', 'Check your Hedera credentials and network connection']
        }
      }
    } else {
      // Use mock implementation for cross-chain operations
      return parseUserIntentMock(userQuery, walletAddress)
    }
  } catch (error) {
    return {
      intent: {
        action: 'query',
        walletAddress,
        confidence: 0.1,
        reasoning: 'Error occurred during intent parsing'
      },
      response: 'I encountered an error processing your request. Please try again or rephrase your question.',
      warnings: ['System error occurred', 'Please check your request and try again']
    }
  }
}

/**
 * Mock implementation for cross-chain operations (fallback)
 */
async function parseUserIntentMock(userQuery: string, walletAddress?: string): Promise<AgentResponse> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Simple intent parsing based on keywords
  const query = userQuery.toLowerCase()
  
  if (query.includes('send') && query.includes('usdc')) {
    return parseTransferIntent(userQuery, walletAddress)
  } else if (query.includes('bridge') || (query.includes('from') && query.includes('to'))) {
    return parseBridgeIntent(userQuery, walletAddress)
  } else if (query.includes('stake') || query.includes('yield')) {
    return parseStakeIntent(userQuery, walletAddress)
  } else if (query.includes('transaction') || query.includes('history') || query.includes('analytics')) {
    return parseAnalyticsIntent(userQuery, walletAddress)
  } else {
    return parseGenericIntent(userQuery, walletAddress)
  }
}

/**
 * Parse transfer intent from user query
 */
function parseTransferIntent(query: string, walletAddress?: string): AgentResponse {
  const amountMatch = query.match(/(\d+(?:\.\d+)?)\s*(usdc|usdt|eth|matic)/i)
  const amount = amountMatch ? amountMatch[1] : '10'
  const token = amountMatch ? amountMatch[2].toUpperCase() : 'USDC'
  
  return {
    intent: {
      action: 'transfer',
      token,
      amount,
      walletAddress,
      confidence: 0.9,
      reasoning: 'Detected transfer request with amount and token specified',
    },
    response: `I'll help you send ${amount} ${token}. Please confirm the recipient address and I'll execute the transfer.`,
    suggestions: [
      'Enter recipient address',
      'Choose network (Ethereum, Polygon, Arbitrum, Base)',
      'Review gas fees',
    ],
  }
}

/**
 * Parse bridge intent from user query
 */
function parseBridgeIntent(query: string, walletAddress?: string): AgentResponse {
  const amountMatch = query.match(/(\d+(?:\.\d+)?)\s*(usdc|usdt|eth|matic)/i)
  const amount = amountMatch ? amountMatch[1] : '10'
  const token = amountMatch ? amountMatch[2].toUpperCase() : 'USDC'
  
  // Extract chain information
  let chainFrom = 1 // Default to Ethereum
  let chainTo = 137 // Default to Polygon
  
  if (query.includes('ethereum') || query.includes('eth')) {
    chainFrom = 1
  }
  if (query.includes('polygon') || query.includes('matic')) {
    chainTo = 137
  }
  if (query.includes('arbitrum')) {
    chainTo = 42161
  }
  if (query.includes('base')) {
    chainTo = 8453
  }
  
  return {
    intent: {
      action: 'bridge',
      chainFrom,
      chainTo,
      token,
      amount,
      walletAddress,
      confidence: 0.85,
      reasoning: 'Detected cross-chain bridge request with source and destination chains',
    },
    response: `I'll bridge ${amount} ${token} from ${getChainName(chainFrom)} to ${getChainName(chainTo)}. This will take approximately 2-5 minutes.`,
    suggestions: [
      'Confirm bridge route',
      'Review bridge fees',
      'Set slippage tolerance',
    ],
    warnings: [
      'Bridge transactions cannot be reversed',
      'Network congestion may affect timing',
    ],
  }
}

/**
 * Parse staking intent from user query
 */
function parseStakeIntent(query: string, walletAddress?: string): AgentResponse {
  const amountMatch = query.match(/(\d+(?:\.\d+)?)\s*(eth|matic)/i)
  const amount = amountMatch ? amountMatch[1] : '1'
  const token = amountMatch ? amountMatch[2].toUpperCase() : 'ETH'
  
  return {
    intent: {
      action: 'stake',
      token,
      amount,
      walletAddress,
      confidence: 0.8,
      reasoning: 'Detected staking request for yield generation',
    },
    response: `I'll help you stake ${amount} ${token} for yield. Current APY is approximately 4-6%.`,
    suggestions: [
      'Choose staking pool',
      'Set staking duration',
      'Review yield projections',
    ],
  }
}

/**
 * Parse analytics intent from user query
 */
function parseAnalyticsIntent(query: string, walletAddress?: string): AgentResponse {
  const chainMatch = query.match(/(ethereum|polygon|arbitrum|base)/i)
  const chain = chainMatch ? chainMatch[1] : 'all'
  
  return {
    intent: {
      action: 'analytics',
      walletAddress,
      parameters: { chain, limit: 5 },
      confidence: 0.95,
      reasoning: 'Detected request for wallet analytics and transaction history',
    },
    response: `I'll fetch your transaction history and wallet analytics${chain !== 'all' ? ` for ${chain}` : ''}.`,
    suggestions: [
      'View transaction details',
      'Export transaction history',
      'Analyze spending patterns',
    ],
  }
}

/**
 * Parse generic intent for unrecognized queries
 */
function parseGenericIntent(query: string, walletAddress?: string): AgentResponse {
  return {
    intent: {
      action: 'query',
      walletAddress,
      confidence: 0.3,
      reasoning: 'Generic query - may need clarification',
    },
    response: `I can help you with cross-chain transactions, wallet analytics, and DeFi operations. Could you be more specific about what you'd like to do?`,
    suggestions: [
      'Send tokens between chains',
      'Check wallet balance and history',
      'Stake assets for yield',
      'Bridge tokens to another network',
    ],
  }
}

/**
 * Get chain name by ID
 */
function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: 'Ethereum',
    137: 'Polygon',
    42161: 'Arbitrum',
    8453: 'Base',
  }
  return chains[chainId] || `Chain ${chainId}`
}

/**
 * Execute Hedera operation using AgentKit
 */
export async function executeHederaOperation(operation: string, parameters: Record<string, any> = {}): Promise<AgentResponse> {
  try {
    const agent = getGlobalAgent()
    
    if (!agent) {
      throw new Error('Hedera AgentKit not initialized')
    }

    const response = await agent.agentExecutor.invoke({ 
      input: operation,
      parameters
    })

    return {
      intent: {
        action: 'hedera_operation',
        confidence: 0.9,
        reasoning: 'Executed using Hedera AgentKit',
        hederaOperation: {
          type: 'transfer_hbar',
          details: response
        }
      },
      response: response.output || response,
      executionResult: {
        success: true,
        transactionId: response.transactionId
      }
    }
  } catch (error) {
    return {
      intent: {
        action: 'hedera_operation',
        confidence: 0.1,
        reasoning: 'Hedera operation failed'
      },
      response: `Failed to execute Hedera operation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      executionResult: {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

/**
 * Get Hedera account balance
 */
export async function getHederaBalance(): Promise<string> {
  try {
    const agent = getGlobalAgent()
    
    if (!agent) {
      throw new Error('Hedera AgentKit not initialized')
    }

    const response = await agent.agentExecutor.invoke({ 
      input: "What's my HBAR balance?"
    })

    return response.output || 'Unable to fetch balance'
  } catch (error) {
    return 'Error fetching balance'
  }
}

/**
 * Validate transaction intent before execution
 */
export function validateTransactionIntent(intent: TransactionIntent): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!intent.walletAddress) {
    errors.push('Wallet address is required')
  }
  
  if (intent.action === 'transfer' || intent.action === 'bridge') {
    if (!intent.amount || parseFloat(intent.amount) <= 0) {
      errors.push('Valid amount is required')
    }
    if (!intent.token) {
      errors.push('Token symbol is required')
    }
  }
  
  if (intent.action === 'bridge') {
    if (!intent.chainFrom || !intent.chainTo) {
      errors.push('Source and destination chains are required')
    }
    if (intent.chainFrom === intent.chainTo) {
      errors.push('Source and destination chains must be different')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}
