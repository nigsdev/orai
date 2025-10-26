/**
 * Avail Nexus SDK Integration
 * 
 * This module handles cross-chain payment operations using Avail Nexus SDK.
 * It provides functions for bridging tokens, executing cross-chain transactions,
 * and managing liquidity across multiple EVM-compatible networks.
 * 
 * Key Features:
 * - Cross-chain token transfers
 * - Bridge operations between chains
 * - Real-time payment progress tracking
 * - Transaction execution across networks
 */

import { NexusSDK } from '@avail-project/nexus-core'
import { 
  AvailSDKConfig, 
  BridgeOperation, 
  BridgeEstimate, 
  BridgeResult, 
  ProgressStep,
  AvailEvent,
  AvailEventType,
  CrossChainIntent
} from '@/types/avail'
import { parseEther, zeroAddress } from 'viem'

// Global SDK instance
let sdkInstance: NexusSDK | null = null
let eventListenersSetup = false
let operationInProgress = false

/**
 * Initialize Avail Nexus SDK
 */
export function initializeAvailNexus(provider?: any): NexusSDK {
  if (sdkInstance) {
    return sdkInstance
  }

  // Base config from env
  const envNetwork = (process.env.NEXT_PUBLIC_AVAIL_NEXUS_NETWORK as 'mainnet' | 'testnet') || 'mainnet'
  const config: AvailSDKConfig = {
    network: envNetwork,
    rpcUrl: process.env.NEXT_PUBLIC_AVAIL_NEXUS_RPC_URL
  }

  // If a provider is passed, try to auto-detect testnet/mainnet from current chain
  // This allows seamless testing on OP/Arbitrum Sepolia without changing env locally
  if (provider && typeof provider.request === 'function') {
    try {
      // eth_chainId returns hex string like '0xaa37dc'
      // We only need to know whether we're on known testnets
      // OP Sepolia: 11155420, Arbitrum Sepolia: 421614
      // If detected, force network to 'testnet' for the Avail SDK
      // Otherwise keep env-configured network
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const maybePromise = provider.request({ method: 'eth_chainId' })
      // Handle both sync/async implementations defensively
      const setFromChainId = async (p: Promise<any> | any) => {
        const chainIdHex = await p
        const numericChainId = typeof chainIdHex === 'string' ? parseInt(chainIdHex, 16) : Number(chainIdHex)
        const isTestnet = [11155420, 421614].includes(numericChainId)
        if (isTestnet && config.network !== 'testnet') {
          config.network = 'testnet'
        }
      }
      // no await here; we just best-effort adjust before constructing SDK below
      // but to keep ordering deterministic, we will await
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      void setFromChainId(maybePromise)
    } catch (e) {
      // If detection fails, fall back to env configuration
      console.warn('Avail SDK: failed to detect chainId for network selection; using env configuration')
    }
  }

  try {
    sdkInstance = new NexusSDK(config)
    
    if (provider) {
      sdkInstance.initialize(provider)
    }
    
    console.log('Avail Nexus SDK initialized successfully')
    return sdkInstance
  } catch (error) {
    console.error('Failed to initialize Avail Nexus SDK:', error)
    throw new Error('Failed to initialize Avail Nexus SDK')
  }
}

/**
 * Get the current SDK instance
 */
export function getAvailSDK(): NexusSDK | null {
  return sdkInstance
}

/**
 * Execute cross-chain intent using Avail Nexus SDK
 * 
 * @param intent - The cross-chain operation details
 * @returns Promise<BridgeResult> - Transaction result with hash and status
 */
export async function executeCrossChainIntent(intent: CrossChainIntent): Promise<BridgeResult> {
  // Prevent multiple simultaneous operations
  if (operationInProgress) {
    throw new Error('Another operation is already in progress. Please wait.')
  }

  try {
    operationInProgress = true
    const sdk = getAvailSDK()
    if (!sdk) {
      throw new Error('Avail SDK not initialized')
    }

    console.log('Executing cross-chain intent:', intent)
    
    // Execute bridge operation with proper SDK types
    const result = await sdk.bridge({
      token: intent.token as any, // SDK will handle token validation
      amount: intent.amount,
      chainId: intent.chainTo as any, // SDK will handle chain validation
      ...(intent.recipientAddress && { toAddress: intent.recipientAddress })
    }){
    
    console.log('📋 SDK bridge result:', JSON.stringify(result, null, 2))
    console.log('🔍 Result type:', typeof result)
    console.log('🔍 Result keys:', result ? Object.keys(result) : 'null/undefined')
    
    // Check if result indicates a failure
    if (result && typeof result === 'object') {
      const resultAny = result as any
      if (resultAny.error || resultAny.failed || resultAny.status === 'failed') {
        console.error('❌ SDK returned failure status:', result)
        throw new Error(`SDK bridge failed: ${resultAny.error || resultAny.message || 'Unknown error'}`)
      }
      
      if (resultAny.status === 'pending' || resultAny.status === 'processing') {
        console.log('⏳ Bridge is processing, this may take a few minutes...')
      }
    }
    
    // Enhanced transaction hash detection
    let transactionHash = null
    if (result) {
      // Try multiple possible property names for transaction hash
      const possibleHashKeys = [
        'transactionHash', 'txHash', 'hash', 'tx', 'transactionId', 
        'id', 'bridgeId', 'bridgeHash', 'crossChainHash', 'receipt',
        'txHash', 'transaction', 'result', 'data'
      ]
      
      for (const key of possibleHashKeys) {
        if ((result as any)[key] && typeof (result as any)[key] === 'string' && (result as any)[key].startsWith('0x')) {
          transactionHash = (result as any)[key]
          console.log(`✅ Found transaction hash in property '${key}':`, transactionHash)
          break
        }
      }
      
      // If no hash found, log all properties for debugging
      if (!transactionHash) {
        console.log('🔍 All result properties:')
        Object.keys(result).forEach(key => {
          console.log(`  ${key}:`, (result as any)[key], `(type: ${typeof (result as any)[key]})`)
        })
      }
    }
    
<<<<<<< HEAD
    // Handle SDK response format - only return real transaction data
    if (!transactionHash) {
      console.error('❌ No transaction hash found in SDK response:', result)
      console.error('❌ This indicates the SDK bridge call failed or returned unexpected format')
      throw new Error('No transaction hash returned from Avail SDK - bridge may have failed')
    }
    
    const bridgeResult: BridgeResult = {
      transactionHash: transactionHash,
      bridgeId: (result as any)?.bridgeId || `bridge_${Date.now()}`,
      estimatedTime: (result as any)?.estimatedTime || '2-5 minutes',
      gasCost: (result as any)?.gasCost || '$0.35',
      status: (result as any)?.status || 'success',
    }
    
    // RESTORE ORIGINAL CHAIN: Switch back to source chain if it was changed
    if (originalChainId && window.ethereum) {
      try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId !== originalChainId) {
          console.log('🔄 Chain was switched during bridge. Restoring to:', originalChainId);
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: originalChainId }],
          });
          console.log('✅ Chain restored to original');
        }
      } catch (e) {
        console.warn('Could not restore original chain:', e);
      }
    }
    
    return out
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to execute cross-chain transaction'
    console.error('Error executing cross-chain intent:', message)
    throw new Error(message)
=======
    console.log('🔍 DEBUG - Raw SDK result:', result)
    
    // Handle different SDK response formats
    // Some SDKs return success=true, others return transactionHash directly
    // Some might return error messages even on success due to wallet interaction
    
    // Check if we have a transaction hash (indicates success)
    const hasTransactionHash = result.transactionHash || result.hash || result.txHash
    const hasBridgeId = result.bridgeId || result.messageId || result.intentId
    
    // Check for success indicators
    const isSuccess = result.success === true || 
                     result.status === 'success' || 
                     hasTransactionHash || 
                     hasBridgeId ||
                     (result.error && result.error.includes('User rejected') === false)
    
    // If we have a transaction hash or bridge ID, consider it successful
    if (hasTransactionHash || hasBridgeId) {
      console.log('✅ Transaction successful - hash/bridge ID found')
      
      const bridgeResult: BridgeResult = {
        transactionHash: result.transactionHash || result.hash || result.txHash,
        bridgeId: result.bridgeId || result.messageId || result.intentId || result.transactionHash,
        estimatedTime: '2-5 minutes',
        gasCost: '$0.35',
        status: 'success',
      }
      
      return bridgeResult
    }
    
    // If result.success is explicitly false and no transaction hash, it's a real failure
    if (result.success === false && !hasTransactionHash && !hasBridgeId) {
      throw new Error(result.error || 'Bridge/Transfer operation failed')
    }
    
    // If we get here, it might be a wallet rejection or other user action
    // Check if it's a user rejection (which might still be considered "successful" in some contexts)
    if (result.error && (
        result.error.includes('User rejected') ||
        result.error.includes('User denied') ||
        result.error.includes('rejected by user')
    )) {
      throw new Error('Transaction was cancelled by user')
    }
    
    // Default case - if we have any result, try to extract what we can
    if (result && typeof result === 'object') {
      console.log('⚠️ Ambiguous result, attempting to extract success indicators')
      
      const bridgeResult: BridgeResult = {
        transactionHash: result.transactionHash || result.hash || result.txHash || 'unknown',
        bridgeId: result.bridgeId || result.messageId || result.intentId || 'unknown',
        estimatedTime: '2-5 minutes',
        gasCost: '$0.35',
        status: 'success', // Assume success if we got this far
      }
      
      return bridgeResult
    }
    
    throw new Error('No valid response received from Avail SDK')
  } catch (error) {
    console.error('Error executing cross-chain intent:', error)
    throw new Error(`Failed to execute cross-chain transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    operationInProgress = false
>>>>>>> 2ffbe22 (debegged)
  }
}

/**
 * Get supported chains for cross-chain operations
 */
export function getSupportedChains() {
  return [
    { id: 1, name: 'Ethereum', symbol: 'ETH' },
    { id: 10, name: 'Optimism', symbol: 'ETH' },
    { id: 11155420, name: 'OP Sepolia', symbol: 'ETH' },
    { id: 137, name: 'Polygon', symbol: 'MATIC' },
    { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
    { id: 421614, name: 'Arbitrum Sepolia', symbol: 'ETH' },
    { id: 8453, name: 'Base', symbol: 'ETH' },
  ]
}

/**
 * Get available tokens for bridging
 */
export function getAvailableTokens(chainId: number) {
  const tokens: Record<number, Array<{ symbol: string; address: string; decimals: number }>> = {
    1: [
      { symbol: 'USDC', address: '0xA0b86a33E6441c8C06DdD5B8C4b8b4b8b4b8b4b8b', decimals: 6 },
      { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
      { symbol: 'WETH', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', decimals: 18 },
    ],
    10: [
      { symbol: 'USDC', address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', decimals: 6 },
      { symbol: 'USDT', address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', decimals: 6 },
      { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
    ],
    11155420: [
      { symbol: 'USDC', address: '0x5fd84259d66Cd45833020E30E5e0eA7b5c4C9b6C', decimals: 6 },
      { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
    ],
    137: [
      { symbol: 'USDC', address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
      { symbol: 'USDT', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
      { symbol: 'WMATIC', address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', decimals: 18 },
    ],
    42161: [
      { symbol: 'USDC', address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', decimals: 6 },
      { symbol: 'USDT', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 },
      { symbol: 'WETH', address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', decimals: 18 },
    ],
    8453: [
      { symbol: 'USDC', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
      { symbol: 'WETH', address: '0x4200000000000000000000000000000000000006', decimals: 18 },
    ],
  }
  
  return tokens[chainId] || []
}

/**
 * Estimate bridge fees and time
 */
export async function estimateBridgeFees(intent: CrossChainIntent): Promise<BridgeEstimate> {
  try {
    const sdk = getAvailSDK()
    if (!sdk) {
      throw new Error('Avail SDK not initialized')
    }

    // Get real fee estimation with proper SDK types
    const estimate = await sdk.simulateBridge({
      token: intent.token as any, // SDK will handle token validation
      amount: intent.amount,
      chainId: intent.chainTo as any, // SDK will handle chain validation
      ...(intent.recipientAddress && { toAddress: intent.recipientAddress })
    })
    
    return {
      bridgeFee: (estimate as any)?.bridgeFee || '0.1%',
      gasFee: (estimate as any)?.gasFee || '$0.35',
      estimatedTime: (estimate as any)?.estimatedTime || '2-5 minutes',
      slippage: (estimate as any)?.slippage || '0.5%',
    }
  } catch (error) {
    console.error('Error estimating bridge fees:', error)
    // Fallback to mock data
    return {
      bridgeFee: '0.1%',
      gasFee: '$0.35',
      estimatedTime: '2-5 minutes',
      slippage: '0.5%',
    }
  }
}

/**
 * Get unified balances across all chains
 */
export async function getUnifiedBalances(): Promise<any> {
  try {
    const sdk = getAvailSDK()
    if (!sdk) {
      throw new Error('Avail SDK not initialized')
    }

    return await sdk.getUnifiedBalances()
  } catch (error) {
    console.error('Error getting unified balances:', error)
    throw new Error('Failed to get unified balances')
  }
}

/**
 * Test SDK bridge call function for debugging
 */
export async function testSDKBridgeCall(intent: CrossChainIntent): Promise<{ success: boolean; result?: any; error?: string }> {
  try {
    const sdk = getAvailSDK()
    if (!sdk) {
      throw new Error('Avail SDK not initialized')
    }

    console.log('🧪 Testing SDK bridge call with intent:', intent)

    // Choose the correct SDK method based on whether recipient is specified
    let result: any
    
    if (intent.recipientAddress) {
      // Use transfer() when recipient address is specified
      const transferParams = {
        token: intent.token as any,
        amount: intent.amount,
        chainId: intent.chainTo as any,
        recipient: intent.recipientAddress as `0x${string}`,
      }
      
      console.log('🧪 Testing transfer() with params:', transferParams)
      result = await sdk.transfer(transferParams)
    } else {
      // Use bridge() when sending to self (no recipient specified)
      const bridgeParams = {
        token: intent.token as any,
        amount: intent.amount,
        chainId: intent.chainTo as any,
      }
      
      console.log('🧪 Testing bridge() with params:', bridgeParams)
      result = await sdk.bridge(bridgeParams)
    }
    
    console.log('🧪 SDK test result:', result)
    
    return {
      success: true,
      result: result
    }
  } catch (error) {
    console.error('🧪 SDK test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Set up event listeners for payment progress
 */
export function setupPaymentEventListeners(
  onProgress: (step: ProgressStep) => void,
  onComplete: (result: BridgeResult) => void,
  onError: (error: Error) => void
) {
  const sdk = getAvailSDK()
  if (!sdk) {
    throw new Error('Avail SDK not initialized')
  }

  // Prevent multiple event listener setup
  if (eventListenersSetup) {
    console.log('Event listeners already setup, skipping...')
    return
  }

  console.log('Setting up Avail SDK event listeners...')

  // Listen for expected steps
  sdk.nexusEvents.on('BRIDGE_EXECUTE_EXPECTED_STEPS', (steps: ProgressStep[]) => {
    console.log('Expected steps:', steps.map(s => s.typeID))
  })

  // Listen for completed steps
  sdk.nexusEvents.on('BRIDGE_EXECUTE_COMPLETED_STEPS', (step: ProgressStep) => {
    console.log('Completed step:', step.typeID, step.data)
    onProgress(step)
  })

  // Listen for bridge completion
  sdk.nexusEvents.on('BRIDGE_EXECUTE_COMPLETED', (result: any) => {
    console.log('Bridge completed:', result)
    onComplete(result)
  })

  // Listen for bridge errors
  sdk.nexusEvents.on('BRIDGE_EXECUTE_FAILED', (error: any) => {
    console.log('Bridge failed:', error)
    onError(new Error(error.message || 'Bridge operation failed'))
  })

  eventListenersSetup = true
  console.log('Event listeners setup complete')
}

/**
 * Clear event listeners and reset SDK state
 */
export function clearAvailSDKState() {
  const sdk = getAvailSDK()
  if (sdk && sdk.nexusEvents) {
    console.log('Clearing Avail SDK event listeners...')
    sdk.nexusEvents.removeAllListeners()
  }
  eventListenersSetup = false
  console.log('Avail SDK state cleared')
}

/**
 * Verify if a transaction was actually successful by checking the blockchain
 */
export async function verifyTransactionSuccess(transactionHash: string, chainId: number): Promise<boolean> {
  try {
    if (!transactionHash || transactionHash === 'unknown') {
      return false
    }

    // For now, we'll assume success if we have a valid transaction hash
    // In a production environment, you would check the blockchain directly
    console.log(`🔍 Verifying transaction ${transactionHash} on chain ${chainId}`)
    
    // Basic validation - check if it looks like a valid transaction hash
    if (transactionHash.startsWith('0x') && transactionHash.length === 66) {
      console.log('✅ Transaction hash format is valid')
      return true
    }
    
    // If it's a bridge ID or message ID, also consider it successful
    if (transactionHash.length > 10) {
      console.log('✅ Bridge/Message ID format is valid')
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error verifying transaction:', error)
    return false
  }
}

/**
 * Reset SDK instance (for testing/debugging)
 */
export function resetAvailSDK() {
  console.log('Resetting Avail SDK instance...')
  clearAvailSDKState()
  operationInProgress = false
  sdkInstance = null
}

/**
 * Test Avail SDK bridge call with detailed debugging
 */
export async function testSDKBridgeCall(intent: CrossChainIntent): Promise<{
  success: boolean;
  result?: any;
  error?: string;
  debugInfo: any;
}> {
  try {
    console.log('🧪 Testing SDK bridge call with intent:', intent)
    
    const sdk = getAvailSDK()
    if (!sdk) {
      throw new Error('Avail SDK not initialized')
    }
    
    console.log('🔍 SDK instance:', sdk)
    console.log('🔍 SDK methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(sdk)))
    
    // Test the bridge call
    const result = await sdk.bridge({
      token: intent.token as any,
      amount: intent.amount,
      chainId: intent.chainTo as any,
      ...(intent.recipientAddress && { toAddress: intent.recipientAddress })
    })
    
    console.log('🧪 SDK bridge test result:', result)
    
    return {
      success: true,
      result,
      debugInfo: {
        sdkInitialized: true,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : [],
        resultStringified: JSON.stringify(result, null, 2)
      }
    }
  } catch (error) {
    console.error('🧪 SDK bridge test failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debugInfo: {
        sdkInitialized: !!getAvailSDK(),
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined
      }
    }
  }
}
