/**
 * Custom hook for Avail Nexus SDK operations
 * 
 * Provides payment-related functionality including:
 * - SDK initialization
 * - Bridge operations
 * - Payment progress tracking
 * - Event subscription management
 */

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { 
  initializeAvailNexus, 
  getAvailSDK, 
  executeCrossChainIntent, 
  estimateBridgeFees,
  setupPaymentEventListeners 
} from '@/lib/avail'
import { 
  CrossChainIntent, 
  BridgeResult, 
  BridgeEstimate, 
  ProgressStep,
  PaymentState 
} from '@/types/avail'

export function useAvailNexus() {
  const { address, isConnected } = useAccount()
  const [sdk, setSdk] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    currentStep: null,
    progress: 0,
    error: null,
    transactionHash: null
  })

  // Initialize SDK when wallet connects
  useEffect(() => {
    if (isConnected && address && !isInitialized) {
      try {
        const sdkInstance = initializeAvailNexus(window.ethereum)
        setSdk(sdkInstance)
        setIsInitialized(true)
      } catch (error) {
        setPaymentState(prev => ({
          ...prev,
          error: 'Failed to initialize Avail SDK'
        }))
      }
    }
  }, [isConnected, address, isInitialized])

  // Execute cross-chain bridge operation
  const executeBridge = useCallback(async (intent: CrossChainIntent): Promise<BridgeResult> => {
    if (!sdk) {
      throw new Error('Avail SDK not initialized')
    }

    setPaymentState({
      isProcessing: true,
      currentStep: null,
      progress: 0,
      error: null,
      transactionHash: null
    })

    try {
      const result = await executeCrossChainIntent(intent)
      
      setPaymentState(prev => ({
        ...prev,
        isProcessing: false,
        transactionHash: result.transactionHash,
        progress: 100
      }))

      return result
    } catch (error) {
      setPaymentState(prev => ({
        ...prev,
        isProcessing: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
      throw error
    }
  }, [sdk])

  // Estimate bridge fees
  const estimateFees = useCallback(async (intent: CrossChainIntent): Promise<BridgeEstimate> => {
    if (!sdk) {
      throw new Error('Avail SDK not initialized')
    }

    try {
      return await estimateBridgeFees(intent)
    } catch (error) {
      throw error
    }
  }, [sdk])

  // Set up payment progress tracking
  const setupProgressTracking = useCallback(() => {
    if (!sdk) return

    setupPaymentEventListeners(
      // On progress
      (step: ProgressStep) => {
        setPaymentState(prev => ({
          ...prev,
          currentStep: step,
          progress: Math.min(prev.progress + 20, 90)
        }))
      },
      // On complete
      (result: BridgeResult) => {
        setPaymentState(prev => ({
          ...prev,
          isProcessing: false,
          progress: 100,
          transactionHash: result.transactionHash
        }))
      },
      // On error
      (error: Error) => {
        setPaymentState(prev => ({
          ...prev,
          isProcessing: false,
          error: error.message
        }))
      }
    )
  }, [sdk])

  // Clear payment state
  const clearPaymentState = useCallback(() => {
    setPaymentState({
      isProcessing: false,
      currentStep: null,
      progress: 0,
      error: null,
      transactionHash: null
    })
  }, [])

  // Get unified balances
  const getBalances = useCallback(async () => {
    if (!sdk) {
      throw new Error('Avail SDK not initialized')
    }

    try {
      return await sdk.getUnifiedBalances()
    } catch (error) {
      throw error
    }
  }, [sdk])

  return {
    // SDK state
    sdk,
    isInitialized,
    isConnected,
    
    // Payment operations
    executeBridge,
    estimateFees,
    getBalances,
    
    // Payment state
    paymentState,
    setupProgressTracking,
    clearPaymentState,
    
    // Utilities
    isReady: isInitialized && isConnected && !!sdk
  }
}
