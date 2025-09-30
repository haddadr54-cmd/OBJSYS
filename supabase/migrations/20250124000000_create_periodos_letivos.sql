-- Criar tabela de períodos letivos
CREATE TABLE IF NOT EXISTS public.periodos_letivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('bimestre', 'trimestre', 'semestre', 'anual')),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  ano_letivo INTEGER NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_data_fim_maior_que_inicio CHECK (data_fim > data_inicio),
  CONSTRAINT check_ano_letivo_valido CHECK (ano_letivo >= 1900 AND ano_letivo <= 2100)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_periodos_letivos_ativo ON public.periodos_letivos (ativo);
CREATE INDEX IF NOT EXISTS idx_periodos_letivos_ano_letivo ON public.periodos_letivos (ano_letivo);
CREATE INDEX IF NOT EXISTS idx_periodos_letivos_datas ON public.periodos_letivos (data_inicio, data_fim);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_periodos_letivos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at
DROP TRIGGER IF EXISTS periodos_letivos_updated_at ON public.periodos_letivos;
CREATE TRIGGER periodos_letivos_updated_at
  BEFORE UPDATE ON public.periodos_letivos
  FOR EACH ROW
  EXECUTE FUNCTION update_periodos_letivos_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.periodos_letivos ENABLE ROW LEVEL SECURITY;

-- Política para administradores (acesso total)
CREATE POLICY "periodos_letivos_admin_full_access" ON public.periodos_letivos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario = 'admin'
      AND u.ativo = true
    )
  );

-- Política para professores (leitura apenas)
CREATE POLICY "periodos_letivos_professor_read" ON public.periodos_letivos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.usuarios u
      WHERE u.auth_user_id = auth.uid()
      AND u.tipo_usuario IN ('professor', 'admin')
      AND u.ativo = true
    )
  );

-- Inserir períodos letivos de exemplo para 2024
INSERT INTO public.periodos_letivos (nome, tipo, data_inicio, data_fim, ano_letivo, ativo)
VALUES 
  ('1º Bimestre 2024', 'bimestre', '2024-02-01', '2024-04-15', 2024, false),
  ('2º Bimestre 2024', 'bimestre', '2024-04-16', '2024-06-30', 2024, true),
  ('3º Bimestre 2024', 'bimestre', '2024-08-01', '2024-10-15', 2024, false),
  ('4º Bimestre 2024', 'bimestre', '2024-10-16', '2024-12-20', 2024, false)
ON CONFLICT DO NOTHING;

-- Comentários na tabela e colunas
COMMENT ON TABLE public.periodos_letivos IS 'Tabela para gerenciar períodos letivos (bimestres, trimestres, semestres)';
COMMENT ON COLUMN public.periodos_letivos.id IS 'Identificador único do período letivo';
COMMENT ON COLUMN public.periodos_letivos.nome IS 'Nome descritivo do período (ex: "1º Bimestre 2024")';
COMMENT ON COLUMN public.periodos_letivos.tipo IS 'Tipo do período: bimestre, trimestre, semestre ou anual';
COMMENT ON COLUMN public.periodos_letivos.data_inicio IS 'Data de início do período letivo';
COMMENT ON COLUMN public.periodos_letivos.data_fim IS 'Data de fim do período letivo';
COMMENT ON COLUMN public.periodos_letivos.ano_letivo IS 'Ano letivo ao qual o período pertence';
COMMENT ON COLUMN public.periodos_letivos.ativo IS 'Indica se é o período letivo atualmente ativo';
COMMENT ON COLUMN public.periodos_letivos.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN public.periodos_letivos.updated_at IS 'Data e hora da última atualização do registro';