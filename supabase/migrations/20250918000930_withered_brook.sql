/*
  # Add telefone column to usuarios table

  1. Changes
    - Add `telefone` column to `usuarios` table
    - Column type: text (nullable)
    - Allows storing phone numbers for users

  2. Security
    - No RLS changes needed as the table already has proper policies
*/

-- Add telefone column to usuarios table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'usuarios' AND column_name = 'telefone'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN telefone text;
  END IF;
END $$;