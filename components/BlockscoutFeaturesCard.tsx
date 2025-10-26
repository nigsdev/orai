'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  BarChart3, 
  History, 
  Eye, 
  Shield, 
  Zap,
  Globe,
  TrendingUp,
  Wallet,
  Activity
} from "lucide-react"

export function BlockscoutFeaturesCard() {
  const features = [
    {
      icon: <Search className="h-5 w-5" />,
      title: "Wallet Analytics",
      description: "Comprehensive wallet analysis with transaction patterns, volume, and spending insights",
      badge: "Analytics"
    },
    {
      icon: <History className="h-5 w-5" />,
      title: "Transaction History",
      description: "Real-time transaction history with detailed gas fees, status, and explorer links",
      badge: "History"
    },
    {
      icon: <Eye className="h-5 w-5" />,
      title: "Transaction Monitoring",
      description: "Monitor pending transactions and track their status across multiple networks",
      badge: "Monitoring"
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: "Multi-Chain Support",
      description: "Access data from Ethereum, Polygon, Arbitrum, Base, and other EVM networks",
      badge: "Multi-Chain"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Spending Patterns",
      description: "Analyze transaction types, gas usage patterns, and wallet behavior over time",
      badge: "Insights"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Security Insights",
      description: "Identify suspicious activities, contract interactions, and security patterns",
      badge: "Security"
    }
  ]

  const supportedChains = [
    { name: "Ethereum", chainId: 1, color: "bg-blue-500" },
    { name: "Polygon", chainId: 137, color: "bg-purple-500" },
    { name: "Arbitrum", chainId: 42161, color: "bg-cyan-500" },
    { name: "Base", chainId: 8453, color: "bg-blue-600" },
  ]

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Activity className="h-6 w-6 text-blue-400" />
          Blockscout Integration
        </CardTitle>
        <p className="text-sm text-gray-400">
          Powered by Blockscout APIs for real-time blockchain data and analytics
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="text-blue-400 mt-0.5">
                  {feature.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white text-sm">{feature.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supported Networks */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Supported Networks</h3>
          <div className="flex flex-wrap gap-2">
            {supportedChains.map((chain) => (
              <div key={chain.chainId} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className={`w-2 h-2 rounded-full ${chain.color}`}></div>
                <span className="text-sm text-white">{chain.name}</span>
                <span className="text-xs text-gray-400">#{chain.chainId}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Example Queries */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Try These Commands</h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
              <code className="text-sm text-blue-300">
                wallet-analytics &lt;address&gt;
              </code>
              <p className="text-xs text-gray-400 mt-1">Get comprehensive wallet analytics</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
              <code className="text-sm text-blue-300">
                transaction-history &lt;address&gt;
              </code>
              <p className="text-xs text-gray-400 mt-1">View recent transaction history</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
              <code className="text-sm text-blue-300">
                &lt;address&gt; show last 5 transactions
              </code>
              <p className="text-xs text-gray-400 mt-1">Show specific number of transactions</p>
            </div>
          </div>
        </div>

        {/* Data Source */}
        <div className="pt-2 border-t border-slate-700">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield className="h-4 w-4" />
            <span>Data sourced from official Blockscout APIs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

