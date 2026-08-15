CREATE TABLE public.tarifas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria text NOT NULL,
  renta integer NOT NULL,
  servicio text NOT NULL,
  codigo_hfc text,
  codigo_ftth text,
  ott text,
  decodificadores text,
  accesos text,
  campana text,
  instalacion text,
  orden integer NOT NULL DEFAULT 0,
  vigencia text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tarifas TO authenticated;
GRANT ALL ON public.tarifas TO service_role;

ALTER TABLE public.tarifas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tarifas"
  ON public.tarifas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert tarifas"
  ON public.tarifas FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update tarifas"
  ON public.tarifas FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete tarifas"
  ON public.tarifas FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER tarifas_updated_at BEFORE UPDATE ON public.tarifas
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_tarifas_categoria ON public.tarifas (categoria);
CREATE INDEX idx_tarifas_codigo_hfc ON public.tarifas (codigo_hfc);
CREATE INDEX idx_tarifas_codigo_ftth ON public.tarifas (codigo_ftth);