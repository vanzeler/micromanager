'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, Monitor, Package, ArrowLeftRight,
  Key, UserMinus, FileBarChart, LogOut, ChevronLeft,
  ChevronRight, Settings, ClipboardList, Bell, Menu
} from 'lucide-react'
import { clsx } from 'clsx'
import { User } from '@/lib/auth'

interface SidebarProps {
  user: User | null
  collapsed: boolean
  onToggle: () => void
  onLogout: () => void
}

const navItems = [
  { href: '/dashboard',      label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/colaboradores',  label: 'Colaboradores',  icon: Users },
  { href: '/equipamentos',   label: 'Equipamentos',   icon: Monitor },
  { href: '/estoque',        label: 'Estoque',        icon: Package },
  { href: '/movimentacoes',  label: 'Movimentações',  icon: ArrowLeftRight },
  { href: '/licencas',       label: 'Licenças',       icon: Key },
  { href: '/desligamentos',  label: 'Desligamentos',  icon: UserMinus },
  { href: '/relatorios',     label: 'Relatórios',     icon: FileBarChart },
  { href: '/logs',           label: 'Auditoria',      icon: ClipboardList },
  { href: '/usuarios',       label: 'Usuários',       icon: Settings },
]

const perfilLabel: Record<string, string> = {
  administrador:    'Administrador',
  tecnico_ti:       'Técnico de TI',
  gestor:           'Gestor',
  somente_leitura:  'Somente Leitura',
}

export default function Sidebar({ user, collapsed, onToggle, onLogout }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={clsx(
      'flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 h-screen sticky top-0',
      collapsed ? 'w-16' : 'w-60'
    )}>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
        {!collapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm truncate">Sistema TI</span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <Monitor className="w-4 h-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toggle quando collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="flex items-center justify-center py-2 text-gray-500 hover:text-gray-300 transition-colors border-b border-gray-800"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100',
                collapsed && 'justify-center'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-800 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {user?.nome?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.nome}</p>
              <p className="text-xs text-gray-500 truncate">
                {perfilLabel[user?.perfil || ''] || user?.perfil}
              </p>
            </div>
            <button
              onClick={onLogout}
              title="Sair"
              className="text-gray-500 hover:text-red-400 transition-colors p-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            title="Sair"
            className="flex items-center justify-center w-full text-gray-500 hover:text-red-400 transition-colors py-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
