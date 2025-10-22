import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
}

export function StatsCard({ title, value, description, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="glass-card rounded-xl p-6 hover:glow-accent-hover transition-all duration-300">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium leading-none tracking-tight text-gray-300">
          {title}
        </p>
        <Icon className="h-5 w-5 text-accent-blue-500" />
      </div>
      <div className="pt-0">
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className="text-xs text-gray-400 mt-1">
          {description}
        </p>
        {trend && (
          <div className="flex items-center pt-2">
            <span className={`text-xs font-medium ${
              trend.value > 0 ? "text-green-400" : "text-red-400"
            }`}>
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-gray-500 ml-1">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
