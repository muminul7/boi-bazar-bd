
-- Fix: drop the duplicate/permissive coupon SELECT and make the public one more specific
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;
CREATE POLICY "Anyone can validate coupons" ON public.coupons
  FOR SELECT USING (active = true AND (expires_at IS NULL OR expires_at > now()) AND (max_uses IS NULL OR used_count < max_uses));
