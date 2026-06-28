import { clsx } from 'clsx'

interface BadgeProps {
  value: string
  type?: 'status_equipamento' | 'status_colaborador' | 'status_licenca' | 'status_desligamento' | 'tipo_equipamento'
}

const statusEquipamento: Record<string, string> = {
  disponivel: 'badge-green',
  em_uso:     'badge-blue',
  manutencao: 'badge-yellow',
  descartado: 'badge-red',
  reservado:  'badge-gray',
}

const statusColaborador: Record<string, string> = {
  ativo:      'badge-green',
  inativo:    'badge-gray',
  desligado:  'badge-red',
  afastado:   'badge-yellow',
}

const statusLicenca: Record<string, string> = {
  ativa:      'badge-green',
  expirada:   'badge-red',
  cancelada:  'badge-red',
  suspensa:   'badge-yellow',
}

const statusDesligamento: Record<string, string> = {
  pendente:      'badge-yellow',
  em_andamento:  'badge-blue',
  concluido:     'badge-green',
  cancelado:     'badge-gray',
}

const labelMap: Record<string, string> = {
  disponivel:    'Disponível',
  em_uso:        'Em uso',
  manutencao:    'Manutenção',
  descartado:    'Descartado',
  reservado:     'Reservado',
  ativo:         'Ativo',
  inativo:       'Inativo',
  desligado:     'Desligado',
  afastado:      'Afastado',
  ativa:         'Ativa',
  expirada:      'Expirada',
  cancelada:     'Cancelada',
  suspensa:      'Suspensa',
  pendente:      'Pendente',
  em_andamento:  'Em andamento',
  concluido:     'Concluído',
  cancelado:     'Cancelado',
  computador:    'Computador',
  notebook:      'Notebook',
  monitor:       'Monitor',
  impressora:    'Impressora',
  telefone:      'Telefone',
  tablet:        'Tablet',
  nobreak:       'Nobreak',
  switch:        'Switch',
  roteador:      'Roteador',
  servidor:      'Servidor',
  periferico:    'Periférico',
  outro:         'Outro',
}

export default function Badge({ value, type }: BadgeProps) {
  let className = 'badge-gray'

  if (type === 'status_equipamento') className = statusEquipamento[value] || 'badge-gray'
  else if (type === 'status_colaborador') className = statusColaborador[value] || 'badge-gray'
  else if (type === 'status_licenca') className = statusLicenca[value] || 'badge-gray'
  else if (type === 'status_desligamento') className = statusDesligamento[value] || 'badge-gray'

  return <span className={className}>{labelMap[value] || value}</span>
}
