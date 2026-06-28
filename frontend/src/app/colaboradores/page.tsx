'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import SearchBar from '@/components/ui/SearchBar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { Users, Plus, Edit, Trash2, Eye, Mail, Phone, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { Colaborador } from '@/types'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

export default function ColaboradoresPage() {
  const [items, setItems] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<Colaborador | null>(null)
  const [salvando, setSalvando] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const carregar = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (search) params.search = search
      if (statusFiltro) params.status = statusFiltro
      const res = await api.get('/colaboradores', { params })
      setItems(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [search, statusFiltro])

  const abrirModal = (item?: Colaborador) => {
    setEditando(item || null)
    reset(item || {})
    setModalAberto(true)
  }

  const fecharModal = () => {
    setModalAberto(false)
    setEditando(null)
    reset({})
  }

  const salvar = async (data: any) => {
    setSalvando(true)
    try {
      if (editando) {
        await api.patch(`/colaboradores/${editando.id}`, data)
        toast.success('Colaborador atualizado!')
      } else {
        await api.post('/colaboradores', data)
        toast.success('Colaborador cadastrado!')
      }
      fecharModal()
      carregar()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const inativar = async (id: string, nome: string) => {
    if (!confirm(`Inativar colaborador "${nome}"?`)) return
    try {
      await api.delete(`/colaboradores/${id}`)
      toast.success('Colaborador inativado')
      carregar()
    } catch {
      toast.error('Erro ao inativar')
    }
  }

  return (
    <AppLayout title="Colaboradores">

      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Colaboradores</h2>
          <p className="page-subtitle">{items.length} registros encontrados</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo colaborador
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por nome, email, matrícula..." />
        <select
          value={statusFiltro}
          onChange={e => setStatusFiltro(e.target.value)}
          className="input w-40"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="desligado">Desligado</option>
          <option value="afastado">Afastado</option>
        </select>
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum colaborador encontrado"
          description="Cadastre o primeiro colaborador ou ajuste os filtros"
          action={
            <button onClick={() => abrirModal()} className="btn-primary">
              <Plus className="w-4 h-4" /> Novo colaborador
            </button>
          }
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Matrícula</th>
                <th>Departamento</th>
                <th>Cargo</th>
                <th>Cidade</th>
                <th>Status</th>
                <th>Admissão</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-white">
                          {item.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{item.nome}</p>
                        <p className="text-xs text-gray-500">{item.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{item.matricula || '-'}</td>
                  <td>{item.departamento || '-'}</td>
                  <td>{item.cargo || '-'}</td>
                  <td>
                    {item.cidade && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        {item.cidade}
                      </span>
                    )}
                    {!item.cidade && '-'}
                  </td>
                  <td><Badge value={item.status} type="status_colaborador" /></td>
                  <td className="text-gray-400">
                    {item.data_admissao
                      ? new Date(item.data_admissao + 'T00:00:00').toLocaleDateString('pt-BR')
                      : '-'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => abrirModal(item)}
                        className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => inativar(item.id, item.nome)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Inativar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal cadastro/edição */}
      <Modal
        open={modalAberto}
        onClose={fecharModal}
        title={editando ? 'Editar colaborador' : 'Novo colaborador'}
        size="lg"
      >
        <form onSubmit={handleSubmit(salvar)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="label">Nome *</label>
              <input {...register('nome', { required: 'Nome obrigatório' })} className="input" placeholder="Nome completo" />
              {errors.nome && <p className="text-red-400 text-xs mt-1">{String(errors.nome.message)}</p>}
            </div>

            <div>
              <label className="label">Email *</label>
              <input {...register('email', { required: 'Email obrigatório' })} type="email" className="input" placeholder="email@empresa.com.br" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{String(errors.email.message)}</p>}
            </div>

            <div>
              <label className="label">Matrícula</label>
              <input {...register('matricula')} className="input" placeholder="MAT001" />
            </div>

            <div>
              <label className="label">Telefone</label>
              <input {...register('telefone')} className="input" placeholder="(41) 99999-0000" />
            </div>

            <div>
              <label className="label">Departamento</label>
              <input {...register('departamento')} className="input" placeholder="TI, Financeiro..." />
            </div>

            <div>
              <label className="label">Cargo</label>
              <input {...register('cargo')} className="input" placeholder="Analista, Gerente..." />
            </div>

            <div>
              <label className="label">Setor</label>
              <input {...register('setor')} className="input" placeholder="Desenvolvimento, Suporte..." />
            </div>

            <div>
              <label className="label">Cidade</label>
              <input {...register('cidade')} className="input" placeholder="Curitiba, São Paulo..." />
            </div>

            <div>
              <label className="label">Data de admissão</label>
              <input {...register('data_admissao')} type="date" className="input" />
            </div>

            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="afastado">Afastado</option>
              </select>
            </div>

          </div>

          <div>
            <label className="label">Observações</label>
            <textarea {...register('observacoes')} className="input h-20 resize-none" placeholder="Observações internas..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-50">
              {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>

    </AppLayout>
  )
}
