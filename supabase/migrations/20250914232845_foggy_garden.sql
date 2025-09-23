/*
  # Add 'ativa' column to turmas table

  1. Changes
    - Add 'ativa' column to 'turmas' table
    - Set default value to TRUE for existing records
    - Make column NOT NULL with default value

  2. Security
    - No changes to RLS policies needed
*/

-- Add the 'ativa' column to the turmas table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'turmas' AND column_name = 'ativa'
  ) THEN
    ALTER TABLE turmas ADD COLUMN ativa BOOLEAN DEFAULT TRUE NOT NULL;
  END IF;
END $$;