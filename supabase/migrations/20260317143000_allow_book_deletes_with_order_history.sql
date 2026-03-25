ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_book_id_fkey;

ALTER TABLE public.orders
ADD CONSTRAINT orders_book_id_fkey
FOREIGN KEY (book_id)
REFERENCES public.books(id)
ON DELETE SET NULL;
