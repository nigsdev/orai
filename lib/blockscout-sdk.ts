/**
 * Blockscout SDK Integration Service
 * 
 * This module provides comprehensive integration with the Blockscout SDK
 * for transaction notifications, history viewing, and wallet analytics.
 * It extends the existing blockscout.ts functionality with SDK features.
 */

import { useNotification, useTransactionPopup } from '@blockscout/app-sdk'
import { getWalletAnalytics, getRecentTransactions, getTransactionDetails, isChainSupported } from './blockscout'

export interface BlockscoutSDKServiceInterface {
  // Transaction notifications
  showTransactionToast: (chainId: string, txHash: string) => Promise<void>
  
  // Transaction history
  showTransactionHistory: (chainId: string, address?: string) => void
  
  // Wallet analytics
  getWalletData: (address: string, chainId: number) => Promise<{
    analytics: any
    transactions: any[]
    balance: string
    tokenBalances: any[]
  }>
  
  // Transaction details
  getTransactionInfo: (txHash: string, chainId: number) => Promise<any>
  
  // Chain support check
  isChainSupported: (chainId: number) => boolean
}

/**
 * Custom hook for Blockscout SDK functionality
 */
export function useBlockscoutSDK() {
  const { openTxToast } = useNotification()
  const { openPopup } = useTransactionPopup()

  const showTransactionToast = async (chainId: string, txHash: string) => {
    try {
      await openTxToast(chainId, txHash)
    } catch (error) {
    }
  }

  const showTransactionHistory = (chainId: string, address?: string) => {
    try {
      openPopup({
        chainId,
        address,
      })
    } catch (error) {
    }
  }

  const getWalletData = async (address: string, chainId: number) => {
    try {
      if (!isChainSupported(chainId)) {
        throw new Error(`Chain ${chainId} is not supported by Blockscout`)
      }

      const [analytics, transactions] = await Promise.all([
        getWalletAnalytics(address, chainId),
        getRecentTransactions(address, chainId, 10)
      ])

      return {
        analytics,
        transactions,
        balance: analytics.wallet.balance,
        tokenBalances: analytics.wallet.tokenBalances,
      }
    } catch (error) {
      throw error
    }
  }

  const getTransactionInfo = async (txHash: string, chainId: number) => {
    try {
      return await getTransactionDetails(txHash, chainId)
    } catch (error) {
      throw error
    }
  }

  return {
    showTransactionToast,
    showTransactionHistory,
    getWalletData,
    getTransactionInfo,
    isChainSupported,
  }
}

/**
 * Enhanced Blockscout service with SDK integration
 */
export class BlockscoutSDKService {
  private useNotification: any
  private useTransactionPopup: any

  constructor() {
    // These will be set when the hook is used in a component
    this.useNotification = null
    this.useTransactionPopup = null
  }

  /**
   * Initialize the service with SDK hooks
   */
  initialize(notificationHook: any, popupHook: any) {
    this.useNotification = notificationHook
    this.useTransactionPopup = popupHook
  }

  /**
   * Show transaction toast notification
   */
  async showTransactionToastService(chainId: string, txHash: string): Promise<void> {
    if (!this.useNotification) {
      throw new Error('BlockscoutSDKService not initialized')
    }

    try {
      const { openTxToast } = this.useNotification()
      await openTxToast(chainId, txHash)
    } catch (error) {
      throw error
    }
  }

  /**
   * Show transaction history popup
   */
  showTransactionHistoryService(chainId: string, address?: string): void {
    if (!this.useTransactionPopup) {
      throw new Error('BlockscoutSDKService not initialized')
    }

    try {
      const { openPopup } = this.useTransactionPopup()
      openPopup({
        chainId,
        address,
      })
    } catch (error) {
      throw error
    }
  }

  /**
   * Get comprehensive wallet data
   */
  async getWalletDataService(address: string, chainId: number) {
    try {
      if (!isChainSupported(chainId)) {
        throw new Error(`Chain ${chainId} is not supported by Blockscout`)
      }

      const [analytics, transactions] = await Promise.all([
        getWalletAnalytics(address, chainId),
        getRecentTransactions(address, chainId, 10)
      ])

      return {
        analytics,
        transactions,
        balance: analytics.wallet.balance,
        tokenBalances: analytics.wallet.tokenBalances,
        transactionCount: analytics.wallet.transactionCount,
        recentActivity: transactions.slice(0, 5),
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Get transaction information
   */
  async getTransactionInfoService(txHash: string, chainId: number) {
    try {
      return await getTransactionDetails(txHash, chainId)
    } catch (error) {
      throw error
    }
  }

  /**
   * Check if chain is supported
   */
  isChainSupportedService(chainId: number): boolean {
    return isChainSupported(chainId)
  }
}

/**
 * Utility functions for Blockscout SDK integration
 */
export const BlockscoutUtils = {
  /**
   * Format chain ID for SDK
   */
  formatChainId: (chainId: number): string => {
    return chainId.toString()
  },

  /**
   * Get supported chain IDs
   */
  getSupportedChains: (): number[] => {
    return [1, 10, 137, 42161, 8453] // Ethereum, Optimism, Polygon, Arbitrum, Base
  },

  /**
   * Validate wallet address
   */
  isValidAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  },

  /**
   * Validate transaction hash
   */
  isValidTxHash: (hash: string): boolean => {
    return /^0x[a-fA-F0-9]{64}$/.test(hash)
  },

  /**
   * Format wallet address for display
   */
  formatAddress: (address: string): string => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  },

  /**
   * Format transaction hash for display
   */
  formatTxHash: (hash: string): string => {
    if (!hash) return ''
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`
  },
}

/**
 * Default export for easy importing
 */
export default {
  useBlockscoutSDK,
  BlockscoutSDKService,
  BlockscoutUtils,
}
