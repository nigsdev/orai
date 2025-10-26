import { NextRequest, NextResponse } from 'next/server'
import { getWalletAnalytics, getRecentTransactions, getTokenBalances } from '@/lib/blockscout'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const chainId = parseInt(searchParams.get('chainId') || '1')
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Validate address format (basic check)
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      )
    }

    // Fetch comprehensive analytics
    const [analytics, recentTransactions, tokenBalances] = await Promise.all([
      getWalletAnalytics(address, chainId),
      getRecentTransactions(address, chainId, limit),
      getTokenBalances(address, chainId),
    ])

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        recentTransactions,
        tokenBalances,
        summary: {
          totalValue: analytics.wallet.tokenBalances.reduce(
            (sum, token) => sum + parseFloat(token.value.replace('$', '').replace(',', '')), 
            0
          ),
          transactionCount: analytics.wallet.transactionCount,
          lastActivity: analytics.wallet.lastTransaction,
          topToken: analytics.topTokens[0]?.symbol || 'N/A',
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in analytics API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { address, chainId, type, parameters } = await request.json()

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    let result: any = {}

    switch (type) {
      case 'wallet_summary':
        result = await getWalletAnalytics(address, chainId || 1)
        break

      case 'recent_transactions':
        const limit = parameters?.limit || 10
        result = await getRecentTransactions(address, chainId || 1, limit)
        break

      case 'token_balances':
        result = await getTokenBalances(address, chainId || 1)
        break

      case 'spending_analysis':
        const analytics = await getWalletAnalytics(address, chainId || 1)
        result = {
          spendingPatterns: analytics.spendingPatterns,
          totalSpent: analytics.wallet.totalValueSent,
          totalReceived: analytics.wallet.totalValueReceived,
          netFlow: (parseFloat(analytics.wallet.totalValueReceived) - parseFloat(analytics.wallet.totalValueSent)).toFixed(2),
        }
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported analytics type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error in analytics POST API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
