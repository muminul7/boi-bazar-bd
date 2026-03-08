
-- Secure settings table for sensitive config (admin only)
CREATE TABLE public.secure_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.secure_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage secure settings"
  ON public.secure_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed with current keys (values will be set from admin UI)
INSERT INTO public.secure_settings (key, value) VALUES
  ('paystation_merchant_id', ''),
  ('paystation_password', '');
