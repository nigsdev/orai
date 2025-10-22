import { NextRequest, NextResponse } from 'next/server'
import { executeCrossChainIntent } from '@/lib/avail'
import { validateTransactionIntent } from '@/lib/hederaAgent'

export async function POST(request: NextRequest) {
  try {
    const { 
      action, 
      chainFrom, 
      chainTo, 
      token, 
      amount, 
      walletAddress, 
      recipientAddress 
    } = await request.json()

    // Validate required parameters
    if (!action || !walletAddress) {
      return NextResponse.json(
        { error: 'Action and wallet address are required' },
        { status: 400 }
      )
    }

    // Validate transaction intent
    const intent = {
      action: action as any,
      chainFrom,
      chainTo,
      token,
      amount,
      walletAddress,
      recipientAddress,
      confidence: 1.0,
      reasoning: 'Direct execution request',
    }

    const validation = validateTransactionIntent(intent)
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid transaction parameters', details: validation.errors },
        { status: 400 }
      )
    }

    let result: any = {}

    switch (action) {
      case 'bridge':
        if (!chainFrom || !chainTo || !token || !amount) {
          return NextResponse.json(
            { error: 'Chain from, chain to, token, and amount are required for bridge' },
            { status: 400 }
          )
        }

        try {
          result = await executeCrossChainIntent({
            chainFrom,
            chainTo,
            token,
            amount,
            walletAddress,
            recipientAddress,
          })
        } catch (error) {
          return NextResponse.json(
            { 
              success: false,
              error: error instanceof Error ? error.message : 'Bridge operation failed',
              result: {
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            },
            { status: 500 }
          )
        }
        break

      case 'transfer':
        // For transfers, we would typically interact with the blockchain directly
        // For demo purposes, we'll simulate a successful transfer
        result = {
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: 'success',
          gasCost: '$0.02',
          message: `Successfully transferred ${amount} ${token}`,
        }
        break

      case 'stake':
        // For staking, we would interact with staking contracts
        // For demo purposes, we'll simulate a successful stake
        result = {
          transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
          status: 'success',
          gasCost: '$0.05',
          message: `Successfully staked ${amount} ${token}`,
          apy: '4.5%',
        }
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in execute API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
