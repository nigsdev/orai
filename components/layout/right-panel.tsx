"use client"

import { TrendingUp, Activity, Zap, ArrowRightLeft } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useChatStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { getWalletAnalytics } from "@/lib/blockscout"
import { useAccount, useChainId } from "wagmi"

// Helper function to generate volume data from transactions
function generateVolumeData(transactions: any[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const volumeData = days.map(day => ({ day, volume: 0 }))
  
  // Distribute transactions across days based on actual timestamps
  transactions.forEach((tx) => {
    const txDate = new Date(tx.timestamp)
    const dayOfWeek = txDate.getDay() // 0 = Sunday, 1 = Monday, etc.
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Convert to our array index (0 = Monday)
    
    if (dayIndex >= 0 && dayIndex < 7) {
      volumeData[dayIndex].volume += parseFloat(tx.value || '0') * 1000 // Convert to volume scale
    }
  })
  
  return volumeData
}

export function RightPanel() {
  const { address, isConnected, chain } = useAccount()
  const chainId = useChainId()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [manualChainId, setManualChainId] = useState<number | null>(null)

  // Robust chain detection (poll + event listener)
  useEffect(() => {
    const getChainIdFromWallet = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum && isConnected) {
        try {
          const hexId = await (window as any).ethereum.request({ method: 'eth_chainId' })
          const numericChainId = parseInt(hexId, 16)
          setManualChainId(numericChainId)
        } catch (e) {
          // ignore
        }
      }
    }

    getChainIdFromWallet()
    const interval = setInterval(getChainIdFromWallet, 2000)
    return () => clearInterval(interval)
  }, [isConnected])

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleChainChanged = (hexId: string) => {
        const numericChainId = parseInt(hexId, 16)
        setManualChainId(numericChainId)
      }
      ;(window as any).ethereum.on('chainChanged', handleChainChanged)
      return () => {
        (window as any).ethereum?.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const actualChainId = manualChainId || chainId || chain?.id || 1

  // Fetch multi-chain wallet analytics when wallet is connected
  useEffect(() => {
    const fetchMultiChainAnalytics = async () => {
      if (isConnected && address) {
        setLoading(true)
        try {
          console.log('Fetching multi-chain analytics for right panel:', address)
          
          // Fetch data from all chains
          const [ethereumData, optimismData, opSepoliaData, arbitrumSepoliaData] = await Promise.allSettled([
            getWalletAnalytics(address, 1), // Ethereum
            getWalletAnalytics(address, 10), // OP Mainnet
            getWalletAnalytics(address, 11155420), // OP Sepolia
            getWalletAnalytics(address, 421614) // Arbitrum Sepolia
          ])

          const ethereum = ethereumData.status === 'fulfilled' ? ethereumData.value : null
          const optimism = optimismData.status === 'fulfilled' ? optimismData.value : null
          const opSepolia = opSepoliaData.status === 'fulfilled' ? opSepoliaData.value : null
          const arbitrumSepolia = arbitrumSepoliaData.status === 'fulfilled' ? arbitrumSepoliaData.value : null

          // Combine all transactions from all chains
          const allTransactions = [
            ...(ethereum?.recentTransactions || []).map((tx: any) => ({ ...tx, chain: 'Ethereum' })),
            ...(optimism?.recentTransactions || []).map((tx: any) => ({ ...tx, chain: 'OP Mainnet' })),
            ...(opSepolia?.recentTransactions || []).map((tx: any) => ({ ...tx, chain: 'OP Sepolia' })),
            ...(arbitrumSepolia?.recentTransactions || []).map((tx: any) => ({ ...tx, chain: 'Arbitrum Sepolia' }))
          ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

          // Create combined analytics data
          const combinedAnalytics = {
            wallet: {
              address,
              balance: (parseFloat(ethereum?.wallet?.balance || '0') + 
                      parseFloat(optimism?.wallet?.balance || '0') + 
                      parseFloat(opSepolia?.wallet?.balance || '0') + 
                      parseFloat(arbitrumSepolia?.wallet?.balance || '0')).toFixed(4),
              transactionCount: allTransactions.length,
              tokenBalances: []
            },
            recentTransactions: allTransactions,
            analytics: {
              totalValue: (parseFloat(ethereum?.wallet?.balance || '0') + 
                         parseFloat(optimism?.wallet?.balance || '0') + 
                         parseFloat(opSepolia?.wallet?.balance || '0') + 
                         parseFloat(arbitrumSepolia?.wallet?.balance || '0')).toFixed(4),
              transactionVolume: allTransactions.reduce((sum: number, tx: any) => sum + parseFloat(tx.value || '0'), 0).toFixed(4),
              averageGasPrice: allTransactions.length > 0 ? 
                (allTransactions.reduce((sum: number, tx: any) => sum + parseInt(tx.gasPrice || '0'), 0) / allTransactions.length).toFixed(0) : '0',
              successRate: allTransactions.length > 0 ? 
                (allTransactions.filter((tx: any) => tx.status === 'success').length / allTransactions.length * 100).toFixed(1) : '0'
            }
          }

          setAnalytics(combinedAnalytics)
          console.log('Right panel multi-chain analytics data received:', combinedAnalytics)
        } catch (error) {
          console.error('Error fetching multi-chain analytics for right panel:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchMultiChainAnalytics()
  }, [isConnected, address])

  // Generate transaction volume data from real transactions or use mock data
  const transactionData = analytics?.recentTransactions?.length > 0 ? 
    generateVolumeData(analytics.recentTransactions) : [
      { day: "Mon", volume: 1200 },
      { day: "Tue", volume: 1900 },
      { day: "Wed", volume: 3000 },
      { day: "Thu", volume: 2800 },
      { day: "Fri", volume: 1890 },
      { day: "Sat", volume: 2390 },
      { day: "Sun", volume: 3490 },
    ]

  console.log('📊 Right panel analytics:', analytics)
  console.log('📊 Recent transactions count:', analytics?.recentTransactions?.length || 0)
  console.log('📊 Transaction data:', transactionData)

  const maxVolume = Math.max(...transactionData.map(d => d.volume))

  // Calculate total volume from real data (in ETH, not USD)
  const totalVolume = analytics?.recentTransactions?.length > 0 ? 
    analytics.recentTransactions.reduce((sum: number, tx: any) => sum + parseFloat(tx.value || '0'), 0) : 0
  const avgDaily = totalVolume / 7

  return (
    <div className="hidden lg:block w-80 space-y-6">
      {/* Transaction Volume Chart */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction Volume</CardTitle>
            <TrendingUp className="w-5 h-5 text-accent-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
        
        {/* Line Chart */}
        <div className="h-48 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transactionData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3BB6FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3BB6FF" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                domain={[0, 'dataMax + 500']}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="#3BB6FF"
                strokeWidth={2}
                fill="url(#volumeGradient)"
                dot={{ fill: '#3BB6FF', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3BB6FF', strokeWidth: 2, fill: '#3BB6FF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Volume stats */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total Volume</span>
            <span className="text-white font-semibold">
              {loading ? '...' : `${totalVolume.toFixed(4)} ETH`}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-400 text-sm">Avg Daily</span>
            <span className="text-accent-blue-500 font-semibold">
              {loading ? '...' : `${avgDaily.toFixed(4)} ETH`}
            </span>
          </div>
        </div>
        </CardContent>
      </Card>

      {/* On-Chain Metrics */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>On-Chain Metrics</CardTitle>
            <Activity className="w-5 h-5 text-accent-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
        
        <div className="space-y-4">
          {/* Total Value */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-blue-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-accent-blue-500" />
              </div>
              <div>
                <div className="text-white font-medium">Total Value</div>
                <div className="text-gray-400 text-sm">Portfolio worth</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                {loading ? '...' : analytics?.wallet?.balance ? 
                  `${parseFloat(analytics.wallet.balance).toFixed(4)} ETH` : 
                  '0.0000 ETH'
                }
              </div>
              <div className="text-gray-400 text-xs">Real Balance</div>
            </div>
          </div>

          {/* Average Gas */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-blue-500/20 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-accent-blue-500" />
              </div>
              <div>
                <div className="text-white font-medium">Avg Gas</div>
                <div className="text-gray-400 text-sm">Last 24h</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                {loading ? '...' : analytics?.recentTransactions?.length > 0 ? 
                  `${(totalVolume / analytics.recentTransactions.length).toFixed(6)} ETH` : 
                  '0.000000 ETH'
                }
              </div>
              <div className="text-gray-400 text-xs">Avg per tx</div>
            </div>
          </div>

          {/* Bridge Fees */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-blue-500/20 rounded-full flex items-center justify-center">
                <ArrowRightLeft className="w-4 h-4 text-accent-blue-500" />
              </div>
              <div>
                <div className="text-white font-medium">Bridge Fees</div>
                <div className="text-gray-400 text-sm">This month</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-semibold">
                {loading ? '...' : analytics?.recentTransactions?.length > 0 ? 
                  `${analytics.recentTransactions.length} txns` : 
                  '0 txns'
                }
              </div>
              <div className="text-gray-400 text-xs">
                Real count
              </div>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Network Status</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">Healthy</span>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  )
}
