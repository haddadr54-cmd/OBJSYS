/*
  # Sistema Escolar Completo - Migração Principal

  1. Tabelas Principais
    - `usuarios` - Usuários do sistema (pais, professores, admins)
    - `turmas` - Turmas escolares
    - `alunos` - Estudantes
    - `disciplinas` - Matérias/disciplinas
    - `notas` - Notas dos alunos
    - `provas_tarefas` - Provas e tarefas
    - `materiais` - Materiais didáticos
    - `recados` - Comunicados
    - `presencas` - Controle de presença

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas básicas de acesso
    - Índices para performance

  3. Dados de Teste
    - Usuários para demonstração
    - Estrutura completa para testes
*/

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  senha text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('pai', 'professor', 'admin')),
  criado_em timestamptz DEFAULT now()
);

-- Criar tabela de turmas
CREATE TABLE IF NOT EXISTS turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ano_letivo text NOT NULL,
  criado_em timestamptz DEFAULT now()
);

-- Criar tabela de alunos
CREATE TABLE IF NOT EXISTS alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  turma_id uuid REFERENCES turmas(id),
  responsavel_id uuid REFERENCES usuarios(id),
  criado_em timestamptz DEFAULT now()
);

-- Criar tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  turma_id uuid REFERENCES turmas(id),
  professor_id uuid REFERENCES usuarios(id),
  criado_em timestamptz DEFAULT now()
);

-- Criar tabela de notas
CREATE TABLE IF NOT EXISTS notas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id),
  disciplina_id uuid REFERENCES disciplinas(id),
  trimestre integer CHECK (trimestre >= 1 AND trimestre <= 4),
  nota numeric(5,2),
  comentario text,
  criado_em timestamptz DEFAULT now()
);

-- Criar tabela de provas e tarefas
CREATE TABLE IF NOT EXISTS provas_tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disciplina_id uuid REFERENCES disciplinas(id),
  titulo text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('prova', 'tarefa')),
  data date NOT NULL,
  descricao text,
  criado_em timestamptz DEFAULT now()
);

-- Criar tabela de materiais
CREATE TABLE IF NOT EXISTS materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disciplina_id uuid REFERENCES disciplinas(id),
  titulo text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('pdf', 'video', 'link')),
  arquivo_url text,
  descricao text,
  criado_em timestamptz DEFAULT now()
);

-- Criar tabela de recados
CREATE TABLE IF NOT EXISTS recados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  conteudo text NOT NULL,
  data_envio timestamptz DEFAULT now(),
  destinatario_tipo text NOT NULL CHECK (destinatario_tipo IN ('aluno', 'turma', 'geral')),
  destinatario_id uuid,
  enviado_por uuid REFERENCES usuarios(id)
);

-- Criar tabela de presenças
CREATE TABLE IF NOT EXISTS presencas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id),
  data_aula date NOT NULL,
  presente boolean DEFAULT false,
  disciplina_id uuid REFERENCES disciplinas(id),
  criado_em timestamptz DEFAULT now()
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
CREATE POLICY "Allow all for development" ON usuarios FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON turmas FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON alunos FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON disciplinas FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON notas FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON provas_tarefas FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON materiais FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON recados FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON presencas FOR ALL USING (true);

-- Inserir dados de teste (apenas se não existirem)
INSERT INTO usuarios (nome, email, senha, tipo) VALUES
  ('João Silva', 'pai@escola.com', '123456', 'pai'),
  ('Maria Santos', 'professor@escola.com', '123456', 'professor'),
  ('Carlos Oliveira', 'admin@escola.com', '123456', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Inserir turmas de teste
INSERT INTO turmas (nome, ano_letivo) VALUES
  ('5º Ano A', '2024'),
  ('3º Ano B', '2024')
ON CONFLICT DO NOTHING;

-- Inserir dados relacionados (usando subqueries para pegar IDs)
DO $$
DECLARE
  pai_id uuid;
  professor_id uuid;
  turma1_id uuid;
  turma2_id uuid;
  aluno1_id uuid;
  aluno2_id uuid;
  disc1_id uuid;
  disc2_id uuid;
BEGIN
  -- Buscar IDs dos usuários
  SELECT id INTO pai_id FROM usuarios WHERE email = 'pai@escola.com';
  SELECT id INTO professor_id FROM usuarios WHERE email = 'professor@escola.com';
  
  -- Buscar IDs das turmas
  SELECT id INTO turma1_id FROM turmas WHERE nome = '5º Ano A';
  SELECT id INTO turma2_id FROM turmas WHERE nome = '3º Ano B';
  
  -- Inserir alunos se os IDs existirem
  IF pai_id IS NOT NULL AND turma1_id IS NOT NULL THEN
    INSERT INTO alunos (nome, turma_id, responsavel_id) VALUES
      ('Ana Silva', turma1_id, pai_id),
      ('Pedro Silva', turma2_id, pai_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Inserir disciplinas se os IDs existirem
  IF professor_id IS NOT NULL AND turma1_id IS NOT NULL THEN
    INSERT INTO disciplinas (nome, turma_id, professor_id) VALUES
      ('Matemática', turma1_id, professor_id),
      ('Português', turma1_id, professor_id),
      ('Ciências', turma2_id, professor_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Buscar IDs dos alunos e disciplinas para inserir notas
  SELECT id INTO aluno1_id FROM alunos WHERE nome = 'Ana Silva' LIMIT 1;
  SELECT id INTO disc1_id FROM disciplinas WHERE nome = 'Matemática' LIMIT 1;
  
  -- Inserir notas de exemplo
  IF aluno1_id IS NOT NULL AND disc1_id IS NOT NULL THEN
    INSERT INTO notas (aluno_id, disciplina_id, trimestre, nota, comentario) VALUES
      (aluno1_id, disc1_id, 1, 8.5, 'Ótimo desempenho em frações')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Inserir prova de exemplo
  IF disc1_id IS NOT NULL THEN
    INSERT INTO provas_tarefas (disciplina_id, titulo, tipo, data, descricao) VALUES
      (disc1_id, 'Prova de Matemática - Geometria', 'prova', CURRENT_DATE + INTERVAL '7 days', 'Prova sobre formas geométricas')
    ON CONFLICT DO NOTHING;
  END IF;
  
END $$;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_alunos_responsavel ON alunos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turma ON alunos(turma_id);
CREATE INDEX IF NOT EXISTS idx_disciplinas_professor ON disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_disciplinas_turma ON disciplinas(turma_id);
CREATE INDEX IF NOT EXISTS idx_notas_aluno ON notas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_notas_disciplina ON notas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_provas_disciplina ON provas_tarefas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_materiais_disciplina ON materiais(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno ON presencas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_presencas_disciplina ON presencas(disciplina_id);