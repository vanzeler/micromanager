'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { UserMinus, Plus, CheckCircle, XCircle, Eye } from 'lucide-react'
import { api } from '@/lib/api'
import { Desligamento, Colaborador } from '@/types'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function DesligamentosPage() {
  const [items, setItems] = useState<Desligamento[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFiltro, setStatusFiltro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [modalChecklist, setModalChecklist] = useState(false)
  const [selecionado, setSelecionado] = useState<Desligamento | null>(null)
  const [salvando, setSalvando] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const carregar = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (statusFiltro) params.status = statusFiltro
      const [desRes, colRes] = await Promise.all([
        api.get('/desligamentos', { params }),
        api.get('/colaboradores', { params: { status: 'ativo' } }),
      ])
      setItems(desRes.data)
      setColaboradores(colRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [statusFiltro])

  const salvar = async (data: any) => {
    setSalvando(true)
    try {
      await api.post('/desligamentos', data)
      toast.success('Processo de desligamento aberto!')
      setModalAberto(false)
      reset({})
      carregar()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao abrir desligamento')
    } finally { setSalvando(false) }
  }

  const atualizarChecklist = async (id: string, campo: string, valor: boolean) => {
    try {
      await api.patch(`/desligamentos/${id}`, { [campo]: valor })
      toast.success('Checklist atualizado!')
      const res = await api.get(`/desligamentos/${id}`)
      setSelecionado(res.data)
      carregar()
    } catch { toast.error('Erro ao atualizar') }
  }

  const progresso = (item: Desligamento) => {
    const campos = [
      item.equipamentos_devolvidos,
      item.acessos_bloqueados,
      item.emails_redirecionados,
      item.backup_realizado,
      item.documentos_entregues,
    ]
    return Math.round((campos.filter(Boolean).length / campos.length) * 100)
  }

  return (
    <AppLayout title="Desligamentos">

      <div className="page-header">
        <div>
          <h2 className="page-title">Desligamentos</h2>
          <p className="page-subtitle">{items.length} processos registrados</p>
        </div>
        <button onClick={() => { reset({}); setModalAberto(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo desligamento
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} className="input w-48">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em andamento</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
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
        <EmptyState
          icon={UserMinus}
          title="Nenhum desligamento registrado"
          action={<button onClick={() => setModalAberto(true)} className="btn-primary"><Plus className="w-4 h-4" /> Novo desligamento</button>}
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Data desligamento</th>
                <th>Motivo</th>
                <th>Progresso</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const pct = progresso(item)
                return (
                  <tr key={item.id}>
                    <td>
                      <p className="font-medium text-white">{item.colaborador?.nome || '-'}</p>
                      <p className="text-xs text-gray-500">{item.colaborador?.cargo}</p>
                    </td>
                    <td className="text-gray-300">
                      {item.data_desligamento
                        ? new Date(item.data_desligamento + 'T00:00:00').toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td className="text-gray-400">{item.motivo || '-'}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-1.5 w-20">
                          <div
                            className={clsx('h-1.5 rounded-full transition-all', pct === 100 ? 'bg-green-500' : pct >= 50 ? 'bg-blue-500' : 'bg-yellow-500')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{pct}%</span>
                      </div>
                    </td>
                    <td><Badge value={item.status} type="status_desligamento" /></td>
                    <td>
                      <button
                        onClick={() => { setSelecionado(item); setModalChecklist(true) }}
                        className="text-gray-400 hover:text-blue-400 p-1"
                        title="Ver checklist"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal novo desligamento */}
      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title="Novo desligamento" size="md">
        <form onSubmit={handleSubmit(salvar)} className="space-y-4">
          <div>
            <label className="label">Colaborador *</label>
            <select {...register('colaborador_id', { required: true })} className="input">
              <option value="">Selecione o colaborador...</option>
              {colaboradores.map(c => (
                <option key={c.id} value={c.id}>{c.nome} — {c.departamento}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Data de desligamento *</label>
            <input {...register('data_desligamento', { required: true })} type="date" className="input" />
          </div>
          <div>
            <label className="label">Motivo</label>
            <input {...register('motivo')} className="input" placeholder="Pedido de demissão, Dispensa..." />
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea {...register('observacoes')} className="input h-16 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-50">
              {salvando ? 'Abrindo...' : 'Abrir processo'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal checklist */}
      <Modal
        open={modalChecklist}
        onClose={() => setModalChecklist(false)}
        title={`Checklist — ${selecionado?.colaborador?.nome}`}
        size="md"
      >
        {selecionado && (
          <div className="space-y-3">
            {[
              { campo: 'equipamentos_devolvidos', label: 'Equipamentos devolvidos' },
              { campo: 'acessos_bloqueados',      label: 'Acessos bloqueados' },
              { campo: 'emails_redirecionados',   label: 'Emails redirecionados' },
              { campo: 'backup_realizado',        label: 'Backup realizado' },
              { campo: 'documentos_entregues',    label: 'Documentos entregues' },
            ].map(({ campo, label }) => {
              const feito = selecionado[campo as keyof Desligamento] as boolean
              return (
                <div
                  key={campo}
                  className={clsx(
                    'flex items-center justify-between p-4 rounded-xl border transition-colors',
                    feito
                      ? 'bg-green-900/20 border-green-700'
                      : 'bg-gray-800 border-gray-700'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {feito
                      ? <CheckCircle className="w-5 h-5 text-green-400" />
                      : <XCircle className="w-5 h-5 text-gray-500" />}
                    <span className={clsx('text-sm font-medium', feito ? 'text-green-300' : 'text-gray-300')}>
                      {label}
                    </span>
                  </div>
                  {selecionado.status !== 'concluido' && (
                    <button
                      onClick={() => atualizarChecklist(selecionado.id, campo, !feito)}
                      className={clsx('text-xs px-3 py-1 rounded-lg transition-colors',
                        feito
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      )}
                    >
                      {feito ? 'Desfazer' : 'Marcar'}
                    </button>
                  )}
                </div>
              )
            })}

            <div className="mt-4 p-3 bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Progresso total</span>
                <span className="text-sm font-bold text-white">{progresso(selecionado)}%</span>
              </div>
              <div className="bg-gray-700 rounded-full h-2">
                <div
                  className={clsx('h-2 rounded-full transition-all',
                    progresso(selecionado) === 100 ? 'bg-green-500' : 'bg-blue-500'
                  )}
                  style={{ width: `${progresso(selecionado)}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

    </AppLayout>
  )
}
