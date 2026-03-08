
CREATE POLICY "Admins can delete subscribers" ON public.newsletter_subscribers
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'));
