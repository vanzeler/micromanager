'use client'
import AppLayout from '@/components/layout/AppLayout'
import { FileBarChart, Download, Users, Monitor, Key, Shield, UserMinus } from 'lucide-react'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface Relatorio {
  id: string
  title: string
  description: string
  icon: any
  endpoint: string
  filename: string
  color: string
  filtros?: { label: string; name: string; options: { value: string; label: string }[] }[]
}

const relatorios: Relatorio[] = [
  {
    id: 'equipamentos',
    title: 'Equipamentos',
    description: 'Inventário completo com status, colaborador e garantia',
    icon: Monitor,
    endpoint: '/relatorios/equipamentos',
    filename: 'equipamentos.xlsx',
    color: 'blue',
    filtros: [
      { label: 'Status', name: 'status', options: [
        { value: '', label: 'Todos' },
        { value: 'disponivel', label: 'Disponível' },
        { value: 'em_uso', label: 'Em uso' },
        { value: 'manutencao', label: 'Manutenção' },
      ]},
      { label: 'Tipo', name: 'tipo', options: [
        { value: '', label: 'Todos' },
        { value: 'notebook', label: 'Notebook' },
        { value: 'computador', label: 'Computador' },
        { value: 'monitor', label: 'Monitor' },
      ]},
    ],
  },
  {
    id: 'colaboradores',
    title: 'Colaboradores',
    description: 'Lista de colaboradores com departamento e status',
    icon: Users,
    endpoint: '/relatorios/colaboradores',
    filename: 'colaboradores.xlsx',
    color: 'green',
    filtros: [
      { label: 'Status', name: 'status', options: [
        { value: '', label: 'Todos' },
        { value: 'ativo', label: 'Ativo' },
        { value: 'inativo', label: 'Inativo' },
        { value: 'desligado', label: 'Desligado' },
      ]},
    ],
  },
  {
    id: 'licencas',
    title: 'Licenças de Software',
    description: 'Licenças com validade, uso e status',
    icon: Key,
    endpoint: '/relatorios/licencas',
    filename: 'licencas.xlsx',
    color: 'purple',
  },
  {
    id: 'garantias',
    title: 'Garantias Vencendo',
    description: 'Equipamentos com garantia vencendo em 90 dias',
    icon: Shield,
    endpoint: '/relatorios/garantias',
    filename: 'garantias.xlsx',
    color: 'yellow',
  },
  {
    id: 'desligamentos',
    title: 'Desligamentos',
    description: 'Processos de desligamento com checklist',
    icon: UserMinus,
    endpoint: '/relatorios/desligamentos',
    filename: 'desligamentos.xlsx',
    color: 'red',
    filtros: [
      { label: 'Status', name: 'status', options: [
        { value: '', label: 'Todos' },
        { value: 'pendente', label: 'Pendente' },
        { value: 'em_andamento', label: 'Em andamento' },
        { value: 'concluido', label: 'Concluído' },
      ]},
    ],
  },
]

const colorMap: Record<string, string> = {
  blue:   'bg-blue-900/30 border-blue-800 hover:border-blue-600',
  green:  'bg-green-900/30 border-green-800 hover:border-green-600',
  purple: 'bg-purple-900/30 border-purple-800 hover:border-purple-600',
  yellow: 'bg-yellow-900/30 border-yellow-800 hover:border-yellow-600',
  red:    'bg-red-900/30 border-red-800 hover:border-red-600',
}

const iconColorMap: Record<string, string> = {
  blue: 'bg-blue-600', green: 'bg-green-600', purple: 'bg-purple-600',
  yellow: 'bg-yellow-600', red: 'bg-red-600',
}

export default function RelatoriosPage() {
  const [filtros, setFiltros] = useState<Record<string, Record<string, string>>>({})
  const [baixando, setBaixando] = useState<string | null>(null)

  const setFiltro = (relId: string, campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [relId]: { ...(prev[relId] || {}), [campo]: valor } }))
  }

  const baixar = async (rel: Relatorio) => {
    setBaixando(rel.id)
    try {
      const params = filtros[rel.id] || {}
      const res = await api.get(rel.endpoint, {
        params,
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', rel.filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success(`${rel.title} exportado!`)
    } catch {
      toast.error('Erro ao exportar relatório')
    } finally {
      setBaixando(null)
    }
  }

  return (
    <AppLayout title="Relatórios">

      <div className="page-header">
        <div>
          <h2 className="page-title">Relatórios</h2>
          <p className="page-subtitle">Exportação de dados em Excel (.xlsx)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {relatorios.map(rel => {
          const Icon = rel.icon
          return (
            <div
              key={rel.id}
              className={`card border transition-colors ${colorMap[rel.color]}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-xl ${iconColorMap[rel.color]}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{rel.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{rel.description}</p>
                </div>
              </div>

              {rel.filtros && (
                <div className="space-y-2 mb-4">
                  {rel.filtros.map(f => (
                    <div key={f.name}>
                      <label className="label">{f.label}</label>
                      <select
                        value={filtros[rel.id]?.[f.name] || ''}
                        onChange={e => setFiltro(rel.id, f.name, e.target.value)}
                        className="input text-xs"
                      >
                        {f.options.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => baixar(rel)}
                disabled={baixando === rel.id}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {baixando === rel.id ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Gerando...
                  </>
                ) : (
                  <><Download className="w-4 h-4" /> Exportar Excel</>
                )}
              </button>
            </div>
          )
        })}
      </div>

    </AppLayout>
  )
}
