"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResponsiveGrid } from "@/components/ui/responsive-grid"
import { 
  Wrench, 
  Zap, 
  Shield, 
  Globe, 
  Calculator, 
  Settings, 
  BarChart3,
  ArrowRightLeft,
  Lock,
  Activity
} from "lucide-react"

export default function ToolsPage() {
  const tools = [
    {
      title: "Gas Optimizer",
      description: "Find the best gas prices across networks",
      icon: Zap,
      status: "Active",
      color: "text-yellow-400"
    },
    {
      title: "Portfolio Tracker",
      description: "Track your assets across all chains",
      icon: BarChart3,
      status: "Active",
      color: "text-blue-400"
    },
    {
      title: "Cross-Chain Bridge",
      description: "Bridge tokens between networks",
      icon: Globe,
      status: "Active",
      color: "text-green-400"
    },
    {
      title: "Security Scanner",
      description: "Scan contracts for vulnerabilities",
      icon: Shield,
      status: "Active",
      color: "text-red-400"
    },
    {
      title: "Yield Calculator",
      description: "Calculate potential yields from staking",
      icon: Calculator,
      status: "Active",
      color: "text-purple-400"
    },
    {
      title: "Transaction Simulator",
      description: "Test transactions before execution",
      icon: Activity,
      status: "Active",
      color: "text-orange-400"
    }
  ]

  const quickActions = [
    {
      title: "Optimize Gas",
      description: "Find the best time to transact",
      icon: Zap,
    },
    {
      title: "Bridge Assets",
      description: "Move tokens between chains",
      icon: ArrowRightLeft,
    },
    {
      title: "Security Check",
      description: "Verify contract security",
      icon: Lock,
    }
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Tools</h2>
          <p className="text-sm md:text-base text-gray-400">
            Powerful Web3 tools to optimize your blockchain experience.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="glass-card p-4 cursor-pointer hover:bg-white/10 transition-colors duration-300" onClick={action.action}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <action.icon className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{action.title}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Available Tools */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Available Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }}>
              {tools.map((tool, index) => (
                <Card key={index} className="glass-card p-4 hover:bg-white/10 transition-colors duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <tool.icon className={`h-5 w-5 ${tool.color}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{tool.title}</h3>
                        <p className="text-gray-400 text-sm">{tool.description}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400`}>
                      {tool.status}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Use Tool
                  </Button>
                </Card>
              ))}
            </ResponsiveGrid>
          </CardContent>
        </Card>

        {/* Tool Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Optimization Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span className="text-white">Gas Price Optimizer</span>
                </div>
                <Button variant="outline" size="sm">Use</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Calculator className="h-4 w-4 text-purple-400" />
                  <span className="text-white">Yield Calculator</span>
                </div>
                <Button variant="outline" size="sm">Use</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                  <span className="text-white">Portfolio Analyzer</span>
                </div>
                <Button variant="outline" size="sm">Use</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-red-400" />
                  <span className="text-white">Contract Scanner</span>
                </div>
                <Button variant="outline" size="sm">Use</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4 text-green-400" />
                  <span className="text-white">Address Validator</span>
                </div>
                <Button variant="outline" size="sm">Use</Button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-orange-400" />
                  <span className="text-white">Transaction Simulator</span>
                </div>
                <Button variant="outline" size="sm">Use</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Tool Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Auto-optimize gas prices</h3>
                  <p className="text-gray-400 text-sm">Automatically find the best gas prices</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Cross-chain notifications</h3>
                  <p className="text-gray-400 text-sm">Get notified about cross-chain opportunities</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Security alerts</h3>
                  <p className="text-gray-400 text-sm">Receive alerts about potential security issues</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
