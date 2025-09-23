/*
  Migration: recados RLS hardening (phase 2) - visibilidade refinada
  Date: 2025-09-23

  Objetivos:
    - Substituir SELECT amplo (qualquer autenticado) por visibilidade contextual:
        * admin: vê todos
        * professor: vê recados que ele criou (enviado_por)
        * pai: vê recados gerais, da(s) turma(s) dos filhos e individuais direcionados ao(s) filho(s)
    - Manter INSERT/UPDATE/DELETE de phase 1
    - Criar índices auxiliares para consultas de visibilidade (destinatario_tipo, destinatario_id)
*/

-- 1. Índices auxiliares (idempotentes)
CREATE INDEX IF NOT EXISTS idx_recados_destinatario_tipo ON recados(destinatario_tipo);
CREATE INDEX IF NOT EXISTS idx_recados_destinatario_id ON recados(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_recados_enviado_por ON recados(enviado_por);

-- 2. Remover política antiga de SELECT ampla
DROP POLICY IF EXISTS "recados_select_authenticated" ON recados;

-- 3. Nova política de SELECT refinada
CREATE POLICY "recados_select_visibility"
  ON recados FOR SELECT
  USING (
    -- Admin vê tudo
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario = 'admin'
    )
    OR
    -- Professor vê apenas os recados que ele enviou
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario = 'professor'
        AND u.id = recados.enviado_por
    )
    OR
    -- Pai: recados gerais OU da(s) turma(s) do(s) filho(s) OU individuais do(s) filho(s)
    EXISTS (
      SELECT 1 FROM usuarios u
      WHERE u.auth_user_id = auth.uid()
        AND u.tipo_usuario = 'pai'
        AND (
          recados.destinatario_tipo = 'geral'
          OR (
            recados.destinatario_tipo = 'turma'
            AND EXISTS (
              SELECT 1 FROM alunos a
              WHERE a.responsavel_id = u.id
                AND a.turma_id = recados.destinatario_id
            )
          )
          OR (
            recados.destinatario_tipo = 'aluno'
            AND EXISTS (
              SELECT 1 FROM alunos a
              WHERE a.responsavel_id = u.id
                AND a.id = recados.destinatario_id
            )
          )
        )
    )
  );

-- Observação: policies de INSERT/UPDATE/DELETE da fase 1 permanecem válidas.
-- Se for necessário permitir admin visualizar recados criados por qualquer professor (já permitido acima) ou ampliar professor para ver recados enviados para suas turmas por outros, isso será tratado em futura fase.
