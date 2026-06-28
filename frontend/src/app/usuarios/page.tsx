'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { Settings, Plus, Edit, UserX, KeyRound } from 'lucide-react'
import { api } from '@/lib/api'
import { Usuario } from '@/types'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { clsx } from 'clsx'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const perfilLabel: Record<string, string> = {
  administrador:   'Administrador',
  tecnico_ti:      'Técnico de TI',
  gestor:          'Gestor',
  somente_leitura: 'Somente leitura',
}

const perfilBadge: Record<string, string> = {
  administrador:   'badge-red',
  tecnico_ti:      'badge-blue',
  gestor:          'badge-green',
  somente_leitura: 'badge-gray',
}

export default function UsuariosPage() {
  const [items, setItems] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalSenha, setModalSenha] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [redefinindo, setRedefinindo] = useState<Usuario | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const { register, handleSubmit, reset } = useForm()

  const carregar = async () => {
    setLoading(true)
    try {
      const res = await api.get('/usuarios')
      setItems(res.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  const abrirModal = (item?: Usuario) => {
    setEditando(item || null)
    reset(item || {})
    setModalAberto(true)
  }

  const fecharModal = () => { setModalAberto(false); setEditando(null); reset({}) }

  const salvar = async (data: any) => {
    setSalvando(true)
    try {
      if (editando) {
        await api.patch(`/usuarios/${editando.id}`, data)
        toast.success('Usuário atualizado!')
      } else {
        await api.post('/usuarios', data)
        toast.success('Usuário criado!')
      }
      fecharModal()
      carregar()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar')
    } finally { setSalvando(false) }
  }

  const desativar = async (id: string, nome: string) => {
    if (!confirm(`Desativar usuário "${nome}"?`)) return
    try {
      await api.delete(`/usuarios/${id}`)
      toast.success('Usuário desativado')
      carregar()
    } catch { toast.error('Erro ao desativar') }
  }

  const redefinirSenha = async () => {
    if (!redefinindo || !novaSenha) return
    try {
      await api.patch(`/usuarios/${redefinindo.id}/reset-senha`, { novaSenha })
      toast.success('Senha redefinida!')
      setModalSenha(false)
      setNovaSenha('')
    } catch { toast.error('Erro ao redefinir senha') }
  }

  return (
    <AppLayout title="Usuários">

      <div className="page-header">
        <div>
          <h2 className="page-title">Usuários do Sistema</h2>
          <p className="page-subtitle">{items.length} usuários cadastrados</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo usuário
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Settings} title="Nenhum usuário cadastrado" />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Último acesso</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
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
                  <td>
                    <span className={perfilBadge[item.perfil] || 'badge-gray'}>
                      {perfilLabel[item.perfil] || item.perfil}
                    </span>
                  </td>
                  <td>
                    {item.ativo
                      ? <span className="badge-green">Ativo</span>
                      : <span className="badge-red">Inativo</span>}
                  </td>
                  <td className="text-gray-400 text-sm">
                    {item.ultimo_login
                      ? format(new Date(item.ultimo_login), 'dd/MM/yyyy HH:mm', { locale: ptBR })
                      : 'Nunca'}
                  </td>
                  <td className="text-gray-400 text-sm">
                    {format(new Date(item.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => abrirModal(item)} className="text-gray-400 hover:text-blue-400 p-1" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setRedefinindo(item); setNovaSenha(''); setModalSenha(true) }}
                        className="text-gray-400 hover:text-yellow-400 p-1"
                        title="Redefinir senha"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button onClick={() => desativar(item.id, item.nome)} className="text-gray-400 hover:text-red-400 p-1" title="Desativar">
                        <UserX className="w-4 h-4" />
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
      <Modal open={modalAberto} onClose={fecharModal} title={editando ? 'Editar usuário' : 'Novo usuário'} size="md">
        <form onSubmit={handleSubmit(salvar)} className="space-y-4">
          <div>
            <label className="label">Nome *</label>
            <input {...register('nome', { required: true })} className="input" placeholder="Nome completo" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input {...register('email', { required: true })} type="email" className="input" placeholder="email@empresa.com.br" />
          </div>
          {!editando && (
            <div>
              <label className="label">Senha *</label>
              <input {...register('senha', { required: !editando })} type="password" className="input" placeholder="Mínimo 6 caracteres" />
            </div>
          )}
          <div>
            <label className="label">Perfil</label>
            <select {...register('perfil')} className="input">
              <option value="somente_leitura">Somente leitura</option>
              <option value="tecnico_ti">Técnico de TI</option>
              <option value="gestor">Gestor</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-50">
              {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Criar usuário'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal redefinir senha */}
      <Modal open={modalSenha} onClose={() => setModalSenha(false)} title={`Redefinir senha — ${redefinindo?.nome}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Nova senha</label>
            <input
              type="password"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              className="input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalSenha(false)} className="btn-secondary">Cancelar</button>
            <button onClick={redefinirSenha} disabled={novaSenha.length < 6} className="btn-primary disabled:opacity-50">
              Redefinir senha
            </button>
          </div>
        </div>
      </Modal>

    </AppLayout>
  )
}
