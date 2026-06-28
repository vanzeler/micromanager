'use client'
import { useEffect, useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import SearchBar from '@/components/ui/SearchBar'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { Monitor, Plus, Edit, Trash2, Link, Unlink, QrCode } from 'lucide-react'
import { api } from '@/lib/api'
import { Equipamento, Colaborador } from '@/types'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const TIPOS = ['computador','notebook','monitor','impressora','telefone','tablet','nobreak','switch','roteador','servidor','periferico','outro']

export default function EquipamentosPage() {
  const [items, setItems] = useState<Equipamento[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState('')
  const [modalAberto, setModalAberto] = useState(false)
  const [modalVincular, setModalVincular] = useState(false)
  const [editando, setEditando] = useState<Equipamento | null>(null)
  const [vinculando, setVinculando] = useState<Equipamento | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [colaboradorId, setColaboradorId] = useState('')

  const { register, handleSubmit, reset } = useForm()

  const carregar = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (search) params.search = search
      if (statusFiltro) params.status = statusFiltro
      if (tipoFiltro) params.tipo = tipoFiltro
      const [eqRes, colRes] = await Promise.all([
        api.get('/equipamentos', { params }),
        api.get('/colaboradores', { params: { status: 'ativo' } }),
      ])
      setItems(eqRes.data)
      setColaboradores(colRes.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [search, statusFiltro, tipoFiltro])

  const abrirModal = (item?: Equipamento) => {
    setEditando(item || null)
    reset(item || {})
    setModalAberto(true)
  }

  const fecharModal = () => { setModalAberto(false); setEditando(null); reset({}) }

  const salvar = async (data: any) => {
    setSalvando(true)
    try {
      if (editando) {
        await api.patch(`/equipamentos/${editando.id}`, data)
        toast.success('Equipamento atualizado!')
      } else {
        await api.post('/equipamentos', data)
        toast.success('Equipamento cadastrado!')
      }
      fecharModal()
      carregar()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao salvar')
    } finally {
      setSalvando(false)
    }
  }

  const vincular = async () => {
    if (!vinculando || !colaboradorId) return
    try {
      await api.patch(`/equipamentos/${vinculando.id}/vincular/${colaboradorId}`)
      toast.success('Equipamento vinculado!')
      setModalVincular(false)
      carregar()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao vincular')
    }
  }

  const desvincular = async (id: string, codigo: string) => {
    if (!confirm(`Desvincular equipamento "${codigo}"?`)) return
    try {
      await api.patch(`/equipamentos/${id}/desvincular`)
      toast.success('Equipamento desvinculado!')
      carregar()
    } catch { toast.error('Erro ao desvincular') }
  }

  const descartar = async (id: string, codigo: string) => {
    if (!confirm(`Marcar "${codigo}" como descartado?`)) return
    try {
      await api.delete(`/equipamentos/${id}`)
      toast.success('Equipamento descartado')
      carregar()
    } catch { toast.error('Erro ao descartar') }
  }

  return (
    <AppLayout title="Equipamentos">

      <div className="page-header">
        <div>
          <h2 className="page-title">Equipamentos</h2>
          <p className="page-subtitle">{items.length} registros encontrados</p>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus className="w-4 h-4" /> Novo equipamento
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Código, marca, modelo, hostname..." />
        <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} className="input w-44">
          <option value="">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="em_uso">Em uso</option>
          <option value="manutencao">Manutenção</option>
          <option value="reservado">Reservado</option>
          <option value="descartado">Descartado</option>
        </select>
        <select value={tipoFiltro} onChange={e => setTipoFiltro(e.target.value)} className="input w-40">
          <option value="">Todos os tipos</option>
          {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
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
          icon={Monitor}
          title="Nenhum equipamento encontrado"
          description="Cadastre o primeiro equipamento ou ajuste os filtros"
          action={<button onClick={() => abrirModal()} className="btn-primary"><Plus className="w-4 h-4" /> Novo equipamento</button>}
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo / Modelo</th>
                <th>Número de série</th>
                <th>Status</th>
                <th>Colaborador</th>
                <th>Cidade / Setor</th>
                <th>Garantia</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <span className="font-mono text-blue-400 font-medium">{item.codigo}</span>
                  </td>
                  <td>
                    <p className="font-medium text-white capitalize">{item.tipo}</p>
                    <p className="text-xs text-gray-400">{item.marca} {item.modelo}</p>
                  </td>
                  <td className="font-mono text-xs text-gray-400">{item.numero_serie || '-'}</td>
                  <td><Badge value={item.status} type="status_equipamento" /></td>
                  <td>
                    {item.colaborador
                      ? <div>
                          <p className="text-sm text-white">{item.colaborador.nome}</p>
                          <p className="text-xs text-gray-500">{item.colaborador.departamento}</p>
                        </div>
                      : <span className="text-gray-500 text-xs">Sem vínculo</span>}
                  </td>
                  <td>
                    <p className="text-sm">{item.cidade || '-'}</p>
                    <p className="text-xs text-gray-500">{item.setor || ''}</p>
                  </td>
                  <td>
                    {item.garantia_ate
                      ? <span className={new Date(item.garantia_ate) < new Date() ? 'text-red-400 text-xs' : 'text-green-400 text-xs'}>
                          {new Date(item.garantia_ate + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      : <span className="text-gray-500 text-xs">-</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => abrirModal(item)} className="text-gray-400 hover:text-blue-400 p-1" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      {item.status !== 'em_uso' ? (
                        <button
                          onClick={() => { setVinculando(item); setColaboradorId(''); setModalVincular(true) }}
                          className="text-gray-400 hover:text-green-400 p-1" title="Vincular colaborador"
                        >
                          <Link className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => desvincular(item.id, item.codigo)} className="text-gray-400 hover:text-yellow-400 p-1" title="Desvincular">
                          <Unlink className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => descartar(item.id, item.codigo)} className="text-gray-400 hover:text-red-400 p-1" title="Descartar">
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

      {/* Modal Cadastro/Edição */}
      <Modal open={modalAberto} onClose={fecharModal} title={editando ? 'Editar equipamento' : 'Novo equipamento'} size="xl">
        <form onSubmit={handleSubmit(salvar)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Código *</label>
              <input {...register('codigo', { required: true })} className="input" placeholder="NB-001" />
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select {...register('tipo', { required: true })} className="input">
                <option value="">Selecione...</option>
                {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select {...register('status')} className="input">
                <option value="disponivel">Disponível</option>
                <option value="em_uso">Em uso</option>
                <option value="manutencao">Manutenção</option>
                <option value="reservado">Reservado</option>
              </select>
            </div>
            <div>
              <label className="label">Marca</label>
              <input {...register('marca')} className="input" placeholder="Dell, HP, Lenovo..." />
            </div>
            <div>
              <label className="label">Modelo</label>
              <input {...register('modelo')} className="input" placeholder="Latitude 5540..." />
            </div>
            <div>
              <label className="label">Número de série</label>
              <input {...register('numero_serie')} className="input" placeholder="SN123456" />
            </div>
            <div>
              <label className="label">Patrimônio</label>
              <input {...register('patrimonio')} className="input" placeholder="PAT-001" />
            </div>
            <div>
              <label className="label">Hostname</label>
              <input {...register('hostname')} className="input" placeholder="PC-FINANCEIRO-01" />
            </div>
            <div>
              <label className="label">IP</label>
              <input {...register('ip_address')} className="input" placeholder="192.168.1.100" />
            </div>
            <div>
              <label className="label">Processador</label>
              <input {...register('processador')} className="input" placeholder="Intel Core i7..." />
            </div>
            <div>
              <label className="label">Memória RAM</label>
              <input {...register('memoria_ram')} className="input" placeholder="16GB DDR4" />
            </div>
            <div>
              <label className="label">Armazenamento</label>
              <input {...register('armazenamento')} className="input" placeholder="512GB SSD" />
            </div>
            <div>
              <label className="label">Sistema operacional</label>
              <input {...register('sistema_operacional')} className="input" placeholder="Windows 11 Pro" />
            </div>
            <div>
              <label className="label">Setor</label>
              <input {...register('setor')} className="input" placeholder="TI, Financeiro..." />
            </div>
            <div>
              <label className="label">Cidade</label>
              <input {...register('cidade')} className="input" placeholder="Curitiba..." />
            </div>
            <div>
              <label className="label">Data de compra</label>
              <input {...register('data_compra')} type="date" className="input" />
            </div>
            <div>
              <label className="label">Valor de compra (R$)</label>
              <input {...register('valor_compra')} type="number" step="0.01" className="input" placeholder="0,00" />
            </div>
            <div>
              <label className="label">Garantia até</label>
              <input {...register('garantia_ate')} type="date" className="input" />
            </div>
            <div>
              <label className="label">Fornecedor</label>
              <input {...register('fornecedor')} className="input" placeholder="Nome do fornecedor" />
            </div>
            <div>
              <label className="label">Nota fiscal</label>
              <input {...register('nota_fiscal')} className="input" placeholder="NF-001" />
            </div>
          </div>
          <div>
            <label className="label">Observações</label>
            <textarea {...register('observacoes')} className="input h-20 resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={fecharModal} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={salvando} className="btn-primary disabled:opacity-50">
              {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Vincular */}
      <Modal open={modalVincular} onClose={() => setModalVincular(false)} title={`Vincular: ${vinculando?.codigo}`} size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Selecionar colaborador</label>
            <select value={colaboradorId} onChange={e => setColaboradorId(e.target.value)} className="input">
              <option value="">Selecione um colaborador...</option>
              {colaboradores.map(c => (
                <option key={c.id} value={c.id}>{c.nome} — {c.departamento}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModalVincular(false)} className="btn-secondary">Cancelar</button>
            <button onClick={vincular} disabled={!colaboradorId} className="btn-primary disabled:opacity-50">
              Vincular
            </button>
          </div>
        </div>
      </Modal>

    </AppLayout>
  )
}
