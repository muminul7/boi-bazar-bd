
-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact message
CREATE POLICY "Anyone can submit contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Admins can view all contact messages
CREATE POLICY "Admins can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update (mark as read)
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete contact messages
CREATE POLICY "Admins can delete contact messages"
  ON public.contact_messages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add social media settings
INSERT INTO public.site_settings (key, value) VALUES 
  ('youtube_url', ''),
  ('instagram_url', '')
ON CONFLICT (key) DO NOTHING;
