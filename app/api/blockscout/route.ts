/**
 * API Route for Blockscout Integration
 * 
 * This API route handles Blockscout requests from your chatbot,
 * providing wallet analytics and transaction data.
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverBlockscoutService, SupportedChainId } from '@/lib/server-blockscout'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, address, chainId, txHash, limit } = body

    // Validate required fields
    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Missing action parameter',
        message: 'Please specify an action: wallet-analytics, transaction-history, monitor-transaction, or supported-chains'
      }, { status: 400 })
    }

    let result

    switch (action) {
      case 'wallet-analytics':
        if (!address) {
          return NextResponse.json({
            success: false,
            error: 'Missing address parameter',
            message: 'Please provide a wallet address'
          }, { status: 400 })
        }
        
        result = await serverBlockscoutService.getWalletAnalytics(
          address, 
          (chainId as SupportedChainId) || 1
        )
        break

      case 'transaction-history':
        if (!address) {
          return NextResponse.json({
            success: false,
            error: 'Missing address parameter',
            message: 'Please provide a wallet address'
          }, { status: 400 })
        }
        
        result = await serverBlockscoutService.getTransactionHistory(
          address, 
          (chainId as SupportedChainId) || 1,
          limit || 10
        )
        break

      case 'monitor-transaction':
        if (!txHash) {
          return NextResponse.json({
            success: false,
            error: 'Missing txHash parameter',
            message: 'Please provide a transaction hash'
          }, { status: 400 })
        }
        
        result = {
          success: true,
          message: `🔍 Transaction monitoring is not available in server-side mode. Use the client-side integration for real-time monitoring.`,
          data: {
            hash: txHash,
            status: 'server-side',
            explorerUrl: serverBlockscoutService.getExplorerUrl((chainId as SupportedChainId) || 1, 'tx', txHash)
          }
        }
        break

      case 'show-transaction-history':
        result = {
          success: true,
          message: `📋 Transaction history popup is not available in server-side mode. Use the client-side integration for popup functionality.`,
          data: {
            address: address || 'all',
            chainId: (chainId as SupportedChainId) || 1
          }
        }
        break

      case 'supported-chains':
        result = {
          success: true,
          data: serverBlockscoutService.getSupportedChainsInfo(),
          message: 'Supported chains information'
        }
        break

      case 'parse-wallet-input':
        if (!address) {
          return NextResponse.json({
            success: false,
            error: 'Missing input parameter',
            message: 'Please provide input text to parse'
          }, { status: 400 })
        }
        
        result = {
          success: true,
          data: {
            address: serverBlockscoutService.isValidAddress(address) ? address : null,
            chainId: 1 // Default to Ethereum mainnet
          },
          message: 'Parsed wallet input'
        }
        break

      case 'parse-transaction-input':
        if (!txHash) {
          return NextResponse.json({
            success: false,
            error: 'Missing input parameter',
            message: 'Please provide input text to parse'
          }, { status: 400 })
        }
        
        result = {
          success: true,
          data: {
            txHash: txHash.startsWith('0x') && txHash.length === 66 ? txHash : null,
            chainId: 1 // Default to Ethereum mainnet
          },
          message: 'Parsed transaction input'
        }
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          message: 'Supported actions: wallet-analytics, transaction-history, monitor-transaction, show-transaction-history, supported-chains, parse-wallet-input, parse-transaction-input'
        }, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Blockscout API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    switch (action) {
      case 'supported-chains':
        return NextResponse.json({
          success: true,
          data: serverBlockscoutService.getSupportedChainsInfo(),
          message: 'Supported chains information'
        })

      case 'health':
        return NextResponse.json({
          success: true,
          message: 'Blockscout API is healthy',
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          message: 'Supported GET actions: supported-chains, health'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Blockscout API error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Internal server error'
    }, { status: 500 })
  }
}
