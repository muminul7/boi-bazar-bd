
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
    RETURN json_build_object('valid', false, 'message', 'কুপন কোড ভুল বা মেয়াদ শেষ');
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
