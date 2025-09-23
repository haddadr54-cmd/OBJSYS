/*
  Migration: RLS para materiais e provas_tarefas (phase 1)
  Date: 2025-09-23

  Objetivos:
    - Restringir visibilidade e mutações de materiais e provas_tarefas
    - Padrões:
        * admin: total acesso
        * professor: apenas registros de disciplinas das quais é professor
        * pai: somente itens cujo disciplina.turma_id pertence a aluno(s) sob sua responsabilidade
    - Futuro: logs / auditoria
*/

-- Remover políticas antigas genéricas (se existirem)
DROP POLICY IF EXISTS "public_select_materiais" ON materiais;
DROP POLICY IF EXISTS "public_mutate_materiais" ON materiais;
DROP POLICY IF EXISTS "public_select_provas" ON provas_tarefas;
DROP POLICY IF EXISTS "public_mutate_provas" ON provas_tarefas;

-- SELECT materiais
CREATE POLICY "materiais_select_visibility"
  ON materiais FOR SELECT
  USING (
    -- Admin
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
    OR
    -- Professor dono da disciplina
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.id = materiais.disciplina_id AND d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
    OR
    -- Pai responsável por aluno da turma da disciplina
    EXISTS (
      SELECT 1 FROM usuarios u
      JOIN alunos a ON a.responsavel_id = u.id
      JOIN disciplinas d ON d.id = materiais.disciplina_id AND d.turma_id = a.turma_id
      WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'pai'
    )
  );

-- INSERT materiais (admin ou professor da disciplina)
CREATE POLICY "materiais_insert_prof_admin"
  ON materiais FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.id = materiais.disciplina_id AND d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- UPDATE materiais
CREATE POLICY "materiais_update_prof_admin"
  ON materiais FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'admin')
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.id = materiais.disciplina_id AND d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'admin')
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.id = materiais.disciplina_id AND d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- DELETE materiais
CREATE POLICY "materiais_delete_prof_admin"
  ON materiais FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'admin')
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.id = materiais.disciplina_id AND d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- SELECT provas_tarefas
CREATE POLICY "provas_select_visibility"
  ON provas_tarefas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.id = provas_tarefas.disciplina_id AND d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN alunos a ON a.responsavel_id = u.id
      JOIN disciplinas d ON d.id = provas_tarefas.disciplina_id AND d.turma_id = a.turma_id
      WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'pai'
    )
  );

-- INSERT provas_tarefas
CREATE POLICY "provas_insert_prof_admin"
  ON provas_tarefas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'admin'
    )
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.id = provas_tarefas.disciplina_id AND d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- UPDATE provas_tarefas
CREATE POLICY "provas_update_prof_admin"
  ON provas_tarefas FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'admin')
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.id = provas_tarefas.disciplina_id AND d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'admin')
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.id = provas_tarefas.disciplina_id AND d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- DELETE provas_tarefas
CREATE POLICY "provas_delete_prof_admin"
  ON provas_tarefas FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM usuarios u WHERE u.auth_user_id = auth.uid() AND u.tipo_usuario = 'admin')
    OR EXISTS (
      SELECT 1 FROM usuarios u
      JOIN disciplinas d ON d.id = provas_tarefas.disciplina_id AND d.professor_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- Índices auxiliares (idempotentes)
CREATE INDEX IF NOT EXISTS idx_materiais_disciplina_id ON materiais(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_provas_disciplina_id ON provas_tarefas(disciplina_id);
