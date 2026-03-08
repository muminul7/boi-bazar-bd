
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
