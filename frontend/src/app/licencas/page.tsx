'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import SearchBar from '@/components/ui/SearchBar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { Key, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { Licenca } from '@/types'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

const TIPOS = ['office','adobe','delphi','visual_studio','teamviewer','antivirus','windows','outro']

export default function LicencasPage() {
  const [items, setItems] = useState<Licenca[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Licenca | null>(null)
  const [salvando, setSalvando] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const carregar = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (search) params.search = search
      if (statusFiltro) params.status = statusFiltro
      const res = await api.get('/licencas', { params })
      setItems(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [search, statusFiltro])

  const abrirModal = (item?: Licenca) => {
    setEditando(item || null)
    reset(item || {})
    setModalAberto(true)
  }

  const fecharModal = () => { setModalAberto(false); setEditando(null); reset({}) }

  const salvar = async (data: any) => {
    setSalvando(true)
    try {
      if (editando) {
        await api.patch(`/licencas/${editando.id}`, data)
        toast.success('Licença atualizada!')
      } else {
        await api.post('/licencas', data)
        toast.success('Licença cadastrada!')
      }
      fecharModal()
      carregar()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar')
    } finally { setSalvando(false) }
  }

  const remover = async (id: string, nome: string) => {
    if (!confirm(`Remover licença "${nome}"?`)) return
    try {
      await api.delete(`/licencas/${id}`)
      toast.success('Licença removida')
      carregar()
    } catch { toast.error('Erro ao remover') }
  }

  const vencendo = items.filter(i => {
    if (!i.data_expiracao || i.status !== 'ativa') return false
    const diff = new Date(i.data_expiracao).getTime() - new Date().getTime()
    return diff <= 30 * 24 * 60 * 60 * 1000
  })

  return (
    <AppLayout title="Licenças">

      <div className="page-header">
        <div>
          <h2 className="page-title">Licenças de Software</h2>
          <p className="page-subtitle">{items.length} licenças cadastradas</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus className="w-4 h-4" /> Nova licença
        </button>
      </div>

      {vencendo.length > 0 && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            <span className="font-semibold">{vencendo.length} licença(s)</span> vencendo em 30 dias:{' '}
            {vencendo.map(v => v.software).join(', ')}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar software ou fabricante..." />
        <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} className="input w-40">
          <option value="">Todos os status</option>
          <option value="ativa">Ativa</option>
          <option value="expirada">Expirada</option>
          <option value="suspensa">Suspensa</option>
          <option value="cancelada">Cancelada</option>
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
          icon={Key}
          title="Nenhuma licença cadastrada"
          action={<button onClick={() => abrirModal()} className="btn-primary"><Plus className="w-4 h-4" /> Nova licença</button>}
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Software</th>
                <th>Tipo</th>
                <th>Uso</th>
                <th>Validade</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const pct = item.quantidade_total > 0
                  ? Math.round((item.quantidade_usada / item.quantidade_total) * 100) : 0
                return (
                  <tr key={item.id}>
                    <td>
                      <p className="font-medium text-white">{item.software}</p>
                      <p className="text-xs text-gray-500">{item.fabricante} {item.versao && `v${item.versao}`}</p>
                    </td>
                    <td><span className="badge-blue uppercase text-xs">{item.tipo}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-1.5 w-24">
                          <div
                            className={clsx('h-1.5 rounded-full', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500')}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">
                          {item.quantidade_usada}/{item.quantidade_total}
                        </span>
                      </div>
                    </td>
                    <td>
                      {item.data_expiracao ? (
                        <span className={new Date(item.data_expiracao) < new Date() ? 'text-red-400 text-sm' : 'text-gray-300 text-sm'}>
                          {new Date(item.data_expiracao + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="text-gray-300">
                      {item.valor ? `R$ ${Number(item.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td><Badge value={item.status} type="status_licenca" /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button onClick={() => abrirModal(item)} className="text-gray-400 hover:text-blue-400 p-1" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => remover(item.id, item.software)} className="text-gray-400 hover:text-red-400 p-1" title="Remover">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalAberto} onClose={fecharModal} title={editando ? 'Editar licença' : 'Nova licença'} size="lg">
        <form onSubmit={handleSubmit(salvar)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Software *</label>
              <input {...register('software', { required: true })} className="input" placeholder="Microsoft 365..." />
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select {...register('tipo', { required: true })} className="input">
                <option value="">Selecione...</option>
                {TIPOS.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Versão</label>
              <input {...register('versao')} className="input" placeholder="2024" />
            </div>
            <div>
              <label className="label">Fabricante</label>
              <input {...register('fabricante')} className="input" placeholder="Microsoft, Adobe..." />
            </div>
            <div>
              <label className="label">Quantidade total</label>
              <input {...register('quantidade_total')} type="number" min="1" className="input" defaultValue={1} />
            </div>
            <div>
              <label className="label">Quantidade em uso</label>
              <input {...register('quantidade_usada')} type="number" min="0" className="input" defaultValue={0} />
            </div>
            <div>
              <label className="label">Data de compra</label>
              <input {...register('data_compra')} type="date" className="input" />
            </div>
            <div>
              <label className="label">Data de expiração</label>
              <input {...register('data_expiracao')} type="date" className="input" />
            </div>
            <div>
              <label className="label">Valor (R$)</label>
              <input {...register('valor')} type="number" step="0.01" className="input" />
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="ativa">Ativa</option>
                <option value="suspensa">Suspensa</option>
                <option value="cancelada">Cancelada</option>
                <option value="expirada">Expirada</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Chave de licença</label>
              <input {...register('chave_licenca')} className="input font-mono" placeholder="XXXXX-XXXXX-XXXXX" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Observações</label>
              <textarea {...register('observacoes')} className="input h-16 resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-50">
              {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>

    </AppLayout>
  )
}
