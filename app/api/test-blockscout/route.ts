import { NextRequest, NextResponse } from 'next/server'
import { getWalletAnalytics, getRecentTransactions, getBlockscoutUrl, isChainSupported } from '@/lib/blockscout'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address') || '0xb9527E3e6ad9342E2e312ad9795f1FFe2e194f78'
    const chainId = parseInt(searchParams.get('chainId') || '421614')
    
    
    // Check if chain is supported
    const supported = isChainSupported(chainId)
    const baseUrl = getBlockscoutUrl(chainId)
    
    // Test API endpoints
    const testResults = {
      address,
      chainId,
      supported,
      baseUrl,
      tests: []
    }
    
    // Test 1: Address endpoint
    try {
      const addressUrl = `${baseUrl}/api/v2/addresses/${address}`
      
      const response = await fetch(addressUrl, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      testResults.tests.push({
        endpoint: 'address',
        url: addressUrl,
        status: response.status,
        ok: response.ok,
        data: data
      })
    } catch (error) {
      testResults.tests.push({
        endpoint: 'address',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // Test 2: Transactions endpoint
    try {
      const txUrl = `${baseUrl}/api/v2/addresses/${address}/transactions`
      
      const response = await fetch(txUrl, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      const data = await response.json()
      
      testResults.tests.push({
        endpoint: 'transactions',
        url: txUrl,
        status: response.status,
        ok: response.ok,
        data: data
      })
    } catch (error) {
      testResults.tests.push({
        endpoint: 'transactions',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // Test 3: Try the actual function
    try {
      const analytics = await getWalletAnalytics(address, chainId)
      testResults.analytics = analytics
    } catch (error) {
      testResults.analyticsError = error instanceof Error ? error.message : 'Unknown error'
    }
    
    return NextResponse.json(testResults)
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}


