"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveGrid } from "@/components/ui/responsive-grid"
import { Send, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet, Loader2, ChevronDown } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAccount, useBalance, useChainId } from "wagmi"
import { useChatStore } from "@/lib/store"
import { getWalletAnalytics, getTokenBalances } from "@/lib/blockscout"
import { getUnifiedBalances } from "@/lib/avail"

// Available tokens for dropdown
const availableTokens = [
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'USDC', name: 'USD Coin' },
  { symbol: 'USDT', name: 'Tether USD' },
  { symbol: 'MATIC', name: 'Polygon' },
  { symbol: 'WMATIC', name: 'Wrapped MATIC' },
]
import { useAvailNexus } from "@/hooks/useAvailNexus"
import { formatAddressForMobile, formatAddressForDesktop, cn } from "@/lib/utils"

const networks = [
  { name: "Ethereum", symbol: "ETH", chainId: 1 },
  { name: "Optimism", symbol: "OP", chainId: 10 },
  { name: "OP Sepolia", symbol: "ETH", chainId: 11155420 },
  { name: "Polygon", symbol: "MATIC", chainId: 137 },
  { name: "Arbitrum", symbol: "ARB", chainId: 42161 },
  { name: "Arbitrum Sepolia", symbol: "ETH", chainId: 421614 },
  { name: "Base", symbol: "BASE", chainId: 8453 },
]

// Chain Dropdown Component
function ChainDropdown({ selectedChain, setSelectedChain, isOpen, setIsOpen }: {
  selectedChain: string
  setSelectedChain: (chain: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:bg-white/10 transition-all duration-300"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm">{selectedChain}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/30 rounded-md shadow-2xl z-[9999] overflow-hidden">
          {networks.map((network) => (
            <button
              key={network.name}
              onClick={() => {
                setSelectedChain(network.name)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2 first:rounded-t-md last:rounded-b-md ${
                selectedChain === network.name ? "bg-accent-blue-500/30 text-accent-blue-500" : ""
              }`}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div>
                <div className="text-sm font-medium">{network.name}</div>
                <div className="text-xs text-gray-400">{network.symbol}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Token Dropdown Component
function TokenDropdown({ selectedToken, setSelectedToken, isOpen, setIsOpen }: {
  selectedToken: string
  setSelectedToken: (token: string) => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {
  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:bg-white/10 transition-all duration-300"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm">{selectedToken}</span>
        </div>
        <ChevronDown className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-white/30 rounded-md shadow-2xl z-[9999] overflow-hidden">
          {availableTokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => {
                setSelectedToken(token.symbol)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2 first:rounded-t-md last:rounded-b-md ${
                selectedToken === token.symbol ? "bg-accent-blue-500/30 text-accent-blue-500" : ""
              }`}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div>
                <div className="text-sm font-medium">{token.symbol}</div>
                <div className="text-xs text-gray-400">{token.name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PaymentsPage() {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState("ETH")
  const [selectedChain, setSelectedChain] = useState("Ethereum")
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const chainDropdownRef = useRef<HTMLDivElement>(null)
  const tokenDropdownRef = useRef<HTMLDivElement>(null)
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chainDropdownRef.current && !chainDropdownRef.current.contains(event.target as Node)) {
        setIsChainDropdownOpen(false)
      }
      if (tokenDropdownRef.current && !tokenDropdownRef.current.contains(event.target as Node)) {
        setIsTokenDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Prioritize manual chain ID detection over Wagmi hooks
  const actualChainId = manualChainId || chainId || chain?.id || 1
  
  // Get chain name with fallback
  const getChainName = (chainId: number): string => {
    const chainNames: Record<number, string> = {
      1: 'Ethereum',
      10: 'Optimism',
      11155420: 'OP Sepolia',
      11155111: 'Ethereum Sepolia',
      42161: 'Arbitrum',
      421614: 'Arbitrum Sepolia',
      137: 'Polygon',
      8453: 'Base',
      84532: 'Base Sepolia',
      80001: 'Polygon Mumbai'
    }
    return chainNames[chainId] || `Chain ${chainId}`
  }
  
  const chainName = getChainName(actualChainId)
  
  // Get wagmi chain with fallback
  const wagmiChain = chain || {
    id: chainId,
    name: getChainName(chainId || 1),
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [''] } },
    blockExplorers: { default: { name: '', url: '' } }
  }

  // Debug chain information
  console.log('🔍 Chain Debug Info:', {
    wagmiChainId: chainId,
    wagmiChain: wagmiChain,
    manualChainId,
    actualChainId,
    isConnected,
    address,
    chainName: chainName
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

  // Fetch real wallet data from multiple chains (like Analytics page)
  useEffect(() => {
    const fetchMultiChainWalletData = async () => {
      if (isConnected && address) {
        setLoading(true)
        try {
          console.log('Fetching multi-chain wallet data for payments page:', address)
          
          // Fetch data from Ethereum, OP Mainnet, and OP Sepolia (like Analytics page)
          const [ethereumData, optimismData, opSepoliaData] = await Promise.allSettled([
            getWalletAnalytics(address, 1), // Ethereum
            getWalletAnalytics(address, 10), // OP Mainnet
            getWalletAnalytics(address, 11155420) // OP Sepolia
          ])

          const ethereum = ethereumData.status === 'fulfilled' ? ethereumData.value : null
          const optimism = optimismData.status === 'fulfilled' ? optimismData.value : null
          const opSepolia = opSepoliaData.status === 'fulfilled' ? opSepoliaData.value : null

          console.log('📊 Ethereum data for payments:', ethereum)
          console.log('📊 OP Mainnet data for payments:', optimism)
          console.log('📊 OP Sepolia data for payments:', opSepolia)

          // Combine transactions from all chains
          const allTransactions = [
            ...(ethereum?.recentTransactions || []).map((tx: any) => ({ ...tx, chain: 'Ethereum' })),
            ...(optimism?.recentTransactions || []).map((tx: any) => ({ ...tx, chain: 'OP Mainnet' })),
            ...(opSepolia?.recentTransactions || []).map((tx: any) => ({ ...tx, chain: 'OP Sepolia' }))
          ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

          // Combine token balances from all chains
          const allTokens = [
            ...(ethereum?.wallet?.tokenBalances || []).map((token: any) => ({ ...token, chain: 'Ethereum' })),
            ...(optimism?.wallet?.tokenBalances || []).map((token: any) => ({ ...token, chain: 'OP Mainnet' })),
            ...(opSepolia?.wallet?.tokenBalances || []).map((token: any) => ({ ...token, chain: 'OP Sepolia' }))
          ]

          // Set the combined data
          setRecentTransactions(allTransactions)
          setTokens(allTokens)
          
          // Set analytics data (use the current chain's data for analytics)
          const currentChainData = actualChainId === 10 ? optimism : ethereum
          setAnalytics(currentChainData)
          
          // Try to get unified balances from Avail
          try {
            const unified = await getUnifiedBalances()
            setUnifiedBalances(unified)
          } catch (error) {
            console.log('Unified balances not available, using regular balances')
          }
          
        } catch (error) {
          console.error('Error fetching multi-chain wallet data:', error)
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

    fetchMultiChainWalletData()
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
      setLoading(true)
      
      // Get target chain ID from selected chain
      const targetChainId = networks.find(n => n.name === selectedChain)?.chainId || 1
      
      // Create cross-chain intent
      const intent = {
        chainFrom: actualChainId || 1,
        chainTo: targetChainId,
        token: selectedToken,
        amount: amount,
        walletAddress: address!,
        recipientAddress: recipient
      }

      console.log('Executing payment with intent:', intent)
      
      // Validate that we're doing a cross-chain transfer
      if (intent.chainFrom === intent.chainTo) {
        throw new Error('Please select a different target chain for cross-chain transfer')
      }
      
      // Execute bridge operation
      const result = await executeBridge(intent)
      
      console.log('Payment result:', result)
      
      // Validate transaction hash is real (starts with 0x and is 66 characters)
      if (!result.transactionHash || !result.transactionHash.startsWith('0x') || result.transactionHash.length !== 66) {
        throw new Error('Invalid transaction hash received')
      }
      
      alert(`Payment successful! Transaction: ${result.transactionHash}`)
      
      // Refresh wallet data
      window.location.reload()
      
    } catch (error) {
      console.error('Payment failed:', error)
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Test cross-chain payment function
  const testCrossChainPayment = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setLoading(true)
      
      // Test cross-chain bridge from current chain to Polygon
      const testIntent = {
        chainFrom: actualChainId || 1,
        chainTo: 137, // Polygon
        token: 'USDC',
        amount: '1',
        walletAddress: address,
        recipientAddress: address // Send to self for testing
      }

      console.log('Testing cross-chain payment:', testIntent)
      
      const result = await executeBridge(testIntent)
      
      console.log('Cross-chain test result:', result)
      alert(`Cross-chain test successful! Bridge ID: ${result.bridgeId}`)
      
    } catch (error) {
      console.error('Cross-chain test failed:', error)
      alert(`Cross-chain test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Test SDK bridge call function
  const testSDKBridge = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }
    
    try {
      setLoading(true)
      
      const testIntent = {
        chainFrom: actualChainId || 1,
        chainTo: 421614, // Arbitrum Sepolia
        token: 'USDC',
        amount: '0.001',
        walletAddress: address,
        recipientAddress: address
      }
      
      console.log('🧪 Testing SDK bridge call with intent:', testIntent)
      
      const { testSDKBridgeCall } = await import('@/lib/avail')
      const result = await testSDKBridgeCall(testIntent)
      
      console.log('🧪 SDK bridge test result:', result)
      
      if (result.success) {
        alert(`SDK bridge test successful! Result: ${JSON.stringify(result.result, null, 2)}`)
      } else {
        alert(`SDK bridge test failed: ${result.error}`)
      }
      
    } catch (error) {
      console.error('SDK bridge test failed:', error)
      alert(`SDK bridge test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Payments</h2>
          <p className="text-sm md:text-base text-gray-400">
            Send and receive crypto payments across multiple chains with ease.
          </p>
          <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <div className="text-xs md:text-sm text-blue-400">
              🔗 Current Chain: {chainName} (ID: {actualChainId})
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
          <div className="mt-2 text-xs text-gray-500 hidden sm:block">
            Debug: Wagmi={chainId} | Manual={manualChainId} | Chain={chainName} | Final={actualChainId}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Send Payment Form */}
          <Card className="glass-card lg:col-span-2 overflow-visible relative z-20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-visible">
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
              
              <div className="grid grid-cols-3 gap-4">
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
                <div ref={tokenDropdownRef}>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Token
                  </label>
                  <TokenDropdown 
                    selectedToken={selectedToken}
                    setSelectedToken={setSelectedToken}
                    isOpen={isTokenDropdownOpen}
                    setIsOpen={setIsTokenDropdownOpen}
                  />
                </div>
                <div ref={chainDropdownRef}>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">
                    Chain
                  </label>
                  <ChainDropdown 
                    selectedChain={selectedChain}
                    setSelectedChain={setSelectedChain}
                    isOpen={isChainDropdownOpen}
                    setIsOpen={setIsChainDropdownOpen}
                  />
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0" 
                onClick={handleSendPayment}
                disabled={!isReady || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Processing...' : 'Send Payment'}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass-card relative z-10">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <CreditCard className="h-4 w-4 mr-2" />
                Request Payment
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Cross-Chain Transfer
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="glass-card relative z-10">
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
              <div className="space-y-3 md:space-y-4">
                {recentTransactions.map((tx, index) => (
                  <div key={tx.hash || index} className="transaction-card flex items-start justify-between p-3 md:p-4 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                    <div className="flex items-start gap-3 min-w-0 flex-1 max-w-[calc(100%-120px)]">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tx.from?.toLowerCase() === address?.toLowerCase() ? 'bg-red-500/20' : 'bg-green-500/20'
                      }`}>
                        {tx.from?.toLowerCase() === address?.toLowerCase() ? (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        ) : (
                          <ArrowDownLeft className="w-4 h-4 text-green-400" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="text-white font-medium text-sm md:text-base truncate">
                          {tx.from?.toLowerCase() === address?.toLowerCase() ? 'Sent' : 'Received'} {tx.value} ETH
                        </div>
                        <div className="text-gray-400 text-xs md:text-sm mt-1 overflow-hidden">
                          <div className="flex items-center gap-1 min-w-0">
                            <span className="flex-shrink-0">
                              {tx.from?.toLowerCase() === address?.toLowerCase() ? 'To' : 'From'}
                            </span>
                            <span className="font-mono text-xs bg-white/5 px-1 py-1 rounded border border-white/10 truncate min-w-0 max-w-[140px] sm:max-w-[180px]">
                              {(() => {
                                const addressToShow = tx.from?.toLowerCase() === address?.toLowerCase() ? tx.to : tx.from;
                                if (!addressToShow) return 'N/A';
                                return `${addressToShow.slice(0, 6)}...${addressToShow.slice(-4)}`;
                              })()}
                            </span>
                          </div>
                        </div>
                        {tx.chain && (
                          <div className="text-xs text-blue-400 mt-1 truncate">
                            {tx.chain}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2 min-w-[100px]">
                      <div className="text-gray-400 text-xs md:text-sm">
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
                          {token.chain && (
                            <div className="text-xs text-blue-400">
                              {token.chain}
                            </div>
                          )}
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
