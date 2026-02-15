
-- Create storage bucket for report photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for report-photos bucket
CREATE POLICY "Authenticated users can upload report photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Report photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-photos');

CREATE POLICY "Users can delete their own report photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'report-photos' AND auth.role() = 'authenticated');

-- Main cleaning reports table
CREATE TABLE public.cleaning_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  
  -- Public access
  public_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex') UNIQUE,
  
  -- Report metadata
  property_name TEXT NOT NULL,
  property_address TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'House Cleaning',
  cleaner_name TEXT NOT NULL DEFAULT '',
  
  -- Timing
  cleaning_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time BIGINT,
  end_time BIGINT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- draft, published, archived
  
  -- Summary stats
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  total_photos INTEGER NOT NULL DEFAULT 0,
  
  -- Notes
  notes TEXT,
  
  -- Language preference for public view
  language TEXT NOT NULL DEFAULT 'en',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Report rooms/environments  
CREATE TABLE public.report_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.cleaning_reports(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL, -- Kitchen, Bathroom, etc.
  room_type TEXT NOT NULL DEFAULT 'other',
  display_order INTEGER NOT NULL DEFAULT 0,
  
  -- Checklist for this room
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  tasks_total INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  
  -- Issues found
  damages JSONB NOT NULL DEFAULT '[]'::jsonb,
  lost_and_found JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Report photos
CREATE TABLE public.report_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.cleaning_reports(id) ON DELETE CASCADE,
  room_id UUID REFERENCES public.report_rooms(id) ON DELETE CASCADE,
  
  photo_url TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'after', -- before, after, damage, lost_found, verification
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cleaning_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_photos ENABLE ROW LEVEL SECURITY;

-- RLS for cleaning_reports
CREATE POLICY "Users can view their own reports"
ON public.cleaning_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
ON public.cleaning_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
ON public.cleaning_reports FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
ON public.cleaning_reports FOR DELETE
USING (auth.uid() = user_id);

-- Public access via token (anon can read published reports)
CREATE POLICY "Public can view published reports by token"
ON public.cleaning_reports FOR SELECT
USING (status = 'published');

-- RLS for report_rooms - access through report ownership or public token
CREATE POLICY "Users can manage their report rooms"
ON public.report_rooms FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cleaning_reports 
    WHERE id = report_rooms.report_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published report rooms"
ON public.report_rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cleaning_reports 
    WHERE id = report_rooms.report_id AND status = 'published'
  )
);

-- RLS for report_photos
CREATE POLICY "Users can manage their report photos"
ON public.report_photos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.cleaning_reports 
    WHERE id = report_photos.report_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Public can view published report photos"
ON public.report_photos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.cleaning_reports 
    WHERE id = report_photos.report_id AND status = 'published'
  )
);

-- Indexes
CREATE INDEX idx_cleaning_reports_user_id ON public.cleaning_reports(user_id);
CREATE INDEX idx_cleaning_reports_public_token ON public.cleaning_reports(public_token);
CREATE INDEX idx_cleaning_reports_job_id ON public.cleaning_reports(job_id);
CREATE INDEX idx_report_rooms_report_id ON public.report_rooms(report_id);
CREATE INDEX idx_report_photos_report_id ON public.report_photos(report_id);
CREATE INDEX idx_report_photos_room_id ON public.report_photos(room_id);

-- Updated_at trigger
CREATE TRIGGER update_cleaning_reports_updated_at
BEFORE UPDATE ON public.cleaning_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
