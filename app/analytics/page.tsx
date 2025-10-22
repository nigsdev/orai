"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveGrid } from "@/components/ui/responsive-grid"
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react"
import { useChatStore } from "@/lib/store"
import { useEffect, useState } from "react"
import { getWalletAnalytics } from "@/lib/blockscout"

export default function AnalyticsPage() {
  const { wallet } = useChatStore()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch wallet analytics when wallet is connected
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (wallet.isConnected && wallet.address) {
        setLoading(true)
        try {
          console.log('Fetching analytics for wallet:', wallet.address)
          const data = await getWalletAnalytics(wallet.address, wallet.chainId || 1)
          setAnalytics(data)
          console.log('Analytics data received:', data)
        } catch (error) {
          console.error('Error fetching analytics:', error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [wallet.isConnected, wallet.address, wallet.chainId])

  // Calculate stats from real data or use defaults
  const stats = [
    {
      title: "Total Portfolio Value",
      value: analytics?.wallet?.balance ? `$${(parseFloat(analytics.wallet.balance) * 2000).toFixed(2)}` : "$0.00",
      change: "+5.2%",
      changeType: "positive" as const,
      icon: DollarSign,
      description: "From last month"
    },
    {
      title: "Active Transactions",
      value: analytics?.wallet?.transactionCount?.toString() || "0",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: Activity,
      description: "This month"
    },
    {
      title: "Cross-Chain Volume",
      value: "$2,340.00",
      change: "-2.1%",
      changeType: "negative" as const,
      icon: TrendingUp,
      description: "Last 30 days"
    },
    {
      title: "Gas Fees Saved",
      value: "$45.20",
      change: "+8.3%",
      changeType: "positive" as const,
      icon: TrendingDown,
      description: "Optimization savings"
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Analytics</h2>
          <p className="text-gray-400">
            Comprehensive insights into your Web3 portfolio and transaction patterns.
          </p>
        </div>

        {/* Stats Grid */}
        <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              description={stat.description}
            />
          ))}
        </ResponsiveGrid>

        {/* Dashboard Overview */}
        <DashboardOverview />

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="glass">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-16 bg-white/5 rounded-lg"></div>
                    <div className="h-16 bg-white/5 rounded-lg mt-2"></div>
                  </div>
                </div>
              ) : analytics?.recentTransactions?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentTransactions.slice(0, 5).map((tx: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.from?.toLowerCase() === wallet.address?.toLowerCase() ? 'bg-red-500/20' : 'bg-green-500/20'
                        }`}>
                          {tx.from?.toLowerCase() === wallet.address?.toLowerCase() ? (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          ) : (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-white font-medium">
                            {tx.from?.toLowerCase() === wallet.address?.toLowerCase() ? 'Sent' : 'Received'} {tx.value} ETH
                          </div>
                          <div className="text-gray-400 text-sm">
                            {tx.from?.toLowerCase() === wallet.address?.toLowerCase() ? 'To' : 'From'} {tx.from?.toLowerCase() === wallet.address?.toLowerCase() ? tx.to : tx.from}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-400 text-sm">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                        <div className={`text-xs ${tx.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                          ✓ {tx.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400">No transactions found</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {wallet.isConnected ? 'This wallet has no recent transactions' : 'Connect your wallet to view transactions'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-white">Ethereum</span>
                  </div>
                  <span className="text-white font-medium">65%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-white">Stablecoins</span>
                  </div>
                  <span className="text-white font-medium">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                    <span className="text-white">DeFi Tokens</span>
                  </div>
                  <span className="text-white font-medium">10%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
