export interface Usuario {
  id: string
  nome: string
  email: string
  perfil: string
  ativo: boolean
  ultimo_login: string
  created_at: string
}

export interface Colaborador {
  id: string
  matricula: string
  nome: string
  email: string
  telefone: string
  departamento: string
  cargo: string
  cidade: string
  setor: string
  status: string
  data_admissao: string
  data_desligamento: string
  foto_url: string
  observacoes: string
  created_at: string
}

export interface Equipamento {
  id: string
  codigo: string
  tipo: string
  marca: string
  modelo: string
  numero_serie: string
  patrimonio: string
  status: string
  colaborador_id: string
  colaborador: Colaborador
  setor: string
  cidade: string
  processador: string
  memoria_ram: string
  armazenamento: string
  sistema_operacional: string
  ip_address: string
  hostname: string
  data_compra: string
  valor_compra: number
  garantia_ate: string
  fornecedor: string
  qr_code: string
  observacoes: string
}

export interface Estoque {
  id: string
  nome: string
  descricao: string
  categoria: string
  quantidade: number
  quantidade_minima: number
  unidade: string
  localizacao: string
  fornecedor: string
  preco_unitario: number
}

export interface Licenca {
  id: string
  tipo: string
  software: string
  versao: string
  fabricante: string
  quantidade_total: number
  quantidade_usada: number
  data_compra: string
  data_expiracao: string
  valor: number
  status: string
  observacoes: string
}

export interface Desligamento {
  id: string
  colaborador_id: string
  colaborador: Colaborador
  data_desligamento: string
  motivo: string
  status: string
  equipamentos_devolvidos: boolean
  acessos_bloqueados: boolean
  emails_redirecionados: boolean
  backup_realizado: boolean
  documentos_entregues: boolean
  pendencias: string
  observacoes: string
}

export interface DashboardData {
  indicadores: {
    colaboradores: { total: number; ativos: number; inativos: number }
    equipamentos: { total: number; disponiveis: number; em_uso: number; manutencao: number }
    estoque: { total: number; alertas: number }
    licencas: { ativas: number; expiradas: number }
    desligamentos: { pendentes: number }
  }
  alertas: {
    garantias_vencendo: Equipamento[]
    licencas_vencendo: Licenca[]
    estoque_baixo: Estoque[]
  }
  graficos: {
    equipamentos_por_tipo: { tipo: string; total: string }[]
    equipamentos_por_cidade: { cidade: string; total: string }[]
    movimentacoes_mensais: { mes: string; total: string }[]
  }
  ultimas_movimentacoes: any[]
}
