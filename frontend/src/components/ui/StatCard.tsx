import { LucideIcon } from 'lucide-react'
import { clsx } from 'clsx'

interface StatCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: LucideIcon
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
  trend?: { value: number; label: string }
}

const colors = {
  blue:   { bg: 'bg-blue-900/30',   icon: 'bg-blue-600',   text: 'text-blue-400'   },
  green:  { bg: 'bg-green-900/30',  icon: 'bg-green-600',  text: 'text-green-400'  },
  yellow: { bg: 'bg-yellow-900/30', icon: 'bg-yellow-600', text: 'text-yellow-400' },
  red:    { bg: 'bg-red-900/30',    icon: 'bg-red-600',    text: 'text-red-400'    },
  purple: { bg: 'bg-purple-900/30', icon: 'bg-purple-600', text: 'text-purple-400' },
  gray:   { bg: 'bg-gray-800/50',   icon: 'bg-gray-600',   text: 'text-gray-400'   },
}

export default function StatCard({
  title, value, subtitle, icon: Icon, color = 'blue', trend
}: StatCardProps) {
  const c = colors[color]
  return (
    <div className={clsx('card flex items-start gap-4', c.bg)}>
      <div className={clsx('p-3 rounded-xl flex-shrink-0', c.icon)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        {subtitle && <p className={clsx('text-xs mt-1', c.text)}>{subtitle}</p>}
        {trend && (
          <p className={clsx('text-xs mt-1', trend.value >= 0 ? 'text-green-400' : 'text-red-400')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  )
}
