/*
  # Add data_nascimento column to alunos table

  1. New Columns
    - `data_nascimento` (date, nullable) - Birth date of the student

  2. Changes
    - Add birth date field to store student's date of birth
    - Column is nullable to allow existing records without breaking changes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alunos' AND column_name = 'data_nascimento'
  ) THEN
    ALTER TABLE alunos ADD COLUMN data_nascimento date;
  END IF;
END $$;