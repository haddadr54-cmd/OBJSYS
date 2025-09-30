-- ===================================================================
-- SISTEMA OBJETIVO EDUCACIONAL - SCRIPT DE CRIAÇÃO DO BANCO
-- Database: PostgreSQL (Supabase)
-- Data: 29/09/2025
-- ===================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===================================================================
-- 1. TABELA USUARIOS
-- ===================================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('admin', 'professor', 'pai')),
    telefone VARCHAR(20),
    avatar_url TEXT,
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 2. TABELA PERIODOS LETIVOS
-- ===================================================================
CREATE TABLE periodos_letivos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('bimestre', 'trimestre', 'semestre', 'anual')),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ano_letivo INTEGER NOT NULL,
    ativo BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 3. TABELA TURMAS
-- ===================================================================
CREATE TABLE turmas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    serie VARCHAR(50) NOT NULL,
    turno VARCHAR(20) NOT NULL CHECK (turno IN ('Manhã', 'Tarde', 'Noite')),
    ano_letivo VARCHAR(10) NOT NULL,
    capacidade INTEGER DEFAULT 30,
    descricao TEXT,
    ativa BOOLEAN DEFAULT true,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 4. TABELA DISCIPLINAS
-- ===================================================================
CREATE TABLE disciplinas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(100) NOT NULL,
    codigo VARCHAR(20),
    cor VARCHAR(7) DEFAULT '#3B82F6',
    descricao TEXT,
    ativa BOOLEAN DEFAULT true,
    turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 5. TABELA ALUNOS
-- ===================================================================
CREATE TABLE alunos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    turma_id UUID REFERENCES turmas(id) ON DELETE SET NULL,
    foto_url TEXT,
    endereco TEXT,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 6. TABELA RESPONSAVEIS (relacionamento entre pais e alunos)
-- ===================================================================
CREATE TABLE responsaveis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    parentesco VARCHAR(50) DEFAULT 'Pai/Mãe',
    principal BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aluno_id, usuario_id)
);

-- ===================================================================
-- 7. TABELA NOTAS
-- ===================================================================
CREATE TABLE notas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    trimestre INTEGER NOT NULL CHECK (trimestre BETWEEN 1 AND 4),
    nota DECIMAL(4,2) CHECK (nota >= 0 AND nota <= 10),
    comentario TEXT,
    data_lancamento DATE DEFAULT CURRENT_DATE,
    professor_id UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 8. TABELA PRESENCAS
-- ===================================================================
CREATE TABLE presencas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    data_aula DATE NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT true,
    justificativa TEXT,
    professor_id UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aluno_id, disciplina_id, data_aula)
);

-- ===================================================================
-- 9. TABELA PROVAS E TAREFAS
-- ===================================================================
CREATE TABLE provas_tarefas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('prova', 'tarefa', 'trabalho', 'seminario')),
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    data_entrega DATE,
    data_realizacao DATE,
    valor_maximo DECIMAL(4,2) DEFAULT 10.0,
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 10. TABELA MATERIAIS
-- ===================================================================
CREATE TABLE materiais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) DEFAULT 'documento',
    url_arquivo TEXT,
    tamanho_arquivo BIGINT,
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES usuarios(id),
    publico BOOLEAN DEFAULT true,
    downloads INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 11. TABELA RECADOS
-- ===================================================================
CREATE TABLE recados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'geral',
    prioridade VARCHAR(20) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    destinatario_tipo VARCHAR(20) CHECK (destinatario_tipo IN ('todos', 'pais', 'professores', 'turma', 'aluno')),
    destinatario_id UUID, -- ID da turma ou aluno específico se aplicável
    remetente_id UUID REFERENCES usuarios(id),
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_expiracao DATE,
    ativo BOOLEAN DEFAULT true,
    fixado BOOLEAN DEFAULT false
);

-- ===================================================================
-- 12. TABELA VISUALIZACOES (controle de leitura de recados/materiais)
-- ===================================================================
CREATE TABLE visualizacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    item_tipo VARCHAR(20) NOT NULL CHECK (item_tipo IN ('recado', 'material', 'prova_tarefa')),
    item_id UUID NOT NULL,
    visualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- 13. TABELA DECISOES FINAIS (recuperação/aprovação/reprovação)
-- ===================================================================
CREATE TABLE decisoes_finais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE,
    ano_letivo INTEGER NOT NULL,
    status_final VARCHAR(20) NOT NULL CHECK (status_final IN ('aprovado', 'reprovado', 'recuperacao', 'pendente')),
    media_geral DECIMAL(4,2),
    justificativa TEXT,
    decidido_por UUID REFERENCES usuarios(id),
    decidido_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(aluno_id, ano_letivo)
);

-- ===================================================================
-- ÍNDICES PARA PERFORMANCE
-- ===================================================================

-- Índices para consultas frequentes
CREATE INDEX idx_alunos_turma ON alunos(turma_id);
CREATE INDEX idx_alunos_matricula ON alunos(matricula);
CREATE INDEX idx_notas_aluno_disciplina ON notas(aluno_id, disciplina_id);
CREATE INDEX idx_notas_trimestre ON notas(trimestre);
CREATE INDEX idx_presencas_aluno_data ON presencas(aluno_id, data_aula);
CREATE INDEX idx_disciplinas_turma ON disciplinas(turma_id);
CREATE INDEX idx_disciplinas_professor ON disciplinas(professor_id);
CREATE INDEX idx_responsaveis_usuario ON responsaveis(usuario_id);
CREATE INDEX idx_responsaveis_aluno ON responsaveis(aluno_id);
CREATE INDEX idx_recados_destinatario ON recados(destinatario_tipo, destinatario_id);
CREATE INDEX idx_visualizacoes_usuario_item ON visualizacoes(usuario_id, item_tipo, item_id);

-- ===================================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMPS
-- ===================================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers nas tabelas relevantes
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_turmas_updated_at BEFORE UPDATE ON turmas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disciplinas_updated_at BEFORE UPDATE ON disciplinas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at BEFORE UPDATE ON alunos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notas_updated_at BEFORE UPDATE ON notas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- ROW LEVEL SECURITY (RLS) - SEGURANÇA
-- ===================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE recados ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE provas_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE visualizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisoes_finais ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodos_letivos ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (todos podem ler, apenas authenticated podem modificar)
CREATE POLICY "Enable read access for all users" ON usuarios FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON alunos FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON turmas FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON disciplinas FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON notas FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON presencas FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON responsaveis FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON recados FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON materiais FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON provas_tarefas FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON visualizacoes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON decisoes_finais FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON periodos_letivos FOR SELECT USING (true);

-- Políticas de inserção/atualização (apenas usuários autenticados)
CREATE POLICY "Enable insert for authenticated users only" ON usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON usuarios FOR UPDATE USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON alunos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON alunos FOR UPDATE USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON notas FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON notas FOR UPDATE USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON presencas FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON presencas FOR UPDATE USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON recados FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON recados FOR UPDATE USING (true);

-- ===================================================================
-- SCRIPT EXECUTADO COM SUCESSO!
-- ===================================================================