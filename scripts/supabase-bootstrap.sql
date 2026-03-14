-- Generated bootstrap SQL for a fresh Supabase project
-- Source migrations are concatenated in filename order from supabase/migrations
-- Run this in Supabase SQL Editor on a new project

-- ==================================================
-- Migration: 20260308173909_3451af6c-5416-4484-977a-a63f30362148.sql
-- ==================================================

-- Admin role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT NOT NULL,
  cover_url TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  best_seller BOOLEAN DEFAULT false,
  new_release BOOLEAN DEFAULT false,
  description TEXT,
  short_description TEXT,
  outcomes TEXT[] DEFAULT '{}',
  chapters JSONB DEFAULT '[]',
  suitable_for TEXT[] DEFAULT '{}',
  pages INTEGER DEFAULT 0,
  format TEXT DEFAULT 'PDF',
  language TEXT DEFAULT 'à¦¬à¦¾à¦‚à¦²à¦¾',
  published_date TEXT,
  reviews JSONB DEFAULT '[]',
  faq JSONB DEFAULT '[]',
  file_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Books are viewable by everyone" ON public.books
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert books" ON public.books
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update books" ON public.books
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete books" ON public.books
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES public.books(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  billing_address TEXT,
  amount INTEGER NOT NULL,
  discount INTEGER DEFAULT 0,
  coupon_code TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  download_token TEXT UNIQUE,
  download_count INTEGER DEFAULT 0,
  max_downloads INTEGER DEFAULT 3,
  download_expires_at TIMESTAMPTZ,
  delivery_email_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can create orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active coupons" ON public.coupons
  FOR SELECT USING (active = true);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for ebook files
INSERT INTO storage.buckets (id, name, public) VALUES ('ebooks', 'ebooks', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true);

CREATE POLICY "Anyone can view book covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-covers');
CREATE POLICY "Admins can upload book covers" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'book-covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can upload ebooks" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view ebooks" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'ebooks' AND public.has_role(auth.uid(), 'admin'));

-- ==================================================
-- Migration: 20260308173929_73ff1c45-0b22-427d-bdd0-95e300aca673.sql
-- ==================================================

-- Fix: drop the duplicate/permissive coupon SELECT and make the public one more specific
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;
CREATE POLICY "Anyone can validate coupons" ON public.coupons
  FOR SELECT USING (active = true AND (expires_at IS NULL OR expires_at > now()) AND (max_uses IS NULL OR used_count < max_uses));

-- ==================================================
-- Migration: 20260308185450_97304fcf-c2ce-48b2-aa45-696e5a627a83.sql
-- ==================================================

-- Drop the old open INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create restricted INSERT policy: only allow pending payment_status
CREATE POLICY "Anyone can create orders with pending status"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (payment_status = 'pending');

-- ==================================================
-- Migration: 20260308185654_9495fad1-f096-4e79-94c0-4059d1930849.sql
-- ==================================================

-- FIX 1: Hide file_url from public access using column-level privileges
-- Revoke SELECT on file_url from anon and authenticated roles
REVOKE SELECT (file_url) ON public.books FROM anon;
REVOKE SELECT (file_url) ON public.books FROM authenticated;

-- FIX 2: Create a secure coupon validation RPC function
CREATE OR REPLACE FUNCTION public.validate_coupon(_code text, _book_price integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _coupon record;
  _discount integer;
BEGIN
  SELECT * INTO _coupon FROM public.coupons
  WHERE code = upper(_code)
    AND active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR used_count < max_uses);

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'message', 'à¦•à§à¦ªà¦¨ à¦•à§‹à¦¡ à¦­à§à¦² à¦¬à¦¾ à¦®à§‡à¦¯à¦¼à¦¾à¦¦ à¦¶à§‡à¦·');
  END IF;

  IF _coupon.discount_type = 'percentage' THEN
    _discount := round((_book_price * _coupon.discount_value) / 100.0);
  ELSE
    _discount := _coupon.discount_value;
  END IF;

  _discount := LEAST(_discount, _book_price);

  RETURN json_build_object(
    'valid', true,
    'discount', _discount,
    'discount_type', _coupon.discount_type,
    'discount_value', _coupon.discount_value
  );
END;
$$;

-- Remove the public SELECT policy on coupons (keep admin policy)
DROP POLICY IF EXISTS "Anyone can validate coupons" ON public.coupons;

-- ==================================================
-- Migration: 20260308185957_b2e50ef5-ff04-4653-8f6c-5b94cb57d81b.sql
-- ==================================================

-- Create a separate table for book files, only accessible by admins and service role
CREATE TABLE IF NOT EXISTS public.book_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(book_id)
);

ALTER TABLE public.book_files ENABLE ROW LEVEL SECURITY;

-- Only admins can read/manage book files
CREATE POLICY "Admins can manage book files"
ON public.book_files
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Migrate existing file_url data
INSERT INTO public.book_files (book_id, file_url)
SELECT id, file_url FROM public.books WHERE file_url IS NOT NULL AND file_url != ''
ON CONFLICT (book_id) DO NOTHING;

-- Remove file_url from books table
ALTER TABLE public.books DROP COLUMN IF EXISTS file_url;

-- Re-grant SELECT on books to anon (the revoke may have affected it)
GRANT SELECT ON public.books TO anon;
GRANT SELECT ON public.books TO authenticated;

-- ==================================================
-- Migration: 20260308190354_3ccd7f9e-1408-46c5-91d4-8f72245cf902.sql
-- ==================================================

-- Fix RESTRICTIVE policies to PERMISSIVE

-- Books
DROP POLICY IF EXISTS "Books are viewable by everyone" ON public.books;
CREATE POLICY "Books are viewable by everyone" ON public.books FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert books" ON public.books;
CREATE POLICY "Admins can insert books" ON public.books FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update books" ON public.books;
CREATE POLICY "Admins can update books" ON public.books FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete books" ON public.books;
CREATE POLICY "Admins can delete books" ON public.books FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Orders
DROP POLICY IF EXISTS "Anyone can create orders with pending status" ON public.orders;
CREATE POLICY "Anyone can create orders with pending status" ON public.orders FOR INSERT WITH CHECK (payment_status = 'pending');

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Book files
DROP POLICY IF EXISTS "Admins can manage book files" ON public.book_files;
CREATE POLICY "Admins can manage book files" ON public.book_files FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ==================================================
-- Migration: 20260308201052_013b1673-30e4-43e0-a879-64fb005179d7.sql
-- ==================================================

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Admins can view subscribers
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ==================================================
-- Migration: 20260308201356_ec7177d4-0ccf-45b9-8274-1f891f62b48a.sql
-- ==================================================

CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- ==================================================
-- Migration: 20260308202055_e0806f34-973f-4ddc-9ea7-bc090436eb66.sql
-- ==================================================

CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read settings" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

-- ==================================================
-- Migration: 20260308203436_b22e10d5-e595-472a-9dc1-d62cb078b2e4.sql
-- ==================================================

CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  rating integer NOT NULL DEFAULT 5,
  text text NOT NULL,
  avatar text,
  active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active testimonials"
  ON public.testimonials FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==================================================
-- Migration: 20260308205954_9e235612-82f7-4702-837b-ce902151c239.sql
-- ==================================================

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

-- ==================================================
-- Optional: grant admin role to an existing auth user
-- Requires the auth user to already exist in Authentication -> Users
-- ==================================================
insert into public.user_roles (user_id, role)
select id, 'admin'::public.app_role
from auth.users
where email = 'admin@gmail.com'
on conflict (user_id, role) do nothing;
