ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cedula text,
  ADD COLUMN IF NOT EXISTS distrito text,
  ADD COLUMN IF NOT EXISTS activo boolean NOT NULL DEFAULT true;

ALTER TABLE public.ventas_siap
  ADD COLUMN IF NOT EXISTS empresa text,
  ADD COLUMN IF NOT EXISTS tipo_acceso text;

ALTER TABLE public.ventas_siap
  ADD CONSTRAINT ventas_siap_empresa_check CHECK (empresa IS NULL OR empresa IN ('MOVILCO','ALIADO'));

ALTER TABLE public.ventas_siap
  ADD CONSTRAINT ventas_siap_tipo_acceso_check CHECK (tipo_acceso IS NULL OR tipo_acceso IN ('@','DOBLE','TRIPLE'));

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
