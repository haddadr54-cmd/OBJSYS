/*
  Migration: notas RLS hardening (phase 1)
  Date: 2025-09-23

  Objetivos:
    - Substituir políticas amplas de notas por regras baseadas em auth.uid()
    - Visibilidade:
        * admin vê todas
        * professor responsável pela disciplina vê as notas da disciplina
        * pai responsável pelo aluno vê notas do(s) filho(s)
      (aluno direto ainda não autenticado nesta fase; será tratado se futuramente alunos tiverem conta própria)
    - Edição / criação / exclusão restrita a admin ou professor responsável
*/

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Todos podem ver notas" ON notas;
DROP POLICY IF EXISTS "Professores e admins podem gerenciar notas" ON notas;

-- 2. Política de SELECT (visibilidade)
CREATE POLICY "notas_select_visibility"
  ON notas FOR SELECT
  USING (
    -- Admin
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario = 'admin'
    )
    OR
    -- Professor responsável pela disciplina
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND d.id = notas.disciplina_id
    )
    OR
    -- Pai responsável pelo aluno
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN alunos a ON a.responsavel_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND a.id = notas.aluno_id
    )
  );

-- 3. INSERT (admin ou professor responsável pela disciplina)
CREATE POLICY "notas_insert_prof_admin"
  ON notas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND d.id = notas.disciplina_id
    )
  );

-- 4. UPDATE (admin ou professor responsável)
CREATE POLICY "notas_update_prof_admin"
  ON notas FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND d.id = notas.disciplina_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND d.id = notas.disciplina_id
    )
  );

-- 5. DELETE (admin ou professor responsável)
CREATE POLICY "notas_delete_prof_admin"
  ON notas FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario = 'admin'
    )
    OR
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
        AND d.id = notas.disciplina_id
    )
  );

-- (Futuro) Fase 2:
--   - Permitir aluno (quando tiver conta) consultar suas próprias notas
--   - Auditoria: logs de alterações em notas
--   - Índices adicionais se necessário (aluno_id, disciplina_id) já cobertos parcialmente por FKs; adicionar se surgirem gargalos
