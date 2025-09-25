-- Enable Realtime for core tables (recados, provas_tarefas, materiais, notas)
-- This assumes Supabase Realtime is enabled on the project and the publication exists.

-- Create publication if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE public.recados, public.provas_tarefas, public.materiais, public.notas;
  ELSE
    -- Ensure tables are part of the publication
    ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.recados;
    ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.provas_tarefas;
    ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.materiais;
    ALTER PUBLICATION supabase_realtime ADD TABLE IF NOT EXISTS public.notas;
  END IF;
END$$;
