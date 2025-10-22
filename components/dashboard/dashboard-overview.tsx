import { StatsCard } from "./stats-card"
import { Users, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
        <p className="text-gray-400">
          Welcome to your dashboard. Here's an overview of your data.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value="$45,231.89"
          description="+20.1% from last month"
          icon={DollarSign}
          trend={{ value: 20.1, label: "from last month" }}
        />
        <StatsCard
          title="Subscriptions"
          value="+2350"
          description="+180.1% from last month"
          icon={Users}
          trend={{ value: 180.1, label: "from last month" }}
        />
        <StatsCard
          title="Sales"
          value="+12,234"
          description="+19% from last month"
          icon={ShoppingCart}
          trend={{ value: 19, label: "from last month" }}
        />
        <StatsCard
          title="Active Now"
          value="+573"
          description="+201 since last hour"
          icon={TrendingUp}
          trend={{ value: 201, label: "since last hour" }}
        />
      </div>
    </div>
  )
}
