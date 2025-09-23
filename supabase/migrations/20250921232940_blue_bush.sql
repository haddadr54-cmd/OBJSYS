/*
  # Corrigir políticas RLS para configurações globais

  1. Alterações de Segurança
    - Permitir operações anônimas na tabela `configuracoes_globais`
    - Manter segurança básica através de validação de chaves específicas
    - Permitir INSERT, UPDATE e SELECT para usuários anônimos

  2. Políticas Atualizadas
    - INSERT: Permite inserção de configurações específicas do sistema
    - UPDATE: Permite atualização de configurações existentes
    - SELECT: Mantém acesso de leitura para todos

  NOTA: Esta é uma solução temporária. Para produção, recomenda-se
  implementar autenticação adequada via Supabase Auth.
*/

-- Remover políticas existentes que podem estar causando conflito
DROP POLICY IF EXISTS "Admins podem inserir configurações" ON configuracoes_globais;
DROP POLICY IF EXISTS "Admins podem atualizar configurações" ON configuracoes_globais;
DROP POLICY IF EXISTS "Usuários autenticados podem ler configurações" ON configuracoes_globais;

-- Criar políticas mais permissivas para permitir operações do sistema
CREATE POLICY "Permitir inserção de configurações do sistema"
  ON configuracoes_globais
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    chave IN (
      'sidebar_customization',
      'visual_customization', 
      'login_customization',
      'system_settings',
      'app_config'
    )
  );

CREATE POLICY "Permitir atualização de configurações do sistema"
  ON configuracoes_globais
  FOR UPDATE
  TO anon, authenticated
  USING (
    chave IN (
      'sidebar_customization',
      'visual_customization',
      'login_customization', 
      'system_settings',
      'app_config'
    )
  )
  WITH CHECK (
    chave IN (
      'sidebar_customization',
      'visual_customization',
      'login_customization',
      'system_settings', 
      'app_config'
    )
  );

CREATE POLICY "Permitir leitura de configurações"
  ON configuracoes_globais
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Garantir que a tabela tenha RLS habilitado
ALTER TABLE configuracoes_globais ENABLE ROW LEVEL SECURITY;