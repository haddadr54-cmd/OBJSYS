/*
  # Corrigir políticas RLS para configurações globais

  1. Políticas Atualizadas
    - Permite que admins autenticados insiram/atualizem configurações
    - Permite que usuários autenticados leiam configurações
    - Remove políticas conflitantes existentes

  2. Segurança
    - Apenas admins podem modificar configurações
    - Todos os usuários autenticados podem ler configurações
    - Mantém RLS habilitado para segurança
*/

-- Remove políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Admins podem gerenciar configurações globais" ON configuracoes_globais;
DROP POLICY IF EXISTS "Usuários autenticados podem ler configurações globais" ON configuracoes_globais;

-- Cria política para permitir que admins insiram configurações
CREATE POLICY "Admins podem inserir configurações globais"
  ON configuracoes_globais
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario = 'admin'
      AND usuarios.ativo = true
    )
  );

-- Cria política para permitir que admins atualizem configurações
CREATE POLICY "Admins podem atualizar configurações globais"
  ON configuracoes_globais
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario = 'admin'
      AND usuarios.ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.tipo_usuario = 'admin'
      AND usuarios.ativo = true
    )
  );

-- Cria política para permitir que usuários autenticados leiam configurações
CREATE POLICY "Usuários autenticados podem ler configurações globais"
  ON configuracoes_globais
  FOR SELECT
  TO authenticated
  USING (true);

-- Garante que RLS está habilitado
ALTER TABLE configuracoes_globais ENABLE ROW LEVEL SECURITY;