
'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import EmptyState from '@/components/ui/EmptyState'
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function LogsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [tabelaFiltro, setTabelaFiltro] = useState('')
  const limit = 50

  const carregar = async () => {
    setLoading(true)
    try {
      const params: any = { page, limit }
      if (tabelaFiltro) params.tabela = tabelaFiltro
      const res = await api.get('/logs', { params })
      setItems(res.data.data)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [page, tabelaFiltro])

  const acaoBadge = (acao: string) => {
    if (acao.includes('CREATE') || acao.includes('criar')) return 'badge-green'
    if (acao.includes('UPDATE') || acao.includes('atualizar')) return 'badge-blue'
    if (acao.includes('DELETE') || acao.includes('remover')) return 'badge-red'
    return 'badge-gray'
  }

  return (
    <AppLayout title="Auditoria">

      <div className="page-header">
        <div>
          <h2 className="page-title">Logs de Auditoria</h2>
          <p className="page-subtitle">{total} registros no total</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={tabelaFiltro}
          onChange={e => { setTabelaFiltro(e.target.value); setPage(1) }}
          className="input w-48"
        >
          <option value="">Todas as tabelas</option>
          <option value="usuarios">Usuários</option>
          <option value="colaboradores">Colaboradores</option>
          <option value="equipamentos">Equipamentos</option>
          <option value="estoque">Estoque</option>
          <option value="licencas">Licenças</option>
          <option value="desligamentos">Desligamentos</option>
          <option value="movimentacoes">Movimentações</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nenhum log registrado" />
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Tabela</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="text-gray-400 text-xs font-mono">
                      {format(new Date(item.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                    </td>
                    <td>
                      <p className="text-sm text-white">{item.usuario?.nome || 'Sistema'}</p>
                      <p className="text-xs text-gray-500">{item.usuario?.email}</p>
                    </td>
                    <td><span className={acaoBadge(item.acao)}>{item.acao}</span></td>
                    <td>
                      {item.tabela && <span className="badge-gray">{item.tabela}</span>}
                    </td>
                    <td className="font-mono text-xs text-gray-500">{item.ip_address || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-400">
              Página {page} de {pages} — {total} registros
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-3 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="btn-secondary py-1.5 px-3 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </AppLayout>
  )
}
