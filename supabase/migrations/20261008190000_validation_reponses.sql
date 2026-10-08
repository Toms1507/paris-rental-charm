-- Questions des voyageurs auxquelles l'assistant n'est pas sûr de savoir répondre : il propose
-- une réponse, le gérant la valide ou la corrige depuis un lien reçu sur WhatsApp, et la réponse
-- s'affiche dans le livret du voyageur. La réponse peut être ajoutée aux questions fréquentes du
-- logement pour que l'assistant sache y répondre seul la prochaine fois.

CREATE TABLE public.pms_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID NOT NULL REFERENCES public.pms_reservations (id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  proposed_answer TEXT,
  final_answer TEXT,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'en_attente',
  token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  answered_at TIMESTAMPTZ
);
ALTER TABLE public.pms_escalations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pms_escalations TO authenticated;
GRANT ALL ON public.pms_escalations TO service_role;
CREATE POLICY "Équipe : accès complet" ON public.pms_escalations FOR ALL TO authenticated
  USING (public.pms_is_staff()) WITH CHECK (public.pms_is_staff());

-- Appelée par le serveur quand l'assistant a un doute. Renvoie le jeton du lien de validation.
CREATE OR REPLACE FUNCTION public.pms_guest_escalate(p_token TEXT, p_question TEXT, p_proposed TEXT, p_reason TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r public.pms_reservations; v_token TEXT;
BEGIN
  SELECT * INTO r FROM public.pms_reservations WHERE guest_token = p_token AND status <> 'annulee';
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF (SELECT count(*) FROM public.pms_escalations WHERE reservation_id = r.id) >= 30 THEN RETURN NULL; END IF;
  INSERT INTO public.pms_escalations (reservation_id, question, proposed_answer, reason)
  VALUES (r.id, left(p_question, 4000), left(p_proposed, 4000), left(p_reason, 500))
  RETURNING token INTO v_token;
  RETURN v_token;
END;
$$;

-- Page de validation (lien WhatsApp) : question, réponse proposée, contexte.
CREATE OR REPLACE FUNCTION public.pms_get_escalation(p_token TEXT)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'question', e.question, 'proposed_answer', e.proposed_answer, 'final_answer', e.final_answer,
    'reason', e.reason, 'status', e.status, 'created_at', e.created_at, 'answered_at', e.answered_at,
    'guest_name', r.guest_name, 'check_in', r.check_in, 'check_out', r.check_out,
    'property', p.name, 'language', r.guest_language
  )
  FROM public.pms_escalations e
  JOIN public.pms_reservations r ON r.id = e.reservation_id
  JOIN public.pms_properties p ON p.id = r.property_id
  WHERE e.token = p_token;
$$;

-- Validation ou correction de la réponse. p_learn : ajoute la question et la réponse aux
-- questions fréquentes du logement (l'assistant y répondra seul la prochaine fois).
CREATE OR REPLACE FUNCTION public.pms_answer_escalation(p_token TEXT, p_answer TEXT, p_learn BOOLEAN)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE e public.pms_escalations; v_property UUID; v_faq TEXT;
BEGIN
  SELECT * INTO e FROM public.pms_escalations WHERE token = p_token;
  IF NOT FOUND OR coalesce(trim(p_answer), '') = '' THEN RETURN false; END IF;
  UPDATE public.pms_escalations SET
    final_answer = left(trim(p_answer), 4000),
    status = CASE WHEN trim(p_answer) = trim(coalesce(proposed_answer, '')) THEN 'valide' ELSE 'modifie' END,
    answered_at = now()
  WHERE id = e.id;
  IF p_learn THEN
    SELECT property_id INTO v_property FROM public.pms_reservations WHERE id = e.reservation_id;
    SELECT coalesce(guide->>'faq', '') INTO v_faq FROM public.pms_properties WHERE id = v_property;
    UPDATE public.pms_properties SET guide = jsonb_set(guide, '{faq}', to_jsonb(
      left(trim(both E'\n' from v_faq || E'\n' || left(e.question, 300) || ' → ' || left(trim(p_answer), 1000)), 20000)
    )) WHERE id = v_property;
  END IF;
  RETURN true;
END;
$$;

-- Historique de la conversation affiché dans le livret (réponses de l'assistant et de l'équipe).
CREATE OR REPLACE FUNCTION public.pms_guest_chat(p_token TEXT)
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(jsonb_agg(x ORDER BY x->>'at'), '[]'::jsonb) FROM (
    SELECT jsonb_build_object('at', m.created_at, 'question', m.body, 'answer', m.subject, 'status', 'ia') AS x
    FROM public.pms_messages m JOIN public.pms_reservations r ON r.id = m.reservation_id
    WHERE r.guest_token = p_token AND m.channel = 'assistant'
    UNION ALL
    SELECT jsonb_build_object('at', e.created_at, 'question', e.question, 'answer', e.final_answer,
      'status', CASE WHEN e.final_answer IS NULL THEN 'en_attente' ELSE 'equipe' END)
    FROM public.pms_escalations e JOIN public.pms_reservations r ON r.id = e.reservation_id
    WHERE r.guest_token = p_token
  ) s;
$$;

REVOKE ALL ON FUNCTION public.pms_guest_escalate(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pms_get_escalation(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pms_answer_escalation(TEXT, TEXT, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.pms_guest_chat(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pms_guest_escalate(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pms_get_escalation(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pms_answer_escalation(TEXT, TEXT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.pms_guest_chat(TEXT) TO anon, authenticated;
