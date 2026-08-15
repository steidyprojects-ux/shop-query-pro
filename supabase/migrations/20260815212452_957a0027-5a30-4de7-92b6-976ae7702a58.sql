ALTER TABLE public.mobility_records
  ADD COLUMN IF NOT EXISTS nodo text,
  ADD COLUMN IF NOT EXISTS tipo_red text,
  ADD COLUMN IF NOT EXISTS direccion text,
  ADD COLUMN IF NOT EXISTS cedula_asesor text;