
-- Drop the old open INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create restricted INSERT policy: only allow pending payment_status
CREATE POLICY "Anyone can create orders with pending status"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (payment_status = 'pending');
