ALTER TABLE public.mobility_records ADD COLUMN IF NOT EXISTS primer_apellido text;

CREATE INDEX IF NOT EXISTS idx_mobility_records_primer_apellido ON public.mobility_records (primer_apellido);