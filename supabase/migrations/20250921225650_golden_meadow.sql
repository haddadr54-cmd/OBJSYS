/*
  # Corrigir políticas RLS para configurações globais

  1. Problema
    - Políticas RLS estão impedindo operações de upsert
    - Erro: "new row violates row-level security policy"
    
  2. Solução
    - Remover políticas conflitantes
    - Criar políticas que permitam upsert para admins
    - Manter segurança adequada
    
  3. Políticas
    - SELECT: Todos usuários autenticados podem ler
    - INSERT: Apenas admins podem inserir
    - UPDATE: Apenas admins podem atualizar
*/

-- Remove todas as políticas existentes para recriar corretamente
DROP POLICY IF EXISTS "Admins podem atualizar configurações globais" ON configuracoes_globais;
DROP POLICY IF EXISTS "Admins podem inserir configurações globais" ON configuracoes_globais;
DROP POLICY IF EXISTS "Usuários autenticados podem ler configurações globais" ON configuracoes_globais;

-- Política para SELECT (leitura) - todos usuários autenticados
CREATE POLICY "Usuários autenticados podem ler configurações"
  ON configuracoes_globais
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para INSERT - apenas admins
CREATE POLICY "Admins podem inserir configurações"
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

-- Política para UPDATE - apenas admins
CREATE POLICY "Admins podem atualizar configurações"
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

-- Garantir que RLS está habilitado
ALTER TABLE configuracoes_globais ENABLE ROW LEVEL SECURITY;