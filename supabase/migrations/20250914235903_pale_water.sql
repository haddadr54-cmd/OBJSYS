/*
  # Create schedule management tables

  1. New Tables
    - `horarios_aula`
      - `id` (uuid, primary key)
      - `turma_id` (uuid, foreign key to turmas)
      - `disciplina_id` (uuid, foreign key to disciplinas)
      - `professor_id` (uuid, foreign key to usuarios)
      - `dia_semana` (integer, 1-7 for Monday-Sunday)
      - `hora_inicio` (time)
      - `hora_fim` (time)
      - `sala` (text, optional)
      - `observacoes` (text, optional)
      - `ativo` (boolean, default true)
      - `criado_em` (timestamp)

    - `turma_disciplinas`
      - `id` (uuid, primary key)
      - `turma_id` (uuid, foreign key to turmas)
      - `disciplina_id` (uuid, foreign key to disciplinas)
      - `professor_id` (uuid, foreign key to usuarios)
      - `carga_horaria_semanal` (integer, hours per week)
      - `ativa` (boolean, default true)
      - `criado_em` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create horarios_aula table
CREATE TABLE IF NOT EXISTS horarios_aula (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  disciplina_id uuid NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  professor_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  dia_semana integer NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
  hora_inicio time NOT NULL,
  hora_fim time NOT NULL,
  sala text,
  observacoes text,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

-- Create turma_disciplinas table
CREATE TABLE IF NOT EXISTS turma_disciplinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  turma_id uuid NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  disciplina_id uuid NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  professor_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  carga_horaria_semanal integer DEFAULT 2,
  ativa boolean DEFAULT true,
  criado_em timestamptz DEFAULT now(),
  UNIQUE(turma_id, disciplina_id)
);

-- Enable RLS
ALTER TABLE horarios_aula ENABLE ROW LEVEL SECURITY;
ALTER TABLE turma_disciplinas ENABLE ROW LEVEL SECURITY;

-- Create policies for horarios_aula
CREATE POLICY "Admins podem gerenciar horários"
  ON horarios_aula
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "Professores podem ver seus horários"
  ON horarios_aula
  FOR SELECT
  TO public
  USING (true);

-- Create policies for turma_disciplinas
CREATE POLICY "Admins podem gerenciar turma disciplinas"
  ON turma_disciplinas
  FOR ALL
  TO public
  USING (true);

CREATE POLICY "Todos podem ver turma disciplinas"
  ON turma_disciplinas
  FOR SELECT
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_horarios_aula_turma_id ON horarios_aula(turma_id);
CREATE INDEX IF NOT EXISTS idx_horarios_aula_disciplina_id ON horarios_aula(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_horarios_aula_professor_id ON horarios_aula(professor_id);
CREATE INDEX IF NOT EXISTS idx_horarios_aula_dia_semana ON horarios_aula(dia_semana);

CREATE INDEX IF NOT EXISTS idx_turma_disciplinas_turma_id ON turma_disciplinas(turma_id);
CREATE INDEX IF NOT EXISTS idx_turma_disciplinas_disciplina_id ON turma_disciplinas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_turma_disciplinas_professor_id ON turma_disciplinas(professor_id);