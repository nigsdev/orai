"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveGrid } from "@/components/ui/responsive-grid"
import { Send, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAccount, useBalance, useChainId } from "wagmi"
import { useChatStore } from "@/lib/store"
import { getWalletAnalytics, getTokenBalances } from "@/lib/blockscout"
import { getUnifiedBalances } from "@/lib/avail"
import { useAvailNexus } from "@/hooks/useAvailNexus"

export default function PaymentsPage() {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState("ETH")
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [unifiedBalances, setUnifiedBalances] = useState<any>(null)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])
  const [tokens, setTokens] = useState<any[]>([])

  const { address, isConnected, chain } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  const { executeBridge, isReady } = useAvailNexus()

  // Get the actual chain ID (fallback to chain.id if useChainId() doesn't work)
  const [manualChainId, setManualChainId] = useState<number | null>(null)
  
  // Get chain ID directly from wallet as fallback
  useEffect(() => {
    const getChainIdFromWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum && isConnected) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          const numericChainId = parseInt(chainId, 16)
          console.log('🔗 Direct wallet chain ID:', numericChainId)
          setManualChainId(numericChainId)
        } catch (error) {
          console.error('Error getting chain ID from wallet:', error)
        }
      }
    }
    
    getChainIdFromWallet()
    
    // Also poll for chain changes every 2 seconds as a fallback
    const interval = setInterval(getChainIdFromWallet, 2000)
    
    return () => clearInterval(interval)
  }, [isConnected])

  // Prioritize manual chain ID detection over Wagmi hooks
  const actualChainId = manualChainId || chainId || chain?.id || 1

  // Debug chain information
  console.log('🔍 Chain Debug Info:', {
    wagmiChainId: chainId,
    wagmiChain: chain,
    manualChainId,
    actualChainId,
    isConnected,
    address,
    chainName: chain?.name
  })

  // Listen for chain changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleChainChanged = (chainId: string) => {
        const numericChainId = parseInt(chainId, 16)
        console.log('🔄 Chain changed to:', numericChainId)
        setManualChainId(numericChainId)
      }

      window.ethereum.on('chainChanged', handleChainChanged)
      
      return () => {
        window.ethereum?.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  // Fetch real wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (isConnected && address) {
        setLoading(true)
        try {
          console.log('Fetching real wallet data for payments page:', address, 'on chain:', actualChainId)
          
          // Fetch analytics and transactions
          const analyticsData = await getWalletAnalytics(address, actualChainId)
          setAnalytics(analyticsData)
          
          // Set real transactions
          setRecentTransactions(analyticsData.recentTransactions || [])
          
          // Fetch token balances
          const tokenBalances = await getTokenBalances(address, actualChainId)
          setTokens(tokenBalances || [])
          
          // Try to get unified balances from Avail
          try {
            const unified = await getUnifiedBalances()
            setUnifiedBalances(unified)
          } catch (error) {
            console.log('Unified balances not available, using regular balances')
          }
          
        } catch (error) {
          console.error('Error fetching wallet data:', error)
          // Fallback to empty data
          setRecentTransactions([])
          setTokens([])
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [isConnected, address, actualChainId, manualChainId])

  // Handle payment sending
  const handleSendPayment = async () => {
    if (!recipient || !amount || !selectedToken) {
      alert('Please fill in all fields')
      return
    }

    if (!isReady) {
      alert('Avail SDK not ready. Please connect your wallet.')
      return
    }

    try {
      // This would integrate with your Avail bridge functionality
      console.log('Sending payment:', { recipient, amount, selectedToken })
      // You can integrate this with your existing bridge functionality
      alert('Payment functionality will be integrated with Avail bridge')
    } catch (error) {
      console.error('Error sending payment:', error)
      alert('Failed to send payment')
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Payments</h2>
          <p className="text-gray-400">
            Send and receive crypto payments across multiple chains with ease.
          </p>
          <div className="mt-2 flex items-center gap-4">
            <div className="text-sm text-blue-400">
              🔗 Current Chain: {actualChainId === 10 ? 'OP Mainnet' : actualChainId === 1 ? 'Ethereum' : `Chain ${actualChainId}`} (ID: {actualChainId})
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                console.log('🔄 Manual refresh triggered')
                window.location.reload()
              }}
              className="text-xs"
            >
              🔄 Refresh Chain
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Debug: Wagmi={chainId} | Manual={manualChainId} | Chain={chain?.name} | Final={actualChainId}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Payment Form */}
          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Recipient Address
                </label>
                <Input
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Amount
                  </label>
                  <Input
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Token
                  </label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button 
                className="w-full neon-button" 
                onClick={handleSendPayment}
                disabled={!isReady || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Loading...' : 'Send Payment'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Request Payment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Cross-Chain Transfer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">Loading transactions...</span>
              </div>
            ) : recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((tx, index) => (
                  <div key={tx.hash || index} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.from?.toLowerCase() === address?.toLowerCase() ? 'bg-red-500/20' : 'bg-green-500/20'
                      }`}>
                        {tx.from?.toLowerCase() === address?.toLowerCase() ? (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {tx.from?.toLowerCase() === address?.toLowerCase() ? 'Sent' : 'Received'} {tx.value} ETH
                        </div>
                        <div className="text-gray-400 text-sm">
                          {tx.from?.toLowerCase() === address?.toLowerCase() ? 'To' : 'From'} {tx.from?.toLowerCase() === address?.toLowerCase() ? tx.to : tx.from}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                      <div className={`text-xs ${tx.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {tx.status === 'success' ? '✓ completed' : '✗ failed'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                {isConnected ? 'No transactions found' : 'Connect your wallet to view transactions'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Token Balances */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Your Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">Loading token balances...</span>
              </div>
            ) : tokens.length > 0 ? (
              <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }}>
                {tokens.map((token, index) => (
                  <Card key={token.symbol || index} variant="glass" hover className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                          <span className="text-blue-400 text-lg font-bold">{token.symbol?.[0] || 'T'}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{token.token || token.symbol}</div>
                          <div className="text-gray-400 text-sm">{token.symbol}</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-white text-lg font-semibold">{token.balance} {token.symbol}</div>
                      <div className="text-gray-400 text-sm">{token.value}</div>
                    </div>
                  </Card>
                ))}
              </ResponsiveGrid>
            ) : (
              <div className="text-center py-8 text-gray-400">
                {isConnected ? 'No token balances found' : 'Connect your wallet to view token balances'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
