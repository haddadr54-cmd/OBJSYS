/*
  Migration: recados RLS hardening + usuarios provisioning (phase 1)
  Date: 2025-09-23

  Objetivos:
    1. Provisionar coluna usuarios.auth_user_id fazendo correspondência por email com auth.users
    2. Reforçar políticas RLS da tabela recados (remover permissões amplas)
       - Apenas usuários autenticados podem SELECT
       - Apenas admin / professor podem INSERT / UPDATE / DELETE
         (validados via usuarios.tipo vinculado a auth_user_id)
    3. Manter simples (não filtra ainda por destinatário) para não quebrar UX atual.
       Filtro de visibilidade (turma / aluno / geral) será introduzido em fase 2.
*/

-- 1. Provisionar auth_user_id (idempotente)
UPDATE usuarios u
SET auth_user_id = au.id
FROM auth.users au
WHERE u.auth_user_id IS NULL
  AND LOWER(u.email) = LOWER(au.email);

-- 2. Índice auxiliar (caso ainda não exista) para buscas por tipo
-- Índice sobre tipo_usuario (coluna correta)
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo_usuario ON usuarios(tipo_usuario);

-- 3. Remover políticas amplas antigas em recados
DROP POLICY IF EXISTS "Todos podem ver recados" ON recados;
DROP POLICY IF EXISTS "Professores e admins podem gerenciar recados" ON recados;

-- 4. Novas políticas mais restritas
-- 4.1 SELECT: qualquer usuário autenticado (auth.role() = 'authenticated')
CREATE POLICY "recados_select_authenticated"
  ON recados FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- 4.2 INSERT: somente admin ou professor vinculado via usuarios.auth_user_id
CREATE POLICY "recados_insert_prof_admin"
  ON recados FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario IN ('admin','professor')
        AND u.id = enviado_por
    )
  );

-- 4.3 UPDATE: somente admin ou professor que exista em usuarios (pode atualizar qualquer recado por enquanto)
CREATE POLICY "recados_update_prof_admin"
  ON recados FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario IN ('admin','professor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario IN ('admin','professor')
    )
  );

-- 4.4 DELETE: somente admin ou professor
CREATE POLICY "recados_delete_prof_admin"
  ON recados FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario IN ('admin','professor')
    )
  );

-- (Observação) Fase 2:
--   - Refinar SELECT para pais/alunos verem apenas recados relevantes
--   - Adicionar política granular por destinatario_tipo
--   - Eventual auditoria via tabela de logs
