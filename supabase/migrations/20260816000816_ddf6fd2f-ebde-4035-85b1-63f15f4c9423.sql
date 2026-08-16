-- mobility_records: quitar lectura abierta, dejar solo admins
DROP POLICY IF EXISTS "Authenticated users can read mobility records" ON public.mobility_records;
CREATE POLICY "Admins can read mobility records"
ON public.mobility_records FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Catálogos: quitar lectura abierta (se sirven vía funciones de servidor autenticadas)
DROP POLICY IF EXISTS "Authenticated can read nodos" ON public.nodos;
DROP POLICY IF EXISTS "Authenticated can read distritos_calle" ON public.distritos_calle;
DROP POLICY IF EXISTS "Authenticated can read codigos_asesor" ON public.codigos_asesor;
DROP POLICY IF EXISTS "Authenticated users can read tarifas" ON public.tarifas;

CREATE POLICY "Admins can read tarifas"
ON public.tarifas FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

REVOKE SELECT ON public.nodos FROM anon;
REVOKE SELECT ON public.distritos_calle FROM anon;
REVOKE SELECT ON public.codigos_asesor FROM anon;
REVOKE SELECT ON public.tarifas FROM anon;
REVOKE SELECT ON public.mobility_records FROM anon;