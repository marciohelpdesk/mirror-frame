
-- cleaning_reports: drop restrictive, create permissive
DROP POLICY IF EXISTS "Public can view reports by token" ON cleaning_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON cleaning_reports;
CREATE POLICY "Users can view own reports" ON cleaning_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Public can view published reports" ON cleaning_reports FOR SELECT TO anon USING (status = 'published');

-- report_rooms: drop restrictive, create permissive
DROP POLICY IF EXISTS "Public can view report rooms by report" ON report_rooms;
CREATE POLICY "Public can view report rooms" ON report_rooms FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM cleaning_reports WHERE id = report_rooms.report_id AND status = 'published')
);

-- report_photos: drop restrictive, create permissive
DROP POLICY IF EXISTS "Public can view report photos by report" ON report_photos;
CREATE POLICY "Public can view report photos" ON report_photos FOR SELECT TO anon USING (
  EXISTS (SELECT 1 FROM cleaning_reports WHERE id = report_photos.report_id AND status = 'published')
);
