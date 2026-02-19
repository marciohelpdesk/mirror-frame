
-- Fix cleaning_reports: Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Public can view published reports by token" ON public.cleaning_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.cleaning_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.cleaning_reports;
DROP POLICY IF EXISTS "Users can insert their own reports" ON public.cleaning_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.cleaning_reports;

-- Recreate as PERMISSIVE (default)
CREATE POLICY "Public can view published reports by token"
ON public.cleaning_reports FOR SELECT
TO anon, authenticated
USING (status = 'published');

CREATE POLICY "Users can view their own reports"
ON public.cleaning_reports FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
ON public.cleaning_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
ON public.cleaning_reports FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
ON public.cleaning_reports FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fix report_rooms
DROP POLICY IF EXISTS "Public can view published report rooms" ON public.report_rooms;
DROP POLICY IF EXISTS "Users can manage their report rooms" ON public.report_rooms;

CREATE POLICY "Public can view published report rooms"
ON public.report_rooms FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM cleaning_reports
  WHERE cleaning_reports.id = report_rooms.report_id
  AND cleaning_reports.status = 'published'
));

CREATE POLICY "Users can manage their report rooms"
ON public.report_rooms FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM cleaning_reports
  WHERE cleaning_reports.id = report_rooms.report_id
  AND cleaning_reports.user_id = auth.uid()
));

-- Fix report_photos
DROP POLICY IF EXISTS "Public can view published report photos" ON public.report_photos;
DROP POLICY IF EXISTS "Users can manage their report photos" ON public.report_photos;

CREATE POLICY "Public can view published report photos"
ON public.report_photos FOR SELECT
TO anon, authenticated
USING (EXISTS (
  SELECT 1 FROM cleaning_reports
  WHERE cleaning_reports.id = report_photos.report_id
  AND cleaning_reports.status = 'published'
));

CREATE POLICY "Users can manage their report photos"
ON public.report_photos FOR ALL
TO authenticated
USING (EXISTS (
  SELECT 1 FROM cleaning_reports
  WHERE cleaning_reports.id = report_photos.report_id
  AND cleaning_reports.user_id = auth.uid()
));
