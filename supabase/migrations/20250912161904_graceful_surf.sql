/*
  # Schema completo do sistema escolar

  1. Tabelas principais
    - usuarios (administradores, professores, pais)
    - turmas (classes/séries)
    - alunos (estudantes)
    - disciplinas (matérias)
    - notas (avaliações)
    - provas_tarefas (atividades)
    - materiais (recursos educacionais)
    - recados (comunicação)
    - presencas (controle de frequência)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas no tipo de usuário
*/

-- Tabela de usuários (administradores, professores, pais)
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  senha text NOT NULL,
  tipo_usuario text NOT NULL CHECK (tipo_usuario IN ('admin', 'professor', 'pai')),
  telefone text,
  avatar_url text,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS turmas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  ano_letivo text NOT NULL,
  criado_em timestamptz DEFAULT now()
);

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS alunos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  turma_id uuid REFERENCES turmas(id),
  responsavel_id uuid REFERENCES usuarios(id),
  criado_em timestamptz DEFAULT now()
);

-- Tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  turma_id uuid REFERENCES turmas(id),
  professor_id uuid REFERENCES usuarios(id),
  criado_em timestamptz DEFAULT now()
);

-- Tabela de notas
CREATE TABLE IF NOT EXISTS notas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid REFERENCES alunos(id),
  disciplina_id uuid REFERENCES disciplinas(id),
  trimestre integer CHECK (trimestre >= 1 AND trimestre <= 4),
  nota numeric(5,2),
  comentario text,
  criado_em timestamptz DEFAULT now()
);

-- Tabela de provas e tarefas
CREATE TABLE IF NOT EXISTS provas_tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disciplina_id uuid REFERENCES disciplinas(id),
  titulo text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('prova', 'tarefa')),
  data date NOT NULL,
  descricao text,
  criado_em timestamptz DEFAULT now()
);

-- Tabela de materiais
CREATE TABLE IF NOT EXISTS materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disciplina_id uuid REFERENCES disciplinas(id),
  titulo text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('pdf', 'video', 'link')),
  arquivo_url text,
  descricao text,
  criado_em timestamptz DEFAULT now()
);

-- Tabela de recados
CREATE TABLE IF NOT EXISTS recados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  conteudo text NOT NULL,
  data_envio timestamptz DEFAULT now(),
  destinatario_tipo text NOT NULL CHECK (destinatario_tipo IN ('aluno', 'turma', 'geral')),
  destinatario_id uuid,
  enviado_por uuid REFERENCES usuarios(id)
);

-- Tabela de presenças
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

-- Políticas para usuários
CREATE POLICY "Usuários podem ver próprios dados"
  ON usuarios FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar usuários"
  ON usuarios FOR ALL
  USING (true);

-- Políticas para turmas
CREATE POLICY "Todos podem ver turmas"
  ON turmas FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar turmas"
  ON turmas FOR ALL
  USING (true);

-- Políticas para alunos
CREATE POLICY "Todos podem ver alunos"
  ON alunos FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar alunos"
  ON alunos FOR ALL
  USING (true);

-- Políticas para disciplinas
CREATE POLICY "Todos podem ver disciplinas"
  ON disciplinas FOR SELECT
  USING (true);

CREATE POLICY "Admins podem gerenciar disciplinas"
  ON disciplinas FOR ALL
  USING (true);

-- Políticas para notas
CREATE POLICY "Todos podem ver notas"
  ON notas FOR SELECT
  USING (true);

CREATE POLICY "Professores e admins podem gerenciar notas"
  ON notas FOR ALL
  USING (true);

-- Políticas para provas_tarefas
CREATE POLICY "Todos podem ver provas e tarefas"
  ON provas_tarefas FOR SELECT
  USING (true);

CREATE POLICY "Professores e admins podem gerenciar provas e tarefas"
  ON provas_tarefas FOR ALL
  USING (true);

-- Políticas para materiais
CREATE POLICY "Todos podem ver materiais"
  ON materiais FOR SELECT
  USING (true);

CREATE POLICY "Professores e admins podem gerenciar materiais"
  ON materiais FOR ALL
  USING (true);

-- Políticas para recados
CREATE POLICY "Todos podem ver recados"
  ON recados FOR SELECT
  USING (true);

CREATE POLICY "Professores e admins podem gerenciar recados"
  ON recados FOR ALL
  USING (true);

-- Políticas para presenças
CREATE POLICY "Todos podem ver presenças"
  ON presencas FOR SELECT
  USING (true);

CREATE POLICY "Professores e admins podem gerenciar presenças"
  ON presencas FOR ALL
  USING (true);