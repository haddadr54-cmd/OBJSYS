/*
  # Add missing columns to turmas table

  1. New Columns
    - `descricao` (text, nullable) - Description field for turmas
    - `serie` (text, nullable) - Grade/series information
    - `turno` (text, nullable) - Shift information (Manhã, Tarde, Noite, Integral)
    - `capacidade` (integer, nullable) - Maximum capacity of students
    - `observacoes` (text, nullable) - Additional observations

  2. Changes
    - Add columns that are referenced in the application but missing from database schema
    - All columns are nullable to maintain compatibility with existing data
*/

-- Add descricao column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'turmas' AND column_name = 'descricao'
  ) THEN
    ALTER TABLE turmas ADD COLUMN descricao text;
  END IF;
END $$;

-- Add serie column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'turmas' AND column_name = 'serie'
  ) THEN
    ALTER TABLE turmas ADD COLUMN serie text;
  END IF;
END $$;

-- Add turno column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'turmas' AND column_name = 'turno'
  ) THEN
    ALTER TABLE turmas ADD COLUMN turno text;
  END IF;
END $$;

-- Add capacidade column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'turmas' AND column_name = 'capacidade'
  ) THEN
    ALTER TABLE turmas ADD COLUMN capacidade integer;
  END IF;
END $$;

-- Add observacoes column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'turmas' AND column_name = 'observacoes'
  ) THEN
    ALTER TABLE turmas ADD COLUMN observacoes text;
  END IF;
END $$;