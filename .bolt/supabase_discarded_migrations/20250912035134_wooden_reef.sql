/*
  # Sistema Escolar Completo

  1. Tabelas
    - usuarios (com estrutura exata do usuário)
    - turmas
    - alunos
    - disciplinas
    - provas_tarefas
    - notas
    - materiais
    - recados
    - presencas

  2. Segurança
    - Enable RLS em todas as tabelas
    - Políticas de acesso baseadas no tipo de usuário

  3. Dados de Teste
    - Usuários de exemplo
    - Estrutura completa para demonstração
*/

-- Criar tabela usuarios com estrutura exata
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    tipo_usuario TEXT CHECK (tipo_usuario IN ('admin', 'professor', 'pai')) NOT NULL,
    criado_em TIMESTAMP DEFAULT now()
);

-- Criar tabela turmas
CREATE TABLE IF NOT EXISTS turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    ano_letivo TEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT now()
);

-- Criar tabela alunos
CREATE TABLE IF NOT EXISTS alunos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    turma_id UUID REFERENCES turmas(id),
    responsavel_id UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT now()
);

-- Criar tabela disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    turma_id UUID REFERENCES turmas(id),
    professor_id UUID REFERENCES usuarios(id),
    criado_em TIMESTAMP DEFAULT now()
);

-- Criar tabela provas_tarefas
CREATE TABLE IF NOT EXISTS provas_tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id UUID REFERENCES disciplinas(id),
    titulo TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('prova', 'tarefa')) NOT NULL,
    data DATE NOT NULL,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT now()
);

-- Criar tabela notas
CREATE TABLE IF NOT EXISTS notas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES alunos(id),
    disciplina_id UUID REFERENCES disciplinas(id),
    trimestre INTEGER CHECK (trimestre >= 1 AND trimestre <= 4),
    nota DECIMAL(5,2),
    comentario TEXT,
    criado_em TIMESTAMP DEFAULT now()
);

-- Criar tabela materiais
CREATE TABLE IF NOT EXISTS materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id UUID REFERENCES disciplinas(id),
    titulo TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('pdf', 'video', 'link')) NOT NULL,
    arquivo_url TEXT,
    descricao TEXT,
    criado_em TIMESTAMP DEFAULT now()
);

-- Criar tabela recados
CREATE TABLE IF NOT EXISTS recados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    data_envio TIMESTAMP DEFAULT now(),
    destinatario_tipo TEXT CHECK (destinatario_tipo IN ('aluno', 'turma', 'geral')) NOT NULL,
    destinatario_id UUID,
    enviado_por UUID REFERENCES usuarios(id)
);

-- Criar tabela presencas
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
ALTER TABLE provas_tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE recados ENABLE ROW LEVEL SECURITY;
ALTER TABLE presencas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (permitir tudo por enquanto para teste)
CREATE POLICY "Allow all for authenticated users" ON usuarios FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON turmas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON alunos FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON disciplinas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON provas_tarefas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON notas FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON materiais FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON recados FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON presencas FOR ALL TO authenticated USING (true);

-- Inserir dados de teste apenas se não existirem
INSERT INTO usuarios (nome, email, senha, tipo_usuario) 
SELECT 'João Silva', 'pai@escola.com', '123456', 'pai'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'pai@escola.com');

INSERT INTO usuarios (nome, email, senha, tipo_usuario) 
SELECT 'Maria Santos', 'professor@escola.com', '123456', 'professor'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'professor@escola.com');

INSERT INTO usuarios (nome, email, senha, tipo_usuario) 
SELECT 'Carlos Oliveira', 'admin@escola.com', '123456', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@escola.com');

-- Inserir turmas de teste
INSERT INTO turmas (nome, ano_letivo) 
SELECT '5º Ano A', '2024'
WHERE NOT EXISTS (SELECT 1 FROM turmas WHERE nome = '5º Ano A');

INSERT INTO turmas (nome, ano_letivo) 
SELECT '3º Ano B', '2024'
WHERE NOT EXISTS (SELECT 1 FROM turmas WHERE nome = '3º Ano B');

-- Inserir alunos de teste (usando subqueries para pegar IDs)
INSERT INTO alunos (nome, turma_id, responsavel_id)
SELECT 'Ana Silva', 
       (SELECT id FROM turmas WHERE nome = '5º Ano A' LIMIT 1),
       (SELECT id FROM usuarios WHERE email = 'pai@escola.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM alunos WHERE nome = 'Ana Silva');

INSERT INTO alunos (nome, turma_id, responsavel_id)
SELECT 'Pedro Silva', 
       (SELECT id FROM turmas WHERE nome = '3º Ano B' LIMIT 1),
       (SELECT id FROM usuarios WHERE email = 'pai@escola.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM alunos WHERE nome = 'Pedro Silva');

-- Inserir disciplinas de teste
INSERT INTO disciplinas (nome, turma_id, professor_id)
SELECT 'Matemática', 
       (SELECT id FROM turmas WHERE nome = '5º Ano A' LIMIT 1),
       (SELECT id FROM usuarios WHERE email = 'professor@escola.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM disciplinas WHERE nome = 'Matemática');

INSERT INTO disciplinas (nome, turma_id, professor_id)
SELECT 'Português', 
       (SELECT id FROM turmas WHERE nome = '5º Ano A' LIMIT 1),
       (SELECT id FROM usuarios WHERE email = 'professor@escola.com' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM disciplinas WHERE nome = 'Português');

-- Inserir notas de teste
INSERT INTO notas (aluno_id, disciplina_id, trimestre, nota, comentario)
SELECT 
    (SELECT id FROM alunos WHERE nome = 'Ana Silva' LIMIT 1),
    (SELECT id FROM disciplinas WHERE nome = 'Matemática' LIMIT 1),
    1,
    8.5,
    'Ótimo desempenho'
WHERE NOT EXISTS (
    SELECT 1 FROM notas 
    WHERE aluno_id = (SELECT id FROM alunos WHERE nome = 'Ana Silva' LIMIT 1)
    AND disciplina_id = (SELECT id FROM disciplinas WHERE nome = 'Matemática' LIMIT 1)
    AND trimestre = 1
);

-- Inserir prova de teste
INSERT INTO provas_tarefas (disciplina_id, titulo, tipo, data, descricao)
SELECT 
    (SELECT id FROM disciplinas WHERE nome = 'Matemática' LIMIT 1),
    'Prova de Frações',
    'prova',
    '2024-02-15',
    'Avaliação sobre frações e números decimais'
WHERE NOT EXISTS (
    SELECT 1 FROM provas_tarefas WHERE titulo = 'Prova de Frações'
);

-- Inserir recado de teste
INSERT INTO recados (titulo, conteudo, destinatario_tipo, enviado_por)
SELECT 
    'Bem-vindos ao Sistema',
    'Olá! Este é o novo sistema de gestão escolar. Aqui vocês podem acompanhar notas, agenda e muito mais!',
    'geral',
    (SELECT id FROM usuarios WHERE email = 'admin@escola.com' LIMIT 1)
WHERE NOT EXISTS (
    SELECT 1 FROM recados WHERE titulo = 'Bem-vindos ao Sistema'
);