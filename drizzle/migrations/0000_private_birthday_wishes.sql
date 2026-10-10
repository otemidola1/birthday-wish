CREATE TABLE public.birthday_wishes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL CHECK (char_length(email) <= 255),
 wish text NOT NULL CHECK (char_length(wish) BETWEEN 1 AND 2000),
 amount numeric NOT NULL CHECK (amount > 0),
 currency text NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
 checkout_id text UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.birthday_wishes TO service_role;
ALTER TABLE public.birthday_wishes ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.birthday_wishes IS 'Private guest wishes; server-only writes after validation. No public or visitor read access.';
CREATE TABLE public.birthday_rate_limits (
 key text PRIMARY KEY,
 window_started timestamptz NOT NULL DEFAULT now(),
 requests integer NOT NULL DEFAULT 1
);
GRANT ALL ON public.birthday_rate_limits TO service_role;
ALTER TABLE public.birthday_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.birthday_allow_request(rate_key text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
 INSERT INTO public.birthday_rate_limits(key) VALUES (rate_key)
 ON CONFLICT (key) DO UPDATE SET
 requests = CASE WHEN birthday_rate_limits.window_started < now() - interval '1 hour' THEN 1 ELSE birthday_rate_limits.requests + 1 END,
 window_started = CASE WHEN birthday_rate_limits.window_started < now() - interval '1 hour' THEN now() ELSE birthday_rate_limits.window_started END
 RETURNING requests INTO n;
 RETURN n <= 10;
END; $$;
REVOKE ALL ON FUNCTION public.birthday_allow_request(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.birthday_allow_request(text) TO service_role;