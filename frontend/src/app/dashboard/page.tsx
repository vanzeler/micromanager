'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import {
  Users, Monitor, Package, Key, UserMinus,
  AlertTriangle, Clock, CheckCircle, TrendingUp
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { api } from '@/lib/api'
import { DashboardData } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316']

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <svg className="animate-spin w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      </AppLayout>
    )
  }

  const ind = data?.indicadores
  const alertas = data?.alertas
  const graficos = data?.graficos

  return (
    <AppLayout title="Dashboard">

      {/* Indicadores principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Colaboradores ativos"
          value={ind?.colaboradores.ativos || 0}
          subtitle={`${ind?.colaboradores.total || 0} total`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Equipamentos em uso"
          value={ind?.equipamentos.em_uso || 0}
          subtitle={`${ind?.equipamentos.disponiveis || 0} disponíveis`}
          icon={Monitor}
          color="green"
        />
        <StatCard
          title="Itens em estoque"
          value={ind?.estoque.total || 0}
          subtitle={`${ind?.estoque.alertas || 0} alertas de estoque baixo`}
          icon={Package}
          color={ind?.estoque.alertas ? 'yellow' : 'gray'}
        />
        <StatCard
          title="Licenças ativas"
          value={ind?.licencas.ativas || 0}
          subtitle={`${ind?.licencas.expiradas || 0} expiradas`}
          icon={Key}
          color={ind?.licencas.expiradas ? 'red' : 'purple'}
        />
      </div>

      {/* Segunda linha de indicadores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Equipamentos manutenção"
          value={ind?.equipamentos.manutencao || 0}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard
          title="Desligamentos pendentes"
          value={ind?.desligamentos.pendentes || 0}
          icon={UserMinus}
          color={ind?.desligamentos.pendentes ? 'red' : 'gray'}
        />
        <StatCard
          title="Total de equipamentos"
          value={ind?.equipamentos.total || 0}
          subtitle={`${ind?.equipamentos.disponiveis || 0} disponíveis`}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

        {/* Movimentações mensais */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Movimentações nos últimos 6 meses</h3>
          {graficos?.movimentacoes_mensais?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={graficos.movimentacoes_mensais}>
                <XAxis dataKey="mes" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
              Sem movimentações registradas
            </div>
          )}
        </div>

        {/* Equipamentos por tipo */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4">Equipamentos por tipo</h3>
          {graficos?.equipamentos_por_tipo?.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={graficos.equipamentos_por_tipo}
                  dataKey="total"
                  nameKey="tipo"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ tipo, percent }) =>
                    `${tipo} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {graficos.equipamentos_por_tipo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">
              Sem equipamentos cadastrados
            </div>
          )}
        </div>
      </div>

      {/* Alertas e últimas movimentações */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Garantias vencendo */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Garantias vencendo (30 dias)
          </h3>
          {alertas?.garantias_vencendo?.length ? (
            <div className="space-y-2">
              {alertas.garantias_vencendo.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium">{e.codigo}</p>
                    <p className="text-xs text-gray-400">{e.marca} {e.modelo}</p>
                  </div>
                  <p className="text-xs text-yellow-400">{e.garantia_ate}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhuma garantia vencendo
            </p>
          )}
        </div>

        {/* Licenças vencendo */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-red-400" />
            Licenças vencendo (30 dias)
          </h3>
          {alertas?.licencas_vencendo?.length ? (
            <div className="space-y-2">
              {alertas.licencas_vencendo.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm text-white font-medium">{l.software}</p>
                    <p className="text-xs text-gray-400">{l.fabricante}</p>
                  </div>
                  <p className="text-xs text-red-400">{l.data_expiracao}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhuma licença vencendo
            </p>
          )}
        </div>

        {/* Últimas movimentações */}
        <div className="card">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            Últimas movimentações
          </h3>
          {data?.ultimas_movimentacoes?.length ? (
            <div className="space-y-2">
              {data.ultimas_movimentacoes.slice(0, 5).map((m: any) => (
                <div key={m.id} className="py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center justify-between">
                    <Badge value={m.tipo} />
                    <p className="text-xs text-gray-500">
                      {format(new Date(m.data_movimentacao), 'dd/MM HH:mm', { locale: ptBR })}
                    </p>
                  </div>
                  {m.equipamento && (
                    <p className="text-xs text-gray-400 mt-1">{m.equipamento.codigo} — {m.equipamento.modelo}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhuma movimentação registrada
            </p>
          )}
        </div>

      </div>
    </AppLayout>
  )
}
