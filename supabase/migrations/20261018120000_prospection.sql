-- Prospection des agences immobilières, demandée et validée par le gérant : liste construite à
-- partir de sources ouvertes (OpenStreetMap, annuaire officiel des entreprises, sites des agences),
-- messages rédigés sur mesure, relus dans /gestion/prospection, puis envoyés par la tâche planifiée
-- .github/workflows/prospection.yml (scripts/prospection.mjs). Une agence n'est contactée qu'une
-- fois, avec au plus une relance ; toute réponse ou désinscription arrête définitivement l'envoi.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Identifiant de la source (ex. « osm:node/123 ») : évite les doublons d'une synchronisation à l'autre.
  source_id TEXT UNIQUE,
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  city TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  siren TEXT,
  contact_name TEXT,
  -- Extrait du site de l'agence, pour personnaliser le message.
  site_excerpt TEXT,
  -- nouveau → brouillon → valide → contacte → relance → sans_reponse ;
  -- ou sans_email, repondu, partenaire, refus, desinscrit, ignore, erreur
  status TEXT NOT NULL DEFAULT 'nouveau',
  subject TEXT,
  body TEXT,
  followup_subject TEXT,
  followup_body TEXT,
  angle TEXT,
  -- Identifiant du premier e-mail : la relance est envoyée en réponse, dans la même conversation.
  message_id TEXT,
  crawled_at TIMESTAMPTZ,
  drafted_at TIMESTAMPTZ,
  first_contact_at TIMESTAMPTZ,
  last_contact_at TIMESTAMPTZ,
  followups INT NOT NULL DEFAULT 0,
  replied_at TIMESTAMPTZ,
  unsubscribe_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18), 'hex'),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS prospects_status_idx ON public.prospects (status);
CREATE INDEX IF NOT EXISTS prospects_email_idx ON public.prospects (lower(email));

-- Adresses à ne plus jamais contacter (désinscriptions), même si l'agence réapparaît dans la source.
CREATE TABLE IF NOT EXISTS public.prospect_optouts (
  email TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Réglages et journal de la prospection (une seule ligne).
CREATE TABLE IF NOT EXISTS public.prospect_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  -- validation : rien ne part sans validation dans l'intranet ; auto : envoi des brouillons.
  mode TEXT NOT NULL DEFAULT 'validation' CHECK (mode IN ('validation', 'auto')),
  paused BOOLEAN NOT NULL DEFAULT false,
  daily_limit INT NOT NULL DEFAULT 62 CHECK (daily_limit BETWEEN 0 AND 150),
  zones TEXT[] NOT NULL DEFAULT ARRAY['paris','petite-couronne','versailles','chartres','disney','roissy','bordeaux'],
  first_send_at TIMESTAMPTZ,
  last_sync_at TIMESTAMPTZ,
  last_summary_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  last_run_summary TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.prospect_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_optouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_settings ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.prospects, public.prospect_optouts, public.prospect_settings TO authenticated, service_role;

DROP POLICY IF EXISTS "Équipe : accès complet" ON public.prospects;
DROP POLICY IF EXISTS "Équipe : accès complet" ON public.prospect_optouts;
DROP POLICY IF EXISTS "Équipe : accès complet" ON public.prospect_settings;
CREATE POLICY "Équipe : accès complet" ON public.prospects FOR ALL TO authenticated
  USING (public.pms_is_staff()) WITH CHECK (public.pms_is_staff());
CREATE POLICY "Équipe : accès complet" ON public.prospect_optouts FOR ALL TO authenticated
  USING (public.pms_is_staff()) WITH CHECK (public.pms_is_staff());
CREATE POLICY "Équipe : accès complet" ON public.prospect_settings FOR ALL TO authenticated
  USING (public.pms_is_staff()) WITH CHECK (public.pms_is_staff());

-- Désinscription publique par jeton (page /desinscription et lien en un clic), sans connexion.
CREATE OR REPLACE FUNCTION public.prospect_unsubscribe(p_token TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_email TEXT;
BEGIN
  UPDATE public.prospects SET status = 'desinscrit', updated_at = now()
    WHERE unsubscribe_token = p_token RETURNING email INTO v_email;
  IF NOT FOUND THEN RETURN false; END IF;
  IF v_email IS NOT NULL THEN
    INSERT INTO public.prospect_optouts (email) VALUES (lower(v_email)) ON CONFLICT DO NOTHING;
    UPDATE public.prospects SET status = 'desinscrit', updated_at = now()
      WHERE lower(email) = lower(v_email);
  END IF;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.prospect_unsubscribe(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.prospect_unsubscribe(TEXT) TO anon, authenticated;
