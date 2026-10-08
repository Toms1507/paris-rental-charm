-- Livret par logement : un lien fixe à coller dans les messages programmés (gratuits) d'Airbnb,
-- Booking et Abritel. Le voyageur est reconnu par son code de réservation (Airbnb l'insère
-- automatiquement) ou, à défaut, par sa date d'arrivée.

ALTER TABLE public.pms_properties
  ADD COLUMN IF NOT EXISTS guest_link_token TEXT NOT NULL UNIQUE
  DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');

CREATE OR REPLACE FUNCTION public.pms_find_stay(p_link TEXT, p_code TEXT, p_arrival DATE)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.pms_properties; v_token TEXT; v_count INT;
BEGIN
  SELECT * INTO p FROM public.pms_properties WHERE guest_link_token = p_link AND active;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF coalesce(trim(p_code), '') <> '' THEN
    SELECT guest_token INTO v_token FROM public.pms_reservations
    WHERE property_id = p.id AND status = 'confirmee' AND check_out >= current_date - 1
      AND upper(replace(raw->>'reservation_code', ' ', '')) = upper(replace(trim(p_code), ' ', ''))
    LIMIT 1;
  ELSIF p_arrival IS NOT NULL THEN
    -- Sans code : uniquement si une seule réservation arrive ce jour-là, et pas plus de 2 jours à l'avance.
    SELECT count(*), min(guest_token) INTO v_count, v_token FROM public.pms_reservations
    WHERE property_id = p.id AND status = 'confirmee' AND check_in = p_arrival
      AND p_arrival BETWEEN current_date - 30 AND current_date + 2;
    IF v_count <> 1 THEN v_token := NULL; END IF;
  END IF;
  RETURN jsonb_build_object('property', p.name, 'photo_url', p.photo_url, 'guest_token', v_token);
END;
$$;
REVOKE ALL ON FUNCTION public.pms_find_stay(TEXT, TEXT, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.pms_find_stay(TEXT, TEXT, DATE) TO anon, authenticated;
