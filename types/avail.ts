/**
 * Avail Nexus SDK Types
 * 
 * Type definitions for Avail Nexus SDK payment operations
 */

export interface AvailSDKConfig {
  network: 'mainnet' | 'testnet'
  rpcUrl?: string
}

export interface BridgeOperation {
  token: 'USDC' | 'USDT' | 'ETH' | 'WETH' | 'MATIC' | 'WMATIC'
  amount: string
  chainId: number
  recipientAddress?: string
}

export interface BridgeEstimate {
  bridgeFee: string
  gasFee: string
  estimatedTime: string
  slippage: string
}

export interface BridgeResult {
  transactionHash: string
  bridgeId: string
  estimatedTime: string
  gasCost: string
  status: 'pending' | 'success' | 'failed'
}

export interface ProgressStep {
  typeID: string
  data: any
  status: 'pending' | 'completed' | 'failed'
}

export interface PaymentState {
  isProcessing: boolean
  currentStep: ProgressStep | null
  progress: number
  error: string | null
  transactionHash: string | null
}

export interface UnifiedBalance {
  token: string
  totalBalance: string
  chainBalances: Array<{
    chainId: number
    balance: string
    value: string
  }>
}

export interface AvailError {
  code: string
  message: string
  details?: any
}

export type AvailEventType = 
  | 'BRIDGE_EXECUTE_EXPECTED_STEPS'
  | 'BRIDGE_EXECUTE_COMPLETED_STEPS'
  | 'BRIDGE_EXECUTE_FAILED'
  | 'INTENT_APPROVAL_REQUIRED'
  | 'ALLOWANCE_APPROVAL_REQUIRED'

export interface AvailEvent {
  type: AvailEventType
  data: any
  timestamp: Date
}
