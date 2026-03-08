
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
