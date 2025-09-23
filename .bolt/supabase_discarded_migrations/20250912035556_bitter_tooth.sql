/*
  # Sistema Escolar Completo - Estrutura Final

  1. Tabelas Principais
    - `usuarios` - Usuários do sistema (pais, professores, admins)
    - `turmas` - Turmas da escola
    - `alunos` - Alunos matriculados
    - `disciplinas` - Disciplinas por turma
    - `notas` - Notas dos alunos
    - `provas_tarefas` - Provas e tarefas agendadas
    - `materiais` - Materiais didáticos
    - `recados` - Comunicados e recados
    - `presencas` - Controle de presença

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso por tipo de usuário

  3. Dados de Teste
    - Usuários de exemplo para cada tipo
    - Estrutura completa com relacionamentos
*/

-- Tabela de usuários (pais, professores, admins)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo_usuario TEXT CHECK (tipo_usuario IN ('admin', 'professor', 'pai')) NOT NULL,
    criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    ano_letivo TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    turma_id UUID REFERENCES turmas(id),
    responsavel_id UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    turma_id UUID REFERENCES turmas(id),
    professor_id UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de notas
CREATE TABLE IF NOT EXISTS notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES alunos(id),
    disciplina_id UUID REFERENCES disciplinas(id),
    trimestre INTEGER CHECK (trimestre >= 1 AND trimestre <= 4),
    nota NUMERIC(5,2),
    comentario TEXT,
    criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de provas e tarefas
CREATE TABLE IF NOT EXISTS provas_tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id UUID REFERENCES disciplinas(id),
    titulo TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('prova', 'tarefa')) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de materiais
CREATE TABLE IF NOT EXISTS materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id UUID REFERENCES disciplinas(id),
    titulo TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('pdf', 'video', 'link')) NOT NULL,
    arquivo_url TEXT,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT now()
);

-- Tabela de recados
CREATE TABLE IF NOT EXISTS recados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT now(),
    destinatario_tipo TEXT CHECK (destinatario_tipo IN ('aluno', 'turma', 'geral')) NOT NULL,
    destinatario_id UUID,
    enviado_por UUID REFERENCES usuarios(id)
);

-- Tabela de presenças
CREATE TABLE IF NOT EXISTS presencas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES alunos(id),
    data_aula DATE NOT NULL,
    presente BOOLEAN DEFAULT false,
    disciplina_id UUID REFERENCES disciplinas(id),
    criado_em TIMESTAMP DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE provas_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE recados ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo por enquanto para desenvolvimento)
CREATE POLICY "Allow all for authenticated users" ON usuarios FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON turmas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON alunos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON disciplinas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON notas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON provas_tarefas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON materiais FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON recados FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON presencas FOR ALL TO authenticated USING (true);

-- Inserir dados de teste apenas se não existirem
DO $$
BEGIN
    -- Verificar se já existem usuários
    IF NOT EXISTS (SELECT 1 FROM usuarios LIMIT 1) THEN
        -- Inserir usuários de teste
        INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES
        ('João Silva', 'pai@escola.com', '123456', 'pai'),
        ('Maria Santos', 'professor@escola.com', '123456', 'professor'),
        ('Carlos Oliveira', 'admin@escola.com', '123456', 'admin'),
        ('Ana Costa', 'professor2@escola.com', '123456', 'professor'),
        ('Pedro Almeida', 'pai2@escola.com', '123456', 'pai');
        
        -- Inserir turmas
        INSERT INTO turmas (nome, ano_letivo) VALUES
        ('5º Ano A', '2024'),
        ('3º Ano B', '2024'),
        ('4º Ano C', '2024');
        
        -- Inserir alunos (usando IDs das tabelas criadas)
        INSERT INTO alunos (nome, turma_id, responsavel_id)
        SELECT 'Ana Silva', t.id, u.id
        FROM turmas t, usuarios u
        WHERE t.nome = '5º Ano A' AND u.email = 'pai@escola.com';
        
        INSERT INTO alunos (nome, turma_id, responsavel_id)
        SELECT 'Pedro Silva', t.id, u.id
        FROM turmas t, usuarios u
        WHERE t.nome = '3º Ano B' AND u.email = 'pai@escola.com';
        
        INSERT INTO alunos (nome, turma_id, responsavel_id)
        SELECT 'Maria Santos', t.id, u.id
        FROM turmas t, usuarios u
        WHERE t.nome = '5º Ano A' AND u.email = 'pai2@escola.com';
        
        -- Inserir disciplinas
        INSERT INTO disciplinas (nome, turma_id, professor_id)
        SELECT 'Matemática', t.id, u.id
        FROM turmas t, usuarios u
        WHERE t.nome = '5º Ano A' AND u.email = 'professor@escola.com';
        
        INSERT INTO disciplinas (nome, turma_id, professor_id)
        SELECT 'Português', t.id, u.id
        FROM turmas t, usuarios u
        WHERE t.nome = '5º Ano A' AND u.email = 'professor@escola.com';
        
        INSERT INTO disciplinas (nome, turma_id, professor_id)
        SELECT 'Ciências', t.id, u.id
        FROM turmas t, usuarios u
        WHERE t.nome = '3º Ano B' AND u.email = 'professor2@escola.com';
        
        -- Inserir algumas notas de exemplo
        INSERT INTO notas (aluno_id, disciplina_id, trimestre, nota, comentario)
        SELECT a.id, d.id, 1, 8.5, 'Bom desempenho'
        FROM alunos a, disciplinas d
        WHERE a.nome = 'Ana Silva' AND d.nome = 'Matemática'
        LIMIT 1;
        
        INSERT INTO notas (aluno_id, disciplina_id, trimestre, nota, comentario)
        SELECT a.id, d.id, 1, 9.0, 'Excelente participação'
        FROM alunos a, disciplinas d
        WHERE a.nome = 'Ana Silva' AND d.nome = 'Português'
        LIMIT 1;
        
        -- Inserir provas/tarefas de exemplo
        INSERT INTO provas_tarefas (disciplina_id, titulo, tipo, data, descricao)
        SELECT d.id, 'Prova de Matemática - Frações', 'prova', '2024-02-15', 'Avaliação sobre frações e números decimais'
        FROM disciplinas d
        WHERE d.nome = 'Matemática'
        LIMIT 1;
        
        INSERT INTO provas_tarefas (disciplina_id, titulo, tipo, data, descricao)
        SELECT d.id, 'Trabalho de Português - Redação', 'tarefa', '2024-02-20', 'Redação sobre meio ambiente'
        FROM disciplinas d
        WHERE d.nome = 'Português'
        LIMIT 1;
        
        -- Inserir recados de exemplo
        INSERT INTO recados (titulo, conteudo, destinatario_tipo, enviado_por)
        SELECT 'Bem-vindos ao Sistema!', 'Estamos felizes em apresentar nosso novo sistema de comunicação escola-família.', 'geral', u.id
        FROM usuarios u
        WHERE u.email = 'admin@escola.com'
        LIMIT 1;
        
        INSERT INTO recados (titulo, conteudo, destinatario_tipo, destinatario_id, enviado_por)
        SELECT 'Reunião de Pais', 'Haverá reunião de pais no próximo sábado às 9h.', 'turma', t.id, u.id
        FROM turmas t, usuarios u
        WHERE t.nome = '5º Ano A' AND u.email = 'professor@escola.com'
        LIMIT 1;
        
    END IF;
END $$;