"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveGrid } from "@/components/ui/responsive-grid";
import { TrendingUp, TrendingDown, DollarSign, Activity } from "lucide-react";
import { useAccount, useChainId } from "wagmi";
import { useEffect, useState } from "react";
// Use API route instead of direct SDK import to avoid client bundling issues
import { formatAddressForMobile, formatAddressForDesktop } from "@/lib/utils";

export default function AnalyticsPage() {
  const { address, isConnected, chain } = useAccount();
  const chainId = useChainId();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [multiChainData, setMultiChainData] = useState<any>({
    ethereum: null,
    optimism: null,
    opSepolia: null,
    combined: null,
  });

  // Fetch multi-chain wallet analytics
  useEffect(() => {
    const fetchMultiChainAnalytics = async () => {
      if (isConnected && address) {
        setLoading(true);
        try {
          console.log("🔄 Fetching multi-chain analytics for wallet:", address);

          // Fetch data from Ethereum, OP Mainnet, and OP Sepolia
          const fetchChain = async (addr: string, chain: number) => {
            const res = await fetch(
              `/api/analytics?address=${addr}&chainId=${chain}`
            );
            if (!res.ok) throw new Error(`API ${chain} failed`);
            const json = await res.json();
            return json.data; // { analytics, recentTransactions, tokenBalances, summary }
          };

          const [ethereumData, optimismData, opSepoliaData] =
            await Promise.allSettled([
              fetchChain(address, 1),
              fetchChain(address, 10),
              fetchChain(address, 11155420),
            ]);

          const ethereum =
            ethereumData.status === "fulfilled" ? ethereumData.value : null;
          const optimism =
            optimismData.status === "fulfilled" ? optimismData.value : null;
          const opSepolia =
            opSepoliaData.status === "fulfilled" ? opSepoliaData.value : null;

          console.log("📊 Ethereum data:", ethereum);
          console.log("📊 OP Mainnet data:", optimism);
          console.log("📊 OP Sepolia data:", opSepolia);

          // Combine the data
          const combined = {
            totalBalance: (
              parseFloat(ethereum?.wallet?.balance || "0") +
              parseFloat(optimism?.wallet?.balance || "0") +
              parseFloat(opSepolia?.wallet?.balance || "0")
            ).toFixed(4),
            totalTransactions:
              (ethereum?.wallet?.transactionCount || 0) +
              (optimism?.wallet?.transactionCount || 0) +
              (opSepolia?.wallet?.transactionCount || 0),
            allTransactions: [
              ...(ethereum?.recentTransactions || []).map((tx: any) => ({
                ...tx,
                chain: "Ethereum",
              })),
              ...(optimism?.recentTransactions || []).map((tx: any) => ({
                ...tx,
                chain: "OP Mainnet",
              })),
              ...(opSepolia?.recentTransactions || []).map((tx: any) => ({
                ...tx,
                chain: "OP Sepolia",
              })),
            ].sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            ),
            tokenBalances: {
              ethereum: ethereum?.wallet?.tokenBalances || [],
              optimism: optimism?.wallet?.tokenBalances || [],
              opSepolia: opSepolia?.wallet?.tokenBalances || [],
            },
          };

          setMultiChainData({ ethereum, optimism, opSepolia, combined });
          setAnalytics(combined);

          console.log("✅ Combined analytics data:", combined);
        } catch (error) {
          console.error("❌ Error fetching multi-chain analytics:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchMultiChainAnalytics();
  }, [isConnected, address]);

  // Calculate real stats from multi-chain data
  const totalEthBalance = parseFloat(analytics?.totalBalance || "0");
  const totalTransactions = analytics?.totalTransactions || 0;
  const allTransactions = analytics?.allTransactions || [];

  // Calculate real cross-chain volume (sum of all transaction values)
  const crossChainVolume = allTransactions.reduce((sum: number, tx: any) => {
    return sum + parseFloat(tx.value || "0");
  }, 0);

  // Calculate real gas fees from transactions
  const totalGasFees = allTransactions.reduce((sum: number, tx: any) => {
    const gasUsed = parseInt(tx.gasUsed || "0");
    const gasPrice = parseInt(tx.gasPrice || "0");
    const gasFeeInEth = (gasUsed * gasPrice) / Math.pow(10, 18);
    return sum + gasFeeInEth;
  }, 0);

  const stats = [
    {
      title: "Total Portfolio Value",
      value:
        totalEthBalance > 0
          ? `${totalEthBalance.toFixed(4)} ETH`
          : "0.0000 ETH",
      change: "Real Balance",
      changeType: "neutral" as const,
      icon: DollarSign,
      description: "Across all chains",
    },
    {
      title: "Total Transactions",
      value: totalTransactions.toString(),
      icon: Activity,
      description: "All chains combined",
    },
    {
      title: "Cross-Chain Volume",
      value:
        crossChainVolume > 0
          ? `${crossChainVolume.toFixed(4)} ETH`
          : "0.0000 ETH",
      change: "Real Volume",
      changeType: "neutral" as const,
      icon: TrendingUp,
      description: "Total transaction volume",
    },
    {
      title: "Total Gas Fees",
      value:
        totalGasFees > 0 ? `${totalGasFees.toFixed(6)} ETH` : "0.000000 ETH",
      change: "Real Fees",
      changeType: "neutral" as const,
      icon: TrendingDown,
      description: "Total gas spent",
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Analytics
          </h2>
          <p className="text-sm md:text-base text-gray-400">
            Comprehensive insights into your Web3 portfolio and transaction
            patterns.
          </p>
          {isConnected && (
            <div className="mt-2 text-xs md:text-sm text-blue-400">
              📊 Connected Wallet: {address} | Loading: {loading ? "Yes" : "No"}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }}>
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              description={stat.description}
              trend={{
                value: parseFloat(stat.change.replace(/[+%]/g, "")),
                label: stat.description,
              }}
            />
          ))}
        </ResponsiveGrid>

        {/* Real Analytics Overview */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Ethereum Balance"
            value={
              multiChainData.ethereum?.wallet?.balance
                ? `${multiChainData.ethereum.wallet.balance} ETH`
                : "0.0000 ETH"
            }
            description="Ethereum Mainnet"
            icon={DollarSign}
            trend={{ value: 0, label: "Ethereum balance" }}
          />
          <StatsCard
            title="OP Mainnet Balance"
            value={
              multiChainData.optimism?.wallet?.balance
                ? `${multiChainData.optimism.wallet.balance} ETH`
                : "0.0000 ETH"
            }
            description="OP Mainnet"
            icon={TrendingUp}
            trend={{ value: 0, label: "OP Mainnet balance" }}
          />
          <StatsCard
            title="Total Transactions"
            value={analytics?.totalTransactions?.toString() || "0"}
            description="All chains combined"
            icon={Activity}
            trend={{ value: 0, label: "Total transactions" }}
          />
          <StatsCard
            title="Active Chains"
            value={`${
              [multiChainData.ethereum, multiChainData.optimism].filter(Boolean)
                .length
            }/2`}
            description="Chains with activity"
            icon={TrendingDown}
            trend={{ value: 0, label: "Active chains" }}
          />
        </div>

        {/* Testnet Chain Balances */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          <StatsCard
            title="OP Sepolia Balance"
            value={multiChainData.opSepolia?.wallet?.balance ? `${multiChainData.opSepolia.wallet.balance} ETH` : "0.0000 ETH"}
            description="OP Sepolia Testnet"
            icon={TrendingUp}
            trend={{ value: 0, label: "OP Sepolia balance" }}
          />
          <StatsCard
            title="Arbitrum Sepolia Balance"
            value={multiChainData.arbitrumSepolia?.wallet?.balance ? `${multiChainData.arbitrumSepolia.wallet.balance} ETH` : "0.0000 ETH"}
            description="Arbitrum Sepolia Testnet"
            icon={TrendingDown}
            trend={{ value: 0, label: "Arbitrum Sepolia balance" }}
          />
        </div>

        {/* Additional Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="glass-card">
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
              ) : analytics?.allTransactions?.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {analytics.allTransactions
                    .slice(0, 5)
                    .map((tx: any, index: number) => (
                      <div
                        key={index}
                        className="transaction-card flex items-start justify-between p-3 md:p-4 rounded-lg bg-white/5 border border-white/10 overflow-hidden"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1 max-w-[calc(100%-120px)]">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              tx.from?.toLowerCase() === address?.toLowerCase()
                                ? "bg-red-500/20"
                                : "bg-green-500/20"
                            }`}
                          >
                            {tx.from?.toLowerCase() ===
                            address?.toLowerCase() ? (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="text-white font-medium text-sm md:text-base truncate">
                              {tx.from?.toLowerCase() === address?.toLowerCase()
                                ? "Sent"
                                : "Received"}{" "}
                              {tx.value} ETH
                            </div>
                            <div className="text-gray-400 text-xs md:text-sm mt-1 overflow-hidden">
                              <div className="flex items-center gap-1 min-w-0">
                                <span className="flex-shrink-0">
                                  {tx.from?.toLowerCase() ===
                                  address?.toLowerCase()
                                    ? "To"
                                    : "From"}
                                </span>
                                <span className="font-mono text-xs bg-white/5 px-1 py-1 rounded border border-white/10 truncate min-w-0 max-w-[140px] sm:max-w-[180px]">
                                  {(() => {
                                    const addressToShow =
                                      tx.from?.toLowerCase() ===
                                      address?.toLowerCase()
                                        ? tx.to
                                        : tx.from;
                                    if (!addressToShow) return "N/A";
                                    return `${addressToShow.slice(
                                      0,
                                      6
                                    )}...${addressToShow.slice(-4)}`;
                                  })()}
                                </span>
                              </div>
                            </div>
                            <div className="text-xs text-blue-400 mt-1 truncate">
                              {tx.chain}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2 min-w-[100px]">
                          <div className="text-gray-400 text-xs md:text-sm">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </div>
                          <div
                            className={`text-xs ${
                              tx.status === "success"
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
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
                    {isConnected
                      ? "This wallet has no recent transactions"
                      : "Connect your wallet to view transactions"}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Multi-Chain Portfolio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Ethereum Chain */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-blue-400">
                    Ethereum
                  </div>
                  {analytics?.tokenBalances?.ethereum?.length > 0 ? (
                    analytics.tokenBalances.ethereum.map(
                      (token: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                            <span className="text-white text-sm">
                              {token.symbol}
                            </span>
                          </div>
                          <span className="text-white font-medium text-sm">
                            {token.balance}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-gray-400 text-sm">
                      No tokens on Ethereum
                    </div>
                  )}
                </div>

                {/* Arbitrum Sepolia Chain */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-orange-400">
                    OP Mainnet
                  </div>
                  {analytics?.tokenBalances?.optimism?.length > 0 ? (
                    analytics.tokenBalances.optimism.map(
                      (token: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                            <span className="text-white text-sm">
                              {token.symbol}
                            </span>
                          </div>
                          <span className="text-white font-medium text-sm">
                            {token.balance}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <div className="text-gray-400 text-sm">
                      No tokens on OP Mainnet
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
