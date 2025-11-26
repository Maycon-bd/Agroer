-- =====================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS AGROER (CORRIGIDO)
-- =====================================================

-- IMPORTANTE: Execute este script em um banco de dados já criado
-- Não tente criar o banco de dados dentro do próprio script

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA: Pessoas
-- Centraliza FORNECEDOR, CLIENTE e FATURADO
-- =====================================================
CREATE TABLE IF NOT EXISTS Pessoas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo_pessoa VARCHAR(20) NOT NULL CHECK (tipo_pessoa IN ('FISICA', 'JURIDICA')),
    documento VARCHAR(20) UNIQUE NOT NULL, -- CPF ou CNPJ
    email VARCHAR(255),
    telefone VARCHAR(20),
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(10),
    tipo_relacionamento VARCHAR(50) NOT NULL CHECK (tipo_relacionamento IN ('FORNECEDOR', 'CLIENTE', 'FATURADO', 'FORNECEDOR_CLIENTE')),
    ativo BOOLEAN DEFAULT TRUE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: Classificacao
-- Para DESPESA ou RECEITA
-- =====================================================
CREATE TABLE IF NOT EXISTS Classificacao (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('DESPESA', 'RECEITA')),
    categoria VARCHAR(100),
    subcategoria VARCHAR(100),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: MovimentoContas
-- Movimentações financeiras principais
-- =====================================================
CREATE TABLE IF NOT EXISTS MovimentoContas (
    id SERIAL PRIMARY KEY,
    numero_documento VARCHAR(100), -- Número da nota fiscal, recibo, etc.
    data_emissao DATE NOT NULL,
    data_vencimento DATE,
    valor_total DECIMAL(15,2) NOT NULL,
    tipo_movimento VARCHAR(20) NOT NULL CHECK (tipo_movimento IN ('ENTRADA', 'SAIDA')),
    status_pagamento VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status_pagamento IN ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO')),
    descricao TEXT,
    observacoes TEXT,
    
    -- Relacionamentos
    fornecedor_id INTEGER REFERENCES Pessoas(id),
    faturado_id INTEGER REFERENCES Pessoas(id),
    
    -- Metadados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: ParcelasContas
-- Parcelas dos movimentos
-- =====================================================
CREATE TABLE IF NOT EXISTS ParcelasContas (
    id SERIAL PRIMARY KEY,
    movimento_id INTEGER NOT NULL REFERENCES MovimentoContas(id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    data_vencimento DATE NOT NULL,
    valor_parcela DECIMAL(15,2) NOT NULL,
    valor_pago DECIMAL(15,2) DEFAULT 0,
    data_pagamento DATE,
    status_parcela VARCHAR(20) DEFAULT 'PENDENTE' CHECK (status_parcela IN ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO')),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Garantir que não existam parcelas duplicadas para o mesmo movimento
    UNIQUE(movimento_id, numero_parcela)
);

-- =====================================================
-- TABELA: MovimentoContas_has_Classificacao
-- Relacionamento N:N entre Movimento e Classificação
-- =====================================================
CREATE TABLE IF NOT EXISTS MovimentoContas_has_Classificacao (
    id SERIAL PRIMARY KEY,
    movimento_id INTEGER NOT NULL REFERENCES MovimentoContas(id) ON DELETE CASCADE,
    classificacao_id INTEGER NOT NULL REFERENCES Classificacao(id),
    valor_classificacao DECIMAL(15,2) NOT NULL,
    percentual DECIMAL(5,2), -- Percentual do valor total
    justificativa TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Garantir que não existam classificações duplicadas para o mesmo movimento
    UNIQUE(movimento_id, classificacao_id)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para Pessoas
CREATE INDEX IF NOT EXISTS idx_pessoas_documento ON Pessoas(documento);
CREATE INDEX IF NOT EXISTS idx_pessoas_tipo_relacionamento ON Pessoas(tipo_relacionamento);
CREATE INDEX IF NOT EXISTS idx_pessoas_ativo ON Pessoas(ativo);

-- Índices para MovimentoContas
CREATE INDEX IF NOT EXISTS idx_movimento_data_emissao ON MovimentoContas(data_emissao);
CREATE INDEX IF NOT EXISTS idx_movimento_data_vencimento ON MovimentoContas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_movimento_fornecedor ON MovimentoContas(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_movimento_faturado ON MovimentoContas(faturado_id);
CREATE INDEX IF NOT EXISTS idx_movimento_status ON MovimentoContas(status_pagamento);

-- Índices para ParcelasContas
CREATE INDEX IF NOT EXISTS idx_parcelas_movimento ON ParcelasContas(movimento_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_vencimento ON ParcelasContas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON ParcelasContas(status_parcela);

-- Índices para Classificacao
CREATE INDEX IF NOT EXISTS idx_classificacao_tipo ON Classificacao(tipo);
CREATE INDEX IF NOT EXISTS idx_classificacao_ativo ON Classificacao(ativo);

-- =====================================================
-- TRIGGERS PARA ATUALIZAR updated_at
-- =====================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para cada tabela
CREATE TRIGGER update_pessoas_updated_at BEFORE UPDATE ON Pessoas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classificacao_updated_at BEFORE UPDATE ON Classificacao FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movimento_updated_at BEFORE UPDATE ON MovimentoContas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parcelas_updated_at BEFORE UPDATE ON ParcelasContas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS (SEED DATA)
-- =====================================================

-- Classificações padrão de despesas
INSERT INTO Classificacao (descricao, tipo, categoria, subcategoria) VALUES
('MANUTENÇÃO E OPERAÇÃO', 'DESPESA', 'OPERACIONAL', 'MANUTENÇÃO'),
('COMBUSTÍVEL', 'DESPESA', 'OPERACIONAL', 'COMBUSTÍVEL'),
('FERTILIZANTES', 'DESPESA', 'INSUMOS', 'FERTILIZANTES'),
('SEMENTES', 'DESPESA', 'INSUMOS', 'SEMENTES'),
('DEFENSIVOS', 'DESPESA', 'INSUMOS', 'DEFENSIVOS'),
('MÃO DE OBRA', 'DESPESA', 'PESSOAL', 'SALÁRIOS'),
('ENERGIA ELÉTRICA', 'DESPESA', 'OPERACIONAL', 'UTILIDADES'),
('ÁGUA', 'DESPESA', 'OPERACIONAL', 'UTILIDADES'),
('TELEFONE/INTERNET', 'DESPESA', 'ADMINISTRATIVA', 'COMUNICAÇÃO'),
('CONSULTORIA', 'DESPESA', 'ADMINISTRATIVA', 'SERVIÇOS')
ON CONFLICT (descricao) DO NOTHING;

-- Classificações padrão de receitas
INSERT INTO Classificacao (descricao, tipo, categoria, subcategoria) VALUES
('VENDA DE PRODUTOS', 'RECEITA', 'VENDAS', 'PRODUTOS'),
('PRESTAÇÃO DE SERVIÇOS', 'RECEITA', 'VENDAS', 'SERVIÇOS'),
('SUBSÍDIOS', 'RECEITA', 'GOVERNAMENTAL', 'SUBSÍDIOS'),
('FINANCIAMENTOS', 'RECEITA', 'FINANCEIRA', 'EMPRÉSTIMOS')
ON CONFLICT (descricao) DO NOTHING;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para relatório de movimentos com detalhes
CREATE OR REPLACE VIEW vw_movimentos_detalhados AS
SELECT 
    m.id,
    m.numero_documento,
    m.data_emissao,
    m.data_vencimento,
    m.valor_total,
    m.tipo_movimento,
    m.status_pagamento,
    m.descricao,
    
    -- Dados do fornecedor
    pf.nome as fornecedor_nome,
    pf.documento as fornecedor_documento,
    
    -- Dados do faturado
    pt.nome as faturado_nome,
    pt.documento as faturado_documento,
    
    -- Contagem de parcelas
    COUNT(pc.id) as total_parcelas,
    SUM(pc.valor_pago) as valor_pago_total,
    
    m.created_at,
    m.updated_at
FROM MovimentoContas m
LEFT JOIN Pessoas pf ON m.fornecedor_id = pf.id
LEFT JOIN Pessoas pt ON m.faturado_id = pt.id
LEFT JOIN ParcelasContas pc ON m.id = pc.movimento_id
GROUP BY m.id, pf.nome, pf.documento, pt.nome, pt.documento;

-- View para parcelas em aberto
CREATE OR REPLACE VIEW vw_parcelas_pendentes AS
SELECT 
    pc.id,
    pc.numero_parcela,
    pc.data_vencimento,
    pc.valor_parcela,
    pc.valor_pago,
    (pc.valor_parcela - pc.valor_pago) as saldo_devedor,
    
    -- Dados do movimento
    m.numero_documento,
    m.descricao as movimento_descricao,
    
    -- Dados do fornecedor
    pf.nome as fornecedor_nome,
    
    -- Verificar se está vencida
    CASE 
        WHEN pc.data_vencimento < CURRENT_DATE THEN 'VENCIDA'
        ELSE pc.status_parcela
    END as status_real
    
FROM ParcelasContas pc
JOIN MovimentoContas m ON pc.movimento_id = m.id
LEFT JOIN Pessoas pf ON m.fornecedor_id = pf.id
WHERE pc.status_parcela IN ('PENDENTE', 'VENCIDO')
ORDER BY pc.data_vencimento;

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE Pessoas IS 'Tabela centralizada para fornecedores, clientes e pessoas faturadas';
COMMENT ON TABLE Classificacao IS 'Classificações de despesas e receitas';
COMMENT ON TABLE MovimentoContas IS 'Movimentações financeiras principais (notas fiscais, recibos, etc.)';
COMMENT ON TABLE ParcelasContas IS 'Parcelas dos movimentos financeiros';
COMMENT ON TABLE MovimentoContas_has_Classificacao IS 'Relacionamento N:N entre movimentos e classificações';

-- =====================================================
-- FINALIZAÇÃO
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('pessoas', 'classificacao', 'movimentocontas', 'parcelascontas', 'movimentocontas_has_classificacao')
ORDER BY tablename;

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados Agroer criado com sucesso!';
END $$;
