'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { ArrowLeftRight, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const TIPOS = ['entrada','saida','transferencia','manutencao','descarte','emprestimo']

export default function MovimentacoesPage() {
  const [items, setItems] = useState<any[]>([])
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const carregar = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (tipoFiltro) params.tipo = tipoFiltro
      const [movRes, eqRes, colRes] = await Promise.all([
        api.get('/movimentacoes', { params }),
        api.get('/equipamentos'),
        api.get('/colaboradores', { params: { status: 'ativo' } }),
      ])
      setItems(movRes.data)
      setEquipamentos(eqRes.data)
      setColaboradores(colRes.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [tipoFiltro])

  const salvar = async (data: any) => {
    setSalvando(true)
    try {
      await api.post('/movimentacoes', data)
      toast.success('Movimentação registrada!')
      setModalAberto(false)
      reset({})
      carregar()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao registrar')
    } finally { setSalvando(false) }
  }

  const tipoLabel: Record<string, string> = {
    entrada: 'Entrada', saida: 'Saída', transferencia: 'Transferência',
    manutencao: 'Manutenção', descarte: 'Descarte', emprestimo: 'Empréstimo',
  }

  return (
    <AppLayout title="Movimentações">

      <div className="page-header">
        <div>
          <h2 className="page-title">Movimentações</h2>
          <p className="page-subtitle">{items.length} registros</p>
        </div>
        <button onClick={() => { reset({}); setModalAberto(true) }} className="btn-primary">
          <Plus className="w-4 h-4" /> Registrar movimentação
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)} className="input w-48">
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{tipoLabel[t]}</option>)}
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
          icon={ArrowLeftRight}
          title="Nenhuma movimentação registrada"
          action={
            <button onClick={() => setModalAberto(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Registrar
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Equipamento</th>
                <th>Origem</th>
                <th>Destino</th>
                <th>Data</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><Badge value={item.tipo} /></td>
                  <td>
                    {item.equipamento
                      ? <div>
                          <p className="text-sm text-white font-mono">{item.equipamento.codigo}</p>
                          <p className="text-xs text-gray-500">{item.equipamento.marca} {item.equipamento.modelo}</p>
                        </div>
                      : <span className="text-gray-500">-</span>}
                  </td>
                  <td className="text-gray-400 text-sm">
                    {item.colaborador_origem?.nome || item.setor_origem || '-'}
                  </td>
                  <td className="text-gray-400 text-sm">
                    {item.colaborador_destino?.nome || item.setor_destino || '-'}
                  </td>
                  <td className="text-gray-400 text-sm">
                    {format(new Date(item.data_movimentacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                  </td>
                  <td className="text-gray-400 text-sm">{item.motivo || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalAberto} onClose={() => setModalAberto(false)} title="Registrar movimentação" size="md">
        <form onSubmit={handleSubmit(salvar)} className="space-y-4">
          <div>
            <label className="label">Tipo *</label>
            <select {...register('tipo', { required: true })} className="input">
              <option value="">Selecione...</option>
              {TIPOS.map(t => <option key={t} value={t}>{tipoLabel[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Equipamento</label>
            <select {...register('equipamento_id')} className="input">
              <option value="">Selecione...</option>
              {equipamentos.map(e => (
                <option key={e.id} value={e.id}>{e.codigo} — {e.marca} {e.modelo}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Colaborador origem</label>
              <select {...register('colaborador_origem_id')} className="input">
                <option value="">Nenhum</option>
                {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Colaborador destino</label>
              <select {...register('colaborador_destino_id')} className="input">
                <option value="">Nenhum</option>
                {colaboradores.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Setor origem</label>
              <input {...register('setor_origem')} className="input" placeholder="TI, Financeiro..." />
            </div>
            <div>
              <label className="label">Setor destino</label>
              <input {...register('setor_destino')} className="input" placeholder="TI, Financeiro..." />
            </div>
          </div>
          <div>
            <label className="label">Motivo</label>
            <textarea {...register('motivo')} className="input h-16 resize-none" placeholder="Descreva o motivo..." />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-50">
              {salvando ? 'Salvando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>

    </AppLayout>
  )
}
