/*
  # Auth Transition Migration

  Objetivo:
    - Adicionar coluna auth_user_id para vincular usuarios -> auth.users
    - Adicionar colunas updated_at nas tabelas principais
    - Criar triggers automáticas de atualização
    - (Fase posterior) Remover coluna senha após migração completa
*/

-- 1. Coluna de vínculo com Supabase Auth
ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE;

-- 2. Adicionar colunas updated_at nas tabelas principais (idempotente)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'usuarios','alunos','disciplinas','notas','recados','materiais','provas_tarefas','presencas','turmas','horarios_aula','turma_disciplinas'
  ]) AS t LOOP
    EXECUTE format(
      'DO $inner$ BEGIN IF NOT EXISTS (
         SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''updated_at''
       ) THEN ALTER TABLE %I ADD COLUMN updated_at timestamptz DEFAULT now(); END IF; END $inner$;', r.t, r.t
    );
  END LOOP;
END $$;

-- 3. Função genérica para updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

-- 4. Anexar triggers (idempotente)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT unnest(ARRAY[
    'usuarios','alunos','disciplinas','notas','recados','materiais','provas_tarefas','presencas','turmas','horarios_aula','turma_disciplinas'
  ]) AS t LOOP
    EXECUTE format(
      'DO $inner$ BEGIN IF NOT EXISTS (
         SELECT 1 FROM pg_trigger WHERE tgname = %L
       ) THEN CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at(); END IF; END $inner$;',
      r.t || '_set_updated_at', r.t || '_set_updated_at', r.t
    );
  END LOOP;
END $$;

-- 5. (Opcional) Índices auxiliares para auth_user_id e updated_at
CREATE INDEX IF NOT EXISTS idx_usuarios_auth_user_id ON usuarios(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_notas_updated_at ON notas(updated_at);
CREATE INDEX IF NOT EXISTS idx_recados_updated_at ON recados(updated_at);
CREATE INDEX IF NOT EXISTS idx_materiais_updated_at ON materiais(updated_at);

-- NOTA: Remoção / migração da coluna 'senha' será feita em migration futura após provisionamento.
