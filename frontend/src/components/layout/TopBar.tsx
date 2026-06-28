'use client'
import { Bell, Search, Menu } from 'lucide-react'
import { User } from '@/lib/auth'

interface TopBarProps {
  user: User | null
  title: string
  onMenuToggle?: () => void
}

export default function TopBar({ user, title, onMenuToggle }: TopBarProps) {
  return (
    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="text-gray-400 hover:text-gray-200 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative text-gray-400 hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-800">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">
            {user?.nome?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  )
}
