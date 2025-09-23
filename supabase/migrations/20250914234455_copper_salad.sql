/*
  # Add missing columns to disciplinas table

  1. New Columns
    - `codigo` (text) - Subject code/abbreviation
    - `cor` (text) - Subject color for UI
    - `descricao` (text) - Subject description
    - `ativa` (boolean) - Whether the subject is active

  2. Changes
    - All columns are nullable except `ativa` which defaults to TRUE
    - Uses conditional logic to avoid errors if columns already exist
*/

-- Add codigo column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'disciplinas' AND column_name = 'codigo'
  ) THEN
    ALTER TABLE disciplinas ADD COLUMN codigo TEXT;
  END IF;
END $$;

-- Add cor column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'disciplinas' AND column_name = 'cor'
  ) THEN
    ALTER TABLE disciplinas ADD COLUMN cor TEXT DEFAULT '#3B82F6';
  END IF;
END $$;

-- Add descricao column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'disciplinas' AND column_name = 'descricao'
  ) THEN
    ALTER TABLE disciplinas ADD COLUMN descricao TEXT;
  END IF;
END $$;

-- Add ativa column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'disciplinas' AND column_name = 'ativa'
  ) THEN
    ALTER TABLE disciplinas ADD COLUMN ativa BOOLEAN DEFAULT TRUE NOT NULL;
  END IF;
END $$;