/*
  # Adicionar campos à tabela disciplinas

  1. Novos Campos
    - `codigo` (text) - Código/sigla da disciplina
    - `carga_horaria` (integer) - Carga horária semanal
    - `cor` (text) - Cor para identificação visual
    - `descricao` (text) - Descrição da disciplina
    - `ativa` (boolean) - Status da disciplina

  2. Alterações
    - Adicionar campos opcionais à tabela disciplinas existente
*/

-- Adicionar novos campos à tabela disciplinas
DO $$
BEGIN
  -- Adicionar campo codigo se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'disciplinas' AND column_name = 'codigo'
  ) THEN
    ALTER TABLE disciplinas ADD COLUMN codigo text;
  END IF;

  -- Adicionar campo carga_horaria se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'disciplinas' AND column_name = 'carga_horaria'
  ) THEN
    ALTER TABLE disciplinas ADD COLUMN carga_horaria integer;
  END IF;

  -- Adicionar campo cor se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'disciplinas' AND column_name = 'cor'
  ) THEN
    ALTER TABLE disciplinas ADD COLUMN cor text DEFAULT '#3B82F6';
  END IF;

  -- Adicionar campo descricao se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'disciplinas' AND column_name = 'descricao'
  ) THEN
    ALTER TABLE disciplinas ADD COLUMN descricao text;
  END IF;

  -- Adicionar campo ativa se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'disciplinas' AND column_name = 'ativa'
  ) THEN
    ALTER TABLE disciplinas ADD COLUMN ativa boolean DEFAULT true;
  END IF;
END $$;