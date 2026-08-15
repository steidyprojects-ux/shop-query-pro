CREATE TABLE public.ventas_siap (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_cliente text NOT NULL,
  cedula_cliente text NOT NULL,
  telefono text,
  cuenta text,
  orden_trabajo text,
  cedula_vendedor text NOT NULL,
  ciudad text,
  observaciones text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ventas_siap TO authenticated;
GRANT ALL ON public.ventas_siap TO service_role;

ALTER TABLE public.ventas_siap ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Asesores ven sus ventas" ON public.ventas_siap
  FOR SELECT TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Asesores crean sus ventas" ON public.ventas_siap
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Asesores editan sus ventas" ON public.ventas_siap
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Asesores borran sus ventas" ON public.ventas_siap
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ventas_siap_created_by ON public.ventas_siap(created_by);
CREATE INDEX idx_ventas_siap_cedula_cliente ON public.ventas_siap(cedula_cliente);

CREATE TRIGGER ventas_siap_updated_at
  BEFORE UPDATE ON public.ventas_siap
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();