'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import SearchBar from '@/components/ui/SearchBar'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { Package, Plus, Edit, Trash2, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'
import { Estoque } from '@/types'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'

export default function EstoquePage() {
  const [items, setItems] = useState<Estoque[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [modalAjuste, setModalAjuste] = useState(false)
  const [editando, setEditando] = useState<Estoque | null>(null)
  const [ajustando, setAjustando] = useState<Estoque | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [tipoAjuste, setTipoAjuste] = useState<'entrada' | 'saida'>('entrada')
  const [qtdAjuste, setQtdAjuste] = useState(1)
  const { register, handleSubmit, reset } = useForm()

  const carregar = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (search) params.search = search
      const res = await api.get('/estoque', { params })
      setItems(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [search])

  const abrirModal = (item?: Estoque) => {
    setEditando(item || null)
    reset(item || {})
    setModalAberto(true)
  }

  const fecharModal = () => { setModalAberto(false); setEditando(null); reset({}) }

  const salvar = async (data: any) => {
    setSalvando(true)
    try {
      if (editando) {
        await api.patch(`/estoque/${editando.id}`, data)
        toast.success('Item atualizado!')
      } else {
        await api.post('/estoque', data)
        toast.success('Item cadastrado!')
      }
      fecharModal()
      carregar()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar')
    } finally { setSalvando(false) }
  }

  const abrirAjuste = (item: Estoque, tipo: 'entrada' | 'saida') => {
    setAjustando(item)
    setTipoAjuste(tipo)
    setQtdAjuste(1)
    setModalAjuste(true)
  }

  const confirmarAjuste = async () => {
    if (!ajustando) return
    try {
      await api.patch(`/estoque/${ajustando.id}/ajustar`, {
        tipo: tipoAjuste,
        quantidade: qtdAjuste,
      })
      toast.success(`${tipoAjuste === 'entrada' ? 'Entrada' : 'Saída'} registrada!`)
      setModalAjuste(false)
      carregar()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao ajustar')
    }
  }

  const remover = async (id: string, nome: string) => {
    if (!confirm(`Remover item "${nome}"?`)) return
    try {
      await api.delete(`/estoque/${id}`)
      toast.success('Item removido')
      carregar()
    } catch { toast.error('Erro ao remover') }
  }

  const alertas = items.filter(i => i.quantidade <= i.quantidade_minima)

  return (
    <AppLayout title="Estoque">
      <div className="page-header">
        <div>
          <h2 className="page-title">Estoque</h2>
          <p className="page-subtitle">{items.length} itens cadastrados</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo item
        </button>
      </div>

      {alertas.length > 0 && (
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-4 mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-300">
            <span className="font-semibold">{alertas.length} item(s)</span> com estoque abaixo do mínimo:{' '}
            {alertas.map(a => a.nome).join(', ')}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome ou categoria..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Package} title="Sem itens" description="Nenhum item cadastrado ainda" />
      ) : (
        <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-750">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Categoria</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Quantidade</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Mínimo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-750/50 transition">
                  <td className="px-6 py-4 text-sm text-gray-100">{item.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.categoria}</td>
                  <td className={clsx('px-6 py-4 text-sm font-semibold', {
                    'text-red-400': item.quantidade <= item.quantidade_minima,
                    'text-green-400': item.quantidade > item.quantidade_minima,
                  })}>{item.quantidade}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{item.quantidade_minima}</td>
                  <td className="px-6 py-4 text-sm space-x-2 flex">
                    <button
                      onClick={() => abrirAjuste(item, 'entrada')}
                      className="p-2 hover:bg-green-500/20 text-green-400 rounded transition"
                      title="Entrada"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => abrirAjuste(item, 'saida')}
                      className="p-2 hover:bg-orange-500/20 text-orange-400 rounded transition"
                      title="Saída"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => abrirModal(item)}
                      className="p-2 hover:bg-blue-500/20 text-blue-400 rounded transition"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remover(item.id, item.nome)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded transition"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalAberto} onClose={fecharModal} title={editando ? 'Editar item' : 'Novo item'}>
        <form onSubmit={handleSubmit(salvar)} className="space-y-4">
          <input
            {...register('nome', { required: true })}
            placeholder="Nome do item"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
          />
          <input
            {...register('categoria', { required: true })}
            placeholder="Categoria"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
          />
          <input
            {...register('quantidade', { required: true, valueAsNumber: true })}
            type="number"
            placeholder="Quantidade"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
          />
          <input
            {...register('quantidade_minima', { required: true, valueAsNumber: true })}
            type="number"
            placeholder="Quantidade mínima"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
          />
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={fecharModal} className="px-4 py-2 text-gray-400 hover:text-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={salvando} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50">
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={modalAjuste} onClose={() => setModalAjuste(false)} title="Ajustar estoque">
        <div className="space-y-4">
          <p className="text-gray-300">
            Ajustando: <span className="font-semibold text-white">{ajustando?.nome}</span>
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setTipoAjuste('entrada')}
              className={clsx('flex-1 py-2 rounded transition', {
                'bg-green-600 text-white': tipoAjuste === 'entrada',
                'bg-gray-700 text-gray-400': tipoAjuste !== 'entrada',
              })}
            >
              Entrada
            </button>
            <button
              onClick={() => setTipoAjuste('saida')}
              className={clsx('flex-1 py-2 rounded transition', {
                'bg-orange-600 text-white': tipoAjuste === 'saida',
                'bg-gray-700 text-gray-400': tipoAjuste !== 'saida',
              })}
            >
              Saída
            </button>
          </div>
          <input
            type="number"
            value={qtdAjuste}
            onChange={(e) => setQtdAjuste(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
          />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModalAjuste(false)} className="px-4 py-2 text-gray-400 hover:text-gray-300">
              Cancelar
            </button>
            <button onClick={confirmarAjuste} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
              Confirmar
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}

