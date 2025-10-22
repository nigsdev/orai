"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveGrid } from "@/components/ui/responsive-grid"
import { Send, ArrowUpRight, ArrowDownLeft, CreditCard, Wallet } from "lucide-react"
import { useState } from "react"

export default function PaymentsPage() {
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState("ETH")

  const recentTransactions = [
    { id: 1, type: "send", amount: "0.5", token: "ETH", to: "0x742d...35Cc", time: "2 hours ago", status: "completed" },
    { id: 2, type: "receive", amount: "1.2", token: "ETH", from: "0x8f3a...9B2d", time: "5 hours ago", status: "completed" },
    { id: 3, type: "send", amount: "100", token: "DAI", to: "0x3c4b...7E8f", time: "1 day ago", status: "completed" },
    { id: 4, type: "receive", amount: "250", token: "DAI", from: "0x9a1b...4C5d", time: "2 days ago", status: "completed" },
  ]

  const tokens = [
    { symbol: "ETH", name: "Ethereum", balance: "2.45", value: "$4,890.50" },
    { symbol: "DAI", name: "Dai Stablecoin", balance: "1,250.00", value: "$1,250.00" },
    { symbol: "USDC", name: "USD Coin", balance: "500.00", value: "$500.00" },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Payments</h2>
          <p className="text-gray-400">
            Send and receive crypto payments across multiple chains with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Payment Form */}
          <Card variant="glass" className="lg:col-span-2">
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

              <Button className="w-full neon-button">
                <Send className="h-4 w-4 mr-2" />
                Send Payment
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card variant="glass">
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
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'send' ? 'bg-red-500/20' : 'bg-green-500/20'
                    }`}>
                      {tx.type === 'send' ? (
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">
                        {tx.type === 'send' ? 'Sent' : 'Received'} {tx.amount} {tx.token}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {tx.type === 'send' ? 'To' : 'From'} {tx.type === 'send' ? tx.to : tx.from}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">{tx.time}</div>
                    <div className="text-green-400 text-xs">✓ {tx.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Token Balances */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Your Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }}>
              {tokens.map((token) => (
                <Card key={token.symbol} variant="glass" hover className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-blue-400 text-lg font-bold">{token.symbol[0]}</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">{token.name}</div>
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
