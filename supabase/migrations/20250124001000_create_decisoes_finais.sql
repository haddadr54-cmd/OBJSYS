-- Tabela de decisões finais de ano
CREATE TABLE IF NOT EXISTS public.decisoes_finais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  ano_letivo INTEGER NOT NULL,
  status_final TEXT NOT NULL CHECK (status_final IN ('pendente','aprovado','reprovado','aprovado_conselho')),
  justificativa TEXT,
  decidido_por UUID REFERENCES public.usuarios(id),
  decidido_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (aluno_id, ano_letivo)
);

CREATE INDEX IF NOT EXISTS idx_decisoes_finais_ano ON public.decisoes_finais (ano_letivo);
CREATE INDEX IF NOT EXISTS idx_decisoes_finais_status ON public.decisoes_finais (status_final);

-- Trigger de updated_at
CREATE OR REPLACE FUNCTION update_decisoes_finais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS decisoes_finais_updated_at ON public.decisoes_finais;
CREATE TRIGGER decisoes_finais_updated_at
  BEFORE UPDATE ON public.decisoes_finais
  FOR EACH ROW EXECUTE FUNCTION update_decisoes_finais_updated_at();

ALTER TABLE public.decisoes_finais ENABLE ROW LEVEL SECURITY;

-- Admin: acesso total
CREATE POLICY "decisoes_finais_admin_full" ON public.decisoes_finais
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin' AND u.ativo = true
    )
  );

-- Professor: leitura e upsert dos seus alunos (ajuste conforme RLS de alunos)
CREATE POLICY "decisoes_finais_prof_read" ON public.decisoes_finais
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('professor','admin') AND u.ativo = true
    )
  );

CREATE POLICY "decisoes_finais_prof_upsert" ON public.decisoes_finais
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('professor','admin') AND u.ativo = true
    )
  );

CREATE POLICY "decisoes_finais_prof_update" ON public.decisoes_finais
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('professor','admin') AND u.ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('professor','admin') AND u.ativo = true
    )
  );

COMMENT ON TABLE public.decisoes_finais IS 'Decisões finais de ano por aluno (pendente/aprovado/reprovado/aprovado_conselho)';