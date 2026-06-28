-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Tipos ENUM
CREATE TYPE perfil_usuario    AS ENUM ('administrador', 'tecnico_ti', 'gestor', 'somente_leitura');
CREATE TYPE status_colaborador AS ENUM ('ativo', 'inativo', 'desligado', 'afastado');
CREATE TYPE tipo_equipamento   AS ENUM ('computador','notebook','monitor','impressora','telefone','tablet','nobreak','switch','roteador','servidor','periferico','outro');
CREATE TYPE status_equipamento AS ENUM ('disponivel','em_uso','manutencao','descartado','reservado');
CREATE TYPE tipo_movimentacao  AS ENUM ('entrada','saida','transferencia','manutencao','descarte','emprestimo');
CREATE TYPE status_licenca     AS ENUM ('ativa','expirada','cancelada','suspensa');
CREATE TYPE tipo_licenca       AS ENUM ('office','adobe','delphi','visual_studio','teamviewer','antivirus','windows','outro');
CREATE TYPE status_desligamento AS ENUM ('pendente','em_andamento','concluido','cancelado');

-- =============================================
-- TABELAS
-- =============================================

CREATE TABLE usuarios (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome          VARCHAR(150) NOT NULL,
  email         VARCHAR(200) UNIQUE NOT NULL,
  senha_hash    VARCHAR(255) NOT NULL,
  perfil        perfil_usuario NOT NULL DEFAULT 'somente_leitura',
  ativo         BOOLEAN DEFAULT true,
  ultimo_login  TIMESTAMPTZ,
  reset_token   VARCHAR(255),
  reset_token_exp TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE colaboradores (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matricula        VARCHAR(50) UNIQUE,
  nome             VARCHAR(150) NOT NULL,
  email            VARCHAR(200) UNIQUE NOT NULL,
  telefone         VARCHAR(20),
  departamento     VARCHAR(100),
  cargo            VARCHAR(100),
  cidade           VARCHAR(100),
  setor            VARCHAR(100),
  gestor_id        UUID REFERENCES colaboradores(id),
  data_admissao    DATE,
  data_desligamento DATE,
  status           status_colaborador DEFAULT 'ativo',
  foto_url         VARCHAR(500),
  observacoes      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE equipamentos (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  codigo              VARCHAR(50) UNIQUE NOT NULL,
  tipo                tipo_equipamento NOT NULL,
  marca               VARCHAR(100),
  modelo              VARCHAR(150),
  numero_serie        VARCHAR(150) UNIQUE,
  patrimonio          VARCHAR(100),
  status              status_equipamento DEFAULT 'disponivel',
  colaborador_id      UUID REFERENCES colaboradores(id),
  setor               VARCHAR(100),
  cidade              VARCHAR(100),
  processador         VARCHAR(150),
  memoria_ram         VARCHAR(50),
  armazenamento       VARCHAR(100),
  sistema_operacional VARCHAR(100),
  ip_address          VARCHAR(45),
  hostname            VARCHAR(100),
  data_compra         DATE,
  valor_compra        DECIMAL(12,2),
  nota_fiscal         VARCHAR(100),
  garantia_ate        DATE,
  fornecedor          VARCHAR(150),
  qr_code             VARCHAR(500),
  foto_url            VARCHAR(500),
  observacoes         TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE estoque (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome              VARCHAR(150) NOT NULL,
  descricao         TEXT,
  categoria         VARCHAR(100),
  quantidade        INTEGER DEFAULT 0,
  quantidade_minima INTEGER DEFAULT 5,
  unidade           VARCHAR(30) DEFAULT 'unidade',
  localizacao       VARCHAR(150),
  fornecedor        VARCHAR(150),
  preco_unitario    DECIMAL(12,2),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE movimentacoes (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo                    tipo_movimentacao NOT NULL,
  equipamento_id          UUID REFERENCES equipamentos(id),
  estoque_id              UUID REFERENCES estoque(id),
  colaborador_origem_id   UUID REFERENCES colaboradores(id),
  colaborador_destino_id  UUID REFERENCES colaboradores(id),
  setor_origem            VARCHAR(100),
  setor_destino           VARCHAR(100),
  quantidade              INTEGER DEFAULT 1,
  data_movimentacao       TIMESTAMPTZ DEFAULT NOW(),
  responsavel_id          UUID REFERENCES usuarios(id),
  motivo                  TEXT,
  observacoes             TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE licencas (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo              tipo_licenca NOT NULL,
  software          VARCHAR(150) NOT NULL,
  versao            VARCHAR(50),
  fabricante        VARCHAR(100),
  chave_licenca     VARCHAR(500),
  quantidade_total  INTEGER DEFAULT 1,
  quantidade_usada  INTEGER DEFAULT 0,
  data_compra       DATE,
  data_expiracao    DATE,
  valor             DECIMAL(12,2),
  fornecedor        VARCHAR(150),
  status            status_licenca DEFAULT 'ativa',
  observacoes       TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE licencas_colaboradores (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  licenca_id       UUID REFERENCES licencas(id) ON DELETE CASCADE,
  colaborador_id   UUID REFERENCES colaboradores(id),
  data_atribuicao  DATE DEFAULT CURRENT_DATE,
  data_remocao     DATE,
  ativo            BOOLEAN DEFAULT true,
  observacoes      TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE desligamentos (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colaborador_id           UUID REFERENCES colaboradores(id) NOT NULL,
  data_desligamento        DATE NOT NULL,
  motivo                   VARCHAR(200),
  status                   status_desligamento DEFAULT 'pendente',
  responsavel_ti_id        UUID REFERENCES usuarios(id),
  equipamentos_devolvidos  BOOLEAN DEFAULT false,
  acessos_bloqueados       BOOLEAN DEFAULT false,
  emails_redirecionados    BOOLEAN DEFAULT false,
  backup_realizado         BOOLEAN DEFAULT false,
  documentos_entregues     BOOLEAN DEFAULT false,
  checklist_json           JSONB,
  pendencias               TEXT,
  observacoes              TEXT,
  concluido_em             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id       UUID REFERENCES usuarios(id),
  acao             VARCHAR(100) NOT NULL,
  tabela           VARCHAR(100),
  registro_id      UUID,
  dados_anteriores JSONB,
  dados_novos      JSONB,
  ip_address       VARCHAR(45),
  user_agent       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE anexos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tabela_ref      VARCHAR(100) NOT NULL,
  registro_id     UUID NOT NULL,
  nome_arquivo    VARCHAR(255) NOT NULL,
  nome_original   VARCHAR(255) NOT NULL,
  tipo_mime       VARCHAR(100),
  tamanho_bytes   INTEGER,
  url             VARCHAR(500) NOT NULL,
  descricao       VARCHAR(255),
  uploaded_by     UUID REFERENCES usuarios(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notificacoes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id  UUID REFERENCES usuarios(id),
  titulo      VARCHAR(200) NOT NULL,
  mensagem    TEXT,
  tipo        VARCHAR(50) DEFAULT 'info',
  lida        BOOLEAN DEFAULT false,
  link        VARCHAR(500),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX idx_equipamentos_colaborador  ON equipamentos(colaborador_id);
CREATE INDEX idx_equipamentos_status       ON equipamentos(status);
CREATE INDEX idx_equipamentos_tipo         ON equipamentos(tipo);
CREATE INDEX idx_equipamentos_garantia     ON equipamentos(garantia_ate);
CREATE INDEX idx_movimentacoes_equipamento ON movimentacoes(equipamento_id);
CREATE INDEX idx_movimentacoes_data        ON movimentacoes(data_movimentacao);
CREATE INDEX idx_colaboradores_status      ON colaboradores(status);
CREATE INDEX idx_colaboradores_nome        ON colaboradores USING gin(nome gin_trgm_ops);
CREATE INDEX idx_logs_usuario              ON logs(usuario_id);
CREATE INDEX idx_logs_created              ON logs(created_at);
CREATE INDEX idx_licencas_expiracao        ON licencas(data_expiracao);

-- =============================================
-- TRIGGER: updated_at automático
-- =============================================

CREATE OR REPLACE FUNCTION fn_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_usuarios_updated       BEFORE UPDATE ON usuarios       FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_colaboradores_updated  BEFORE UPDATE ON colaboradores  FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_equipamentos_updated   BEFORE UPDATE ON equipamentos   FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_estoque_updated        BEFORE UPDATE ON estoque        FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_licencas_updated       BEFORE UPDATE ON licencas       FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_desligamentos_updated  BEFORE UPDATE ON desligamentos  FOR EACH ROW EXECUTE FUNCTION fn_updated_at();

-- =============================================
-- SEED: Dados iniciais
-- senha de todos: Admin@2024
-- =============================================

INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
('Administrador', 'admin@ti.empresa.com.br',   '$2b$12$wrZRM0Nbz1GkTA9Em.WRI.m6dbWB6xbGrEc1fCvw2jMzM7sfp4G9G', 'administrador'),
('João Técnico',  'tecnico@ti.empresa.com.br', '$2b$12$wrZRM0Nbz1GkTA9Em.WRI.m6dbWB6xbGrEc1fCvw2jMzM7sfp4G9G', 'tecnico_ti'),
('Maria Gestora', 'gestora@ti.empresa.com.br', '$2b$12$wrZRM0Nbz1GkTA9Em.WRI.m6dbWB6xbGrEc1fCvw2jMzM7sfp4G9G', 'gestor');

INSERT INTO colaboradores (matricula, nome, email, telefone, departamento, cargo, cidade, setor, data_admissao, status) VALUES
('MAT001', 'Ana Silva',        'ana.silva@empresa.com.br',        '(41) 99999-0001', 'TI',         'Analista de Sistemas',  'Curitiba',         'Desenvolvimento',  '2020-03-15', 'ativo'),
('MAT002', 'Carlos Santos',    'carlos.santos@empresa.com.br',    '(41) 99999-0002', 'Financeiro', 'Analista Financeiro',   'Curitiba',         'Contabilidade',    '2019-07-01', 'ativo'),
('MAT003', 'Beatriz Lima',     'beatriz.lima@empresa.com.br',     '(41) 99999-0003', 'RH',         'Analista de RH',        'São Paulo',        'Recrutamento',     '2021-01-10', 'ativo'),
('MAT004', 'Diego Costa',      'diego.costa@empresa.com.br',      '(41) 99999-0004', 'Comercial',  'Gerente Comercial',     'Rio de Janeiro',   'Vendas',           '2018-05-20', 'ativo'),
('MAT005', 'Elena Rodrigues',  'elena.rodrigues@empresa.com.br',  '(41) 99999-0005', 'TI',         'DevOps Engineer',       'Curitiba',         'Infraestrutura',   '2022-02-14', 'ativo');

INSERT INTO equipamentos (codigo, tipo, marca, modelo, numero_serie, status, setor, cidade, processador, memoria_ram, armazenamento, sistema_operacional, garantia_ate, data_compra, valor_compra) VALUES
('NB-001', 'notebook',    'Dell',    'Latitude 5540',       'DLL5540001', 'em_uso',    'TI',            'Curitiba', 'Intel Core i7-1365U', '16GB DDR5', '512GB SSD NVMe', 'Windows 11 Pro', '2026-12-31', '2024-01-15', 5800.00),
('NB-002', 'notebook',    'Lenovo',  'ThinkPad E15',        'LNV15002',   'disponivel','TI',            'Curitiba', 'Intel Core i5-1335U', '8GB DDR4',  '256GB SSD',      'Windows 11 Pro', '2026-06-30', '2024-02-20', 4200.00),
('PC-001', 'computador',  'HP',      'EliteDesk 800 G9',    'HP800G9001', 'em_uso',    'Financeiro',    'Curitiba', 'Intel Core i5-12500', '16GB DDR4', '512GB SSD',      'Windows 11 Pro', '2025-12-31', '2023-06-10', 3500.00),
('MON-001','monitor',     'Samsung', 'Odyssey G3 27"',      'SMSG3001',   'em_uso',    'TI',            'Curitiba', NULL, NULL, NULL, NULL,                               '2026-03-15', '2024-03-15', 1200.00),
('IMP-001','impressora',  'Brother', 'MFC-L8900CDW',        'BRT8900001', 'disponivel','Administrativo','Curitiba', NULL, NULL, NULL, NULL,                               '2025-08-20', '2023-08-20', 2800.00);

INSERT INTO estoque (nome, categoria, quantidade, quantidade_minima, unidade, localizacao, preco_unitario) VALUES
('Cabo HDMI 1.8m',       'Cabos',          15,  5, 'unidade', 'Prateleira A1',  25.00),
('Memória RAM 8GB DDR4', 'Memória',         8,  3, 'unidade', 'Prateleira B2', 180.00),
('SSD 256GB',            'Armazenamento',   5,  2, 'unidade', 'Prateleira B3', 220.00),
('Mouse USB',            'Periféricos',    20,  8, 'unidade', 'Prateleira C1',  45.00),
('Teclado USB ABNT2',    'Periféricos',    12,  5, 'unidade', 'Prateleira C2',  65.00),
('Fonte ATX 600W',       'Componentes',     3,  2, 'unidade', 'Prateleira D1', 280.00),
('Pasta Térmica',        'Componentes',    10,  3, 'unidade', 'Prateleira D2',  18.00);

INSERT INTO licencas (tipo, software, versao, fabricante, quantidade_total, quantidade_usada, data_compra, data_expiracao, valor, status) VALUES
('office',        'Microsoft 365 Business',   '2024', 'Microsoft',   50, 35, '2024-01-01', '2025-01-01', 12500.00, 'ativa'),
('adobe',         'Adobe Creative Cloud',     '2024', 'Adobe',       10,  6, '2024-03-01', '2025-03-01',  8500.00, 'ativa'),
('teamviewer',    'TeamViewer Business',      '15',   'TeamViewer',   5,  3, '2024-01-15', '2025-01-15',  2300.00, 'ativa'),
('antivirus',     'ESET Endpoint Security',   '17',   'ESET',       100, 78, '2024-02-01', '2025-02-01',  4800.00, 'ativa'),
('visual_studio', 'Visual Studio Professional','2022','Microsoft',    5,  2, '2023-06-01', '2024-12-31',  3200.00, 'ativa'),
('delphi',        'Embarcadero Delphi',       '12',   'Embarcadero',  3,  3, '2023-01-01', '2024-06-30',  7500.00, 'expirada');

