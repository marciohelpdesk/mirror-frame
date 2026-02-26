
-- Drop existing RLS policies on properties
DROP POLICY IF EXISTS "Users can view their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;

-- SELECT: all authenticated users can view all properties
CREATE POLICY "All authenticated can view properties"
ON public.properties FOR SELECT TO authenticated
USING (true);

-- UPDATE: all authenticated users can update any property
CREATE POLICY "All authenticated can update properties"
ON public.properties FOR UPDATE TO authenticated
USING (true);

-- DELETE: only admin emails can delete
CREATE POLICY "Only admins can delete properties"
ON public.properties FOR DELETE TO authenticated
USING (
  auth.jwt()->>'email' IN (
    'kamila13petters@gmail.com',
    'marcioasoliveira@hotmail.com'
  )
);
