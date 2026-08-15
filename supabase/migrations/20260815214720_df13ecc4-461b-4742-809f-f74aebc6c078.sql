CREATE TABLE public.nodos (
  id bigserial PRIMARY KEY,
  id_nodo text NOT NULL,
  nombre_nodo text,
  comunidad text,
  nombre_comunidad text,
  departamento text,
  red_por_nodo text,
  red_predominante text,
  region text,
  area text,
  distrito text,
  estado_nodo text,
  regional text
);
GRANT SELECT ON public.nodos TO authenticated;
GRANT ALL ON public.nodos TO service_role;
ALTER TABLE public.nodos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read nodos" ON public.nodos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage nodos" ON public.nodos FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE INDEX nodos_id_nodo_idx ON public.nodos (upper(id_nodo));
CREATE INDEX nodos_comunidad_idx ON public.nodos (upper(nombre_comunidad));
CREATE INDEX nodos_distrito_idx ON public.nodos (upper(distrito));

CREATE TABLE public.distritos_calle (
  id bigserial PRIMARY KEY,
  regional text,
  region text,
  zona text,
  distrito text NOT NULL
);
GRANT SELECT ON public.distritos_calle TO authenticated;
GRANT ALL ON public.distritos_calle TO service_role;
ALTER TABLE public.distritos_calle ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read distritos_calle" ON public.distritos_calle FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage distritos_calle" ON public.distritos_calle FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));
CREATE INDEX distritos_calle_distrito_idx ON public.distritos_calle (upper(distrito));

CREATE TABLE public.codigos_asesor (
  id bigserial PRIMARY KEY,
  tipo text NOT NULL CHECK (tipo IN ('PDV','CALLE')),
  codigo text NOT NULL,
  cc_completa text,
  nombre text,
  gv_division text,
  regional text NOT NULL
);
GRANT SELECT ON public.codigos_asesor TO authenticated;
GRANT ALL ON public.codigos_asesor TO service_role;
ALTER TABLE public.codigos_asesor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read codigos_asesor" ON public.codigos_asesor FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage codigos_asesor" ON public.codigos_asesor FOR ALL TO authenticated USING (has_role(auth.uid(),'admin'::app_role)) WITH CHECK (has_role(auth.uid(),'admin'::app_role));

INSERT INTO public.codigos_asesor (tipo, codigo, cc_completa, nombre, gv_division, regional) VALUES
('PDV','06795066','1006795066','JHORMAN ARMANDO URREGO','REGION COSTA','R1'),
('PDV','32564801','32564801','CORREA MAZO MARTHA L L','REGION NOROCCIDENTE','R2'),
('PDV','10041022','1010041022','KAREN LORENA MORENO CE','REGION OCCIDENTE','R3'),
('PDV','21928133','1121928133','FAIDER STIVEN MARTINEZ REINA','REGION CENTRO','R4'),
('PDV','23512664','1123512664','LEIDY NIYERED AYALA CHAGUENDO','REGION CENTRO','R4'),
('PDV','51473156','1051473156','LIDIA CEPEDA ACEVEDO','REGION ORIENTE','R5'),
('CALLE','304273','86071302','WILIAM GERARDO REINA PIRATOBA','REGION ORIENTE','R5'),
('CALLE','06875293','1006875293','DANIEL ANDRES CASTAÑEDA','REGION OCCIDENTE','R3'),
('CALLE','93084335','93084335','WILIAM FERNEY FARFAN','REGION NOROCCIDENTE','R2');