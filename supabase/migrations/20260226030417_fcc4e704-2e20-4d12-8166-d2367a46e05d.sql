
-- ============================================
-- PUR CLEANING APP - FULL SCHEMA PROVISION
-- ============================================

-- 1. Enum for roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 3. user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- 4. has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), COALESCE(NEW.email, ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Apartment',
  service_type TEXT NOT NULL DEFAULT 'Turnover',
  status TEXT NOT NULL DEFAULT 'Active',
  photo_url TEXT,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  sqft INTEGER,
  base_price NUMERIC,
  access_code TEXT,
  wifi_password TEXT,
  notes TEXT,
  supplies_location TEXT,
  manual_url TEXT,
  client_email TEXT,
  rooms JSONB,
  checklist_template JSONB,
  last_cleaned TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own properties" ON public.properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own properties" ON public.properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own properties" ON public.properties FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own properties" ON public.properties FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  address TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  checkout_time TEXT,
  checkin_deadline TEXT,
  status TEXT NOT NULL DEFAULT 'Scheduled',
  type TEXT NOT NULL DEFAULT 'Standard',
  price NUMERIC,
  assigned_to TEXT,
  checklist JSONB,
  photos_before TEXT[],
  photos_after TEXT[],
  damages JSONB,
  inventory_used JSONB,
  lost_and_found JSONB,
  start_time BIGINT,
  end_time BIGINT,
  check_in_time TEXT,
  current_step TEXT,
  report_note TEXT,
  report_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own jobs" ON public.jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jobs" ON public.jobs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own employees" ON public.employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own employees" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own employees" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own employees" ON public.employees FOR DELETE USING (auth.uid() = user_id);

-- 10. inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'units',
  threshold INTEGER NOT NULL DEFAULT 5,
  reorder_photo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory" ON public.inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own inventory" ON public.inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own inventory" ON public.inventory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own inventory" ON public.inventory FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON public.inventory
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. cleaning_reports table
CREATE TABLE IF NOT EXISTS public.cleaning_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  property_name TEXT NOT NULL,
  property_address TEXT NOT NULL,
  cleaner_name TEXT NOT NULL DEFAULT '',
  cleaning_date TEXT NOT NULL DEFAULT '',
  service_type TEXT NOT NULL DEFAULT 'Standard',
  status TEXT NOT NULL DEFAULT 'draft',
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  total_photos INTEGER NOT NULL DEFAULT 0,
  start_time BIGINT,
  end_time BIGINT,
  notes TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  public_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.cleaning_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports" ON public.cleaning_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own reports" ON public.cleaning_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own reports" ON public.cleaning_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON public.cleaning_reports FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view reports by token" ON public.cleaning_reports FOR SELECT USING (true);

CREATE TRIGGER update_cleaning_reports_updated_at BEFORE UPDATE ON public.cleaning_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. report_rooms table
CREATE TABLE IF NOT EXISTS public.report_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.cleaning_reports(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT NOT NULL DEFAULT 'general',
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  damages JSONB NOT NULL DEFAULT '[]'::jsonb,
  lost_and_found JSONB NOT NULL DEFAULT '[]'::jsonb,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.report_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage report rooms via report" ON public.report_rooms
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.cleaning_reports WHERE id = report_rooms.report_id AND user_id = auth.uid())
);
CREATE POLICY "Public can view report rooms by report" ON public.report_rooms FOR SELECT USING (true);

-- 13. report_photos table
CREATE TABLE IF NOT EXISTS public.report_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.cleaning_reports(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.report_rooms(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'general',
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.report_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage report photos via report" ON public.report_photos
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.cleaning_reports WHERE id = report_photos.report_id AND user_id = auth.uid())
);
CREATE POLICY "Public can view report photos by report" ON public.report_photos FOR SELECT USING (true);

-- 14. Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON public.properties(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_date ON public.jobs(date);
CREATE INDEX IF NOT EXISTS idx_jobs_property_id ON public.jobs(property_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON public.inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_reports_user_id ON public.cleaning_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_reports_public_token ON public.cleaning_reports(public_token);
CREATE INDEX IF NOT EXISTS idx_report_rooms_report_id ON public.report_rooms(report_id);
CREATE INDEX IF NOT EXISTS idx_report_photos_report_id ON public.report_photos(report_id);

-- 15. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('cleaning-photos', 'cleaning-photos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('report-photos', 'report-photos', true) ON CONFLICT (id) DO NOTHING;

-- 16. Storage policies
CREATE POLICY "Public read cleaning photos" ON storage.objects FOR SELECT USING (bucket_id = 'cleaning-photos');
CREATE POLICY "Auth users upload cleaning photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cleaning-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users update cleaning photos" ON storage.objects FOR UPDATE USING (bucket_id = 'cleaning-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users delete cleaning photos" ON storage.objects FOR DELETE USING (bucket_id = 'cleaning-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Public read report photos" ON storage.objects FOR SELECT USING (bucket_id = 'report-photos');
CREATE POLICY "Auth users upload report photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'report-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users update report photos" ON storage.objects FOR UPDATE USING (bucket_id = 'report-photos' AND auth.role() = 'authenticated');
CREATE POLICY "Auth users delete report photos" ON storage.objects FOR DELETE USING (bucket_id = 'report-photos' AND auth.role() = 'authenticated');
