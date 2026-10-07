-- Logiciel de gestion Spinelle : logements, calendriers, réservations, ménages, incidents,
-- messages voyageurs, rapports propriétaires, avis.
-- Accès :
--   * équipe Spinelle (table pms_staff) : tout, via Supabase Auth ;
--   * voyageurs : livret /sejour/<jeton>, via les fonctions pms_get_stay et pms_guest_* ;
--   * prestataires de ménage : portail /menage/<jeton>, via pms_get_cleaner et pms_cleaner_*.
-- Le premier compte créé devient administrateur ; les inscriptions suivantes n'ont accès à rien.

-- ---------------------------------------------------------------- équipe

CREATE TABLE public.pms_staff (
  user_id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pms_staff ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.pms_staff TO authenticated;
GRANT ALL ON public.pms_staff TO service_role;
CREATE POLICY "Lire sa propre fiche" ON public.pms_staff FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.pms_is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.pms_staff WHERE user_id = auth.uid());
$$;

-- Premier compte inscrit = administrateur.
CREATE OR REPLACE FUNCTION public.pms_first_user_is_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pms_staff) THEN
    INSERT INTO public.pms_staff (user_id, email, role) VALUES (NEW.id, NEW.email, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER pms_first_user_is_admin AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.pms_first_user_is_admin();

-- Ajout d'un membre d'équipe (compte déjà créé sur /gestion) par un membre existant.
CREATE OR REPLACE FUNCTION public.pms_add_staff(p_email TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id UUID;
BEGIN
  IF NOT public.pms_is_staff() THEN RAISE EXCEPTION 'Accès refusé'; END IF;
  SELECT id INTO v_id FROM auth.users WHERE lower(email) = lower(trim(p_email));
  IF v_id IS NULL THEN RETURN false; END IF;
  INSERT INTO public.pms_staff (user_id, email, role) VALUES (v_id, lower(trim(p_email)), 'equipe')
    ON CONFLICT (user_id) DO NOTHING;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.pms_add_staff(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pms_add_staff(TEXT) TO authenticated;

-- Les demandes du site ne sont plus lisibles que par l'équipe (et non plus par tout compte connecté).
DROP POLICY IF EXISTS "Authenticated users can read leads" ON public.leads;
CREATE POLICY "Équipe : lecture des demandes" ON public.leads FOR SELECT TO authenticated
  USING (public.pms_is_staff());

-- ---------------------------------------------------------------- tables métier

CREATE TABLE public.pms_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pms_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  iban TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pms_cleaners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  rate NUMERIC NOT NULL DEFAULT 0,
  token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pms_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  arrondissement TEXT,
  owner_id UUID REFERENCES public.pms_owners (id) ON DELETE SET NULL,
  cleaner_id UUID REFERENCES public.pms_cleaners (id) ON DELETE SET NULL,
  photo_url TEXT,
  capacity INT NOT NULL DEFAULT 2,
  bedrooms INT NOT NULL DEFAULT 1,
  checkin_time TEXT NOT NULL DEFAULT '16:00',
  checkout_time TEXT NOT NULL DEFAULT '11:00',
  late_checkout_until TEXT NOT NULL DEFAULT '14:00',
  late_checkout_price NUMERIC NOT NULL DEFAULT 30,
  early_checkin_price NUMERIC NOT NULL DEFAULT 30,
  commission_rate NUMERIC NOT NULL DEFAULT 0.20,
  cleaning_fee NUMERIC NOT NULL DEFAULT 0,
  -- Livret d'accueil : accès, wifi, règles, équipements, FAQ… (champs libres)
  guide JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Calendriers iCal importés : [{ platform, url, last_sync, last_status }]
  ical_feeds JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Lien du calendrier unifié à importer dans chaque plateforme.
  export_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pms_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.pms_properties (id) ON DELETE CASCADE,
  platform TEXT NOT NULL DEFAULT 'direct',
  external_uid TEXT,
  status TEXT NOT NULL DEFAULT 'confirmee',
  source TEXT NOT NULL DEFAULT 'manuel',
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  guest_language TEXT NOT NULL DEFAULT 'fr',
  guests INT NOT NULL DEFAULT 2,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  arrival_time TEXT,
  departure_time TEXT,
  amount_gross NUMERIC NOT NULL DEFAULT 0,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  cleaning_fee NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  raw JSONB,
  guest_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, external_uid)
);
CREATE INDEX pms_reservations_dates ON public.pms_reservations (property_id, check_in, check_out);

CREATE TABLE public.pms_cleaning_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.pms_properties (id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES public.pms_reservations (id) ON DELETE CASCADE,
  next_reservation_id UUID REFERENCES public.pms_reservations (id) ON DELETE SET NULL,
  cleaner_id UUID REFERENCES public.pms_cleaners (id) ON DELETE SET NULL,
  date DATE NOT NULL,
  window_start TEXT,
  window_end TEXT,
  next_guests INT,
  status TEXT NOT NULL DEFAULT 'a_faire',
  condition TEXT,
  report_notes TEXT,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  price NUMERIC NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reservation_id)
);

CREATE TABLE public.pms_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.pms_properties (id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.pms_cleaning_tasks (id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES public.pms_reservations (id) ON DELETE SET NULL,
  severity TEXT NOT NULL DEFAULT 'orange',
  title TEXT NOT NULL,
  description TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'ouvert',
  reported_by TEXT,
  cost NUMERIC NOT NULL DEFAULT 0,
  billable_to_owner BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE public.pms_message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  offset_days INT NOT NULL DEFAULT 0,
  send_time TEXT NOT NULL DEFAULT '10:00',
  channel TEXT NOT NULL DEFAULT 'auto',
  subject TEXT,
  body TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES public.pms_reservations (id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.pms_message_templates (id) ON DELETE SET NULL,
  direction TEXT NOT NULL DEFAULT 'sortant',
  channel TEXT NOT NULL DEFAULT 'email',
  recipient TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planifie',
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reservation_id, template_id)
);

CREATE TABLE public.pms_guest_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.pms_reservations (id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  details TEXT,
  requested_time TEXT,
  price NUMERIC,
  rating INT,
  status TEXT NOT NULL DEFAULT 'en_attente',
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pms_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.pms_properties (id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT current_date,
  category TEXT NOT NULL DEFAULT 'autre',
  label TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  invoice_url TEXT,
  billable_to_owner BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pms_owner_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.pms_owners (id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.pms_properties (id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'brouillon',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, month)
);

CREATE TABLE public.pms_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.pms_properties (id) ON DELETE CASCADE,
  reservation_id UUID REFERENCES public.pms_reservations (id) ON DELETE SET NULL,
  platform TEXT NOT NULL DEFAULT 'airbnb',
  rating NUMERIC NOT NULL,
  comment TEXT,
  date DATE NOT NULL DEFAULT current_date,
  response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.pms_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.pms_properties (id) ON DELETE CASCADE,
  arrondissement TEXT,
  category TEXT NOT NULL DEFAULT 'restaurant',
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  url TEXT,
  tip TEXT,
  price_level TEXT,
  trending BOOLEAN NOT NULL DEFAULT false,
  source TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Toutes les tables métier : accès complet pour l'équipe, rien pour les autres.
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'pms_settings', 'pms_owners', 'pms_cleaners', 'pms_properties', 'pms_reservations',
    'pms_cleaning_tasks', 'pms_incidents', 'pms_message_templates', 'pms_messages',
    'pms_guest_requests', 'pms_expenses', 'pms_owner_reports', 'pms_reviews', 'pms_recommendations'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format(
      'CREATE POLICY "Équipe : accès complet" ON public.%I FOR ALL TO authenticated USING (public.pms_is_staff()) WITH CHECK (public.pms_is_staff())',
      t
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------- livret voyageur (public, par jeton)

-- Les codes d'accès ne sont communiqués qu'à partir de la veille de l'arrivée.
CREATE OR REPLACE FUNCTION public.pms_get_stay(p_token TEXT)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.pms_reservations;
  p public.pms_properties;
  codes_visible BOOLEAN;
  guide JSONB;
BEGIN
  SELECT * INTO r FROM public.pms_reservations WHERE guest_token = p_token AND status <> 'annulee';
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT * INTO p FROM public.pms_properties WHERE id = r.property_id;
  codes_visible := current_date >= r.check_in - 1 AND current_date <= r.check_out + 1;
  guide := p.guide;
  IF NOT codes_visible THEN
    guide := guide - 'door_code' - 'keybox_code' - 'access_details';
  END IF;
  RETURN jsonb_build_object(
    'reservation', jsonb_build_object(
      'id', r.id, 'guest_name', r.guest_name, 'guests', r.guests, 'check_in', r.check_in,
      'check_out', r.check_out, 'platform', r.platform, 'language', r.guest_language,
      'arrival_time', r.arrival_time, 'departure_time', r.departure_time
    ),
    'property', jsonb_build_object(
      'id', p.id, 'name', p.name, 'address', p.address, 'arrondissement', p.arrondissement,
      'photo_url', p.photo_url, 'checkin_time', p.checkin_time, 'checkout_time', p.checkout_time,
      'late_checkout_until', p.late_checkout_until, 'late_checkout_price', p.late_checkout_price,
      'early_checkin_price', p.early_checkin_price, 'guide', guide
    ),
    'codes_visible', codes_visible,
    'recommendations', COALESCE((
      SELECT jsonb_agg(to_jsonb(x) ORDER BY x.trending DESC, x.category, x.name)
      FROM public.pms_recommendations x
      WHERE x.active AND (x.property_id = p.id OR (x.property_id IS NULL AND (x.arrondissement IS NULL OR x.arrondissement = p.arrondissement)))
    ), '[]'::jsonb),
    'requests', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', q.id, 'type', q.type, 'status', q.status, 'requested_time', q.requested_time, 'price', q.price, 'answer', q.answer, 'created_at', q.created_at) ORDER BY q.created_at)
      FROM public.pms_guest_requests q WHERE q.reservation_id = r.id AND q.type <> 'question'
    ), '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.pms_guest_request(
  p_token TEXT, p_type TEXT, p_details TEXT, p_requested_time TEXT, p_rating INT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.pms_reservations; p public.pms_properties; new_id UUID; v_price NUMERIC;
BEGIN
  SELECT * INTO r FROM public.pms_reservations WHERE guest_token = p_token AND status <> 'annulee';
  IF NOT FOUND THEN RAISE EXCEPTION 'Séjour introuvable'; END IF;
  IF p_type NOT IN ('late_checkout', 'early_checkin', 'probleme', 'avis_sejour', 'question', 'autre') THEN
    RAISE EXCEPTION 'Type de demande inconnu';
  END IF;
  -- Limite anti-abus : 60 demandes par séjour.
  IF (SELECT count(*) FROM public.pms_guest_requests WHERE reservation_id = r.id) >= 60 THEN
    RAISE EXCEPTION 'Trop de demandes';
  END IF;
  SELECT * INTO p FROM public.pms_properties WHERE id = r.property_id;
  v_price := CASE p_type WHEN 'late_checkout' THEN p.late_checkout_price
                         WHEN 'early_checkin' THEN p.early_checkin_price END;
  INSERT INTO public.pms_guest_requests (reservation_id, type, details, requested_time, price, rating)
  VALUES (r.id, p_type, left(p_details, 4000), left(p_requested_time, 20), v_price,
          CASE WHEN p_rating BETWEEN 1 AND 5 THEN p_rating END)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- Journal des conversations avec l'assistant (pour que l'équipe voie les questions posées).
CREATE OR REPLACE FUNCTION public.pms_guest_log_chat(p_token TEXT, p_question TEXT, p_answer TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.pms_reservations;
BEGIN
  SELECT * INTO r FROM public.pms_reservations WHERE guest_token = p_token;
  IF NOT FOUND THEN RETURN; END IF;
  IF (SELECT count(*) FROM public.pms_messages WHERE reservation_id = r.id AND channel = 'assistant') >= 400 THEN
    RETURN;
  END IF;
  INSERT INTO public.pms_messages (reservation_id, direction, channel, body, subject, status, sent_at)
  VALUES (r.id, 'entrant', 'assistant', left(p_question, 4000), left(p_answer, 8000), 'recu', now());
END;
$$;

-- ---------------------------------------------------------------- portail ménage (public, par jeton)

CREATE OR REPLACE FUNCTION public.pms_get_cleaner(p_token TEXT)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.pms_cleaners;
BEGIN
  SELECT * INTO c FROM public.pms_cleaners WHERE token = p_token AND active;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'cleaner', jsonb_build_object('id', c.id, 'name', c.name, 'company', c.company),
    'tasks', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'task', to_jsonb(t),
        'property', jsonb_build_object(
          'id', p.id, 'name', p.name, 'address', p.address, 'photo_url', p.photo_url,
          'checklist', p.checklist, 'bedrooms', p.bedrooms, 'capacity', p.capacity,
          'access', jsonb_build_object(
            'door_code', p.guide->'door_code', 'keybox_code', p.guide->'keybox_code',
            'access_details', p.guide->'access_details', 'cleaning_notes', p.guide->'cleaning_notes',
            'trash', p.guide->'trash'
          )
        ),
        'reservation', CASE WHEN r.id IS NULL THEN NULL ELSE jsonb_build_object(
          'check_in', r.check_in, 'check_out', r.check_out, 'guests', r.guests, 'platform', r.platform,
          'departure_time', r.departure_time) END,
        'next', CASE WHEN n.id IS NULL THEN NULL ELSE jsonb_build_object(
          'check_in', n.check_in, 'check_out', n.check_out, 'guests', n.guests,
          'arrival_time', n.arrival_time, 'notes', n.notes) END
      ) ORDER BY t.date, t.window_start)
      FROM public.pms_cleaning_tasks t
      JOIN public.pms_properties p ON p.id = t.property_id
      LEFT JOIN public.pms_reservations r ON r.id = t.reservation_id
      LEFT JOIN public.pms_reservations n ON n.id = t.next_reservation_id
      WHERE t.cleaner_id = c.id AND t.date BETWEEN current_date - 14 AND current_date + 60
    ), '[]'::jsonb)
  );
END;
$$;

-- Compte rendu de ménage. Un état orange ou rouge ouvre automatiquement un incident.
CREATE OR REPLACE FUNCTION public.pms_cleaner_update_task(p_token TEXT, p_task_id UUID, p_patch JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.pms_cleaners; t public.pms_cleaning_tasks; v_condition TEXT;
BEGIN
  SELECT * INTO c FROM public.pms_cleaners WHERE token = p_token AND active;
  IF NOT FOUND THEN RAISE EXCEPTION 'Accès refusé'; END IF;
  SELECT * INTO t FROM public.pms_cleaning_tasks WHERE id = p_task_id AND cleaner_id = c.id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ménage introuvable'; END IF;
  v_condition := p_patch->>'condition';
  IF v_condition IS NOT NULL AND v_condition NOT IN ('vert', 'orange', 'rouge') THEN
    RAISE EXCEPTION 'État inconnu';
  END IF;
  UPDATE public.pms_cleaning_tasks SET
    status = CASE WHEN p_patch->>'status' IN ('a_faire', 'en_cours', 'termine') THEN p_patch->>'status' ELSE status END,
    condition = COALESCE(v_condition, condition),
    report_notes = COALESCE(left(p_patch->>'report_notes', 4000), report_notes),
    checklist = COALESCE(p_patch->'checklist', checklist),
    photos = COALESCE(p_patch->'photos', photos),
    started_at = CASE WHEN p_patch->>'status' = 'en_cours' AND started_at IS NULL THEN now() ELSE started_at END,
    completed_at = CASE WHEN p_patch->>'status' = 'termine' THEN now() ELSE completed_at END
  WHERE id = t.id RETURNING * INTO t;
  IF p_patch->>'status' = 'termine' AND t.condition IN ('orange', 'rouge')
     AND NOT EXISTS (SELECT 1 FROM public.pms_incidents WHERE task_id = t.id) THEN
    INSERT INTO public.pms_incidents (property_id, task_id, reservation_id, severity, title, description, photos, reported_by)
    VALUES (t.property_id, t.id, t.reservation_id, t.condition,
            CASE t.condition WHEN 'rouge' THEN 'Problème important signalé au ménage' ELSE 'Point à vérifier signalé au ménage' END,
            t.report_notes, t.photos, c.name);
  END IF;
  RETURN to_jsonb(t);
END;
$$;

-- ---------------------------------------------------------------- calendriers exportés (public, par jeton)

CREATE OR REPLACE FUNCTION public.pms_get_export(p_token TEXT)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'property', jsonb_build_object('id', p.id, 'name', p.name),
    'reservations', COALESCE((
      SELECT jsonb_agg(jsonb_build_object('id', r.id, 'check_in', r.check_in, 'check_out', r.check_out, 'platform', r.platform, 'status', r.status))
      FROM public.pms_reservations r
      WHERE r.property_id = p.id AND r.status <> 'annulee' AND r.check_out >= current_date - 30
    ), '[]'::jsonb)
  )
  FROM public.pms_properties p WHERE p.export_token = p_token;
$$;

REVOKE ALL ON FUNCTION public.pms_get_stay(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pms_guest_request(TEXT, TEXT, TEXT, TEXT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pms_guest_log_chat(TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pms_get_cleaner(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pms_cleaner_update_task(TEXT, UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pms_get_export(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pms_get_stay(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pms_guest_request(TEXT, TEXT, TEXT, TEXT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pms_guest_log_chat(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pms_get_cleaner(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pms_cleaner_update_task(TEXT, UUID, JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pms_get_export(TEXT) TO anon, authenticated;

-- ---------------------------------------------------------------- fichiers (photos de ménage, factures)
-- Le bucket « pms » est créé via l'outil Storage (privé, les buckets publics étant bloqués).

CREATE POLICY "Équipe : fichiers" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'pms' AND public.pms_is_staff())
  WITH CHECK (bucket_id = 'pms' AND public.pms_is_staff());

-- Les prestataires déposent leurs photos dans menage/<id du ménage>/… (identifiant non devinable),
-- uniquement pour un ménage du jour ou des 3 derniers jours.
CREATE POLICY "Prestataires : photos de ménage" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'pms'
    AND (storage.foldername(name))[1] = 'menage'
    AND EXISTS (
      SELECT 1 FROM public.pms_cleaning_tasks t
      WHERE t.id::text = (storage.foldername(name))[2] AND t.date BETWEEN current_date - 3 AND current_date + 1
    )
  );