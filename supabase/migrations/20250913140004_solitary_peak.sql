/*
  # Sistema de Rastreamento de Visualizações

  1. New Tables
    - `visualizacoes`
      - `id` (uuid, primary key)
      - `usuario_id` (uuid, foreign key to usuarios)
      - `item_tipo` (text, tipo do item visualizado)
      - `item_id` (uuid, ID do item visualizado)
      - `visualizado_em` (timestamp, data/hora da visualização)
      - `ip_address` (text, opcional)
      - `user_agent` (text, opcional)

  2. Security
    - Enable RLS on `visualizacoes` table
    - Add policies for users to read their own visualizations
    - Add policies for teachers/admins to see visualizations of their content

  3. Indexes
    - Index on usuario_id for performance
    - Index on item_tipo and item_id for queries
    - Index on visualizado_em for date filtering
*/

CREATE TABLE IF NOT EXISTS visualizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  item_tipo text NOT NULL CHECK (item_tipo IN ('recado', 'prova_tarefa', 'material')),
  item_id uuid NOT NULL,
  visualizado_em timestamptz DEFAULT now(),
  ip_address text,
  user_agent text,
  criado_em timestamptz DEFAULT now()
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_visualizacoes_usuario_id ON visualizacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_visualizacoes_item ON visualizacoes(item_tipo, item_id);
CREATE INDEX IF NOT EXISTS idx_visualizacoes_data ON visualizacoes(visualizado_em);

-- Enable RLS
ALTER TABLE visualizacoes ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Usuários podem ver suas próprias visualizações"
  ON visualizacoes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = usuario_id);

CREATE POLICY "Usuários podem criar suas próprias visualizações"
  ON visualizacoes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Professores podem ver visualizações de seus conteúdos"
  ON visualizacoes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() 
      AND u.tipo_usuario IN ('professor', 'admin')
    )
  );

-- Função para registrar visualização
CREATE OR REPLACE FUNCTION registrar_visualizacao(
  p_item_tipo text,
  p_item_id uuid,
  p_ip_address text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_visualizacao_id uuid;
BEGIN
  -- Verificar se já existe visualização recente (últimas 24h)
  IF EXISTS (
    SELECT 1 FROM visualizacoes 
    WHERE usuario_id = auth.uid() 
    AND item_tipo = p_item_tipo 
    AND item_id = p_item_id 
    AND visualizado_em > now() - interval '24 hours'
  ) THEN
    -- Atualizar timestamp da visualização existente
    UPDATE visualizacoes 
    SET visualizado_em = now()
    WHERE usuario_id = auth.uid() 
    AND item_tipo = p_item_tipo 
    AND item_id = p_item_id
    RETURNING id INTO v_visualizacao_id;
  ELSE
    -- Criar nova visualização
    INSERT INTO visualizacoes (usuario_id, item_tipo, item_id, ip_address, user_agent)
    VALUES (auth.uid(), p_item_tipo, p_item_id, p_ip_address, p_user_agent)
    RETURNING id INTO v_visualizacao_id;
  END IF;
  
  RETURN v_visualizacao_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;