import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CleaningReport {
  id: string;
  user_id: string;
  job_id: string | null;
  property_id: string | null;
  public_token: string;
  property_name: string;
  property_address: string;
  service_type: string;
  cleaner_name: string;
  cleaning_date: string;
  start_time: number | null;
  end_time: number | null;
  status: 'draft' | 'published' | 'archived';
  total_tasks: number;
  completed_tasks: number;
  total_photos: number;
  notes: string | null;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface ReportRoom {
  id: string;
  report_id: string;
  name: string;
  room_type: string;
  display_order: number;
  checklist: any[];
  tasks_total: number;
  tasks_completed: number;
  damages: any[];
  lost_and_found: any[];
  created_at: string;
}

export interface ReportPhoto {
  id: string;
  report_id: string;
  room_id: string | null;
  photo_url: string;
  photo_type: 'before' | 'after' | 'damage' | 'lost_found' | 'verification';
  caption: string | null;
  display_order: number;
  created_at: string;
}

export const useReports = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['reports', userId],
    queryFn: async (): Promise<CleaningReport[]> => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('cleaning_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CleaningReport[];
    },
    enabled: !!userId,
  });

  const createReport = useMutation({
    mutationFn: async (report: Partial<CleaningReport> & { rooms?: (Partial<ReportRoom> & { _room_index?: number })[]; photos?: (Partial<ReportPhoto> & { _room_index?: number })[] }) => {
      if (!userId) throw new Error('No user ID');
      
      const { rooms, photos, ...reportData } = report;
      
      // Create report
      const { data: newReport, error } = await supabase
        .from('cleaning_reports')
        .insert({ ...reportData, user_id: userId } as any)
        .select()
        .single();
      if (error) throw error;

      // Create rooms and capture generated IDs
      let roomIndexToId: Record<number, string> = {};
      if (rooms && rooms.length > 0) {
        const roomsData = rooms.map((r, i) => {
          const { _room_index, ...roomFields } = r as any;
          return {
            ...roomFields,
            report_id: newReport.id,
            display_order: i,
          };
        });
        const { data: createdRooms, error: roomErr } = await supabase
          .from('report_rooms')
          .insert(roomsData as any)
          .select('id, display_order');
        if (roomErr) {
          console.error('Error creating rooms:', roomErr);
        } else if (createdRooms) {
          createdRooms.forEach((cr: any) => {
            roomIndexToId[cr.display_order] = cr.id;
          });
        }
      }

      // Create photos with correct room_id mapping
      if (photos && photos.length > 0) {
        const photosData = photos.map((p, i) => {
          const { _room_index, ...photoFields } = p as any;
          return {
            ...photoFields,
            report_id: newReport.id,
            display_order: photoFields.display_order ?? i,
            room_id: _room_index !== undefined ? (roomIndexToId[_room_index] || null) : (photoFields.room_id || null),
          };
        });
        const { error: photoErr } = await supabase
          .from('report_photos')
          .insert(photosData as any);
        if (photoErr) console.error('Error creating photos:', photoErr);
      }

      return newReport as CleaningReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', userId] });
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CleaningReport> & { id: string }) => {
      const { error } = await supabase
        .from('cleaning_reports')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', userId] });
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cleaning_reports')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', userId] });
    },
  });

  return {
    reports: query.data || [],
    isLoading: query.isLoading,
    createReport: createReport.mutateAsync,
    updateReport: updateReport.mutate,
    deleteReport: deleteReport.mutate,
    isCreating: createReport.isPending,
  };
};

// Hook for public report viewer (no auth needed)
export const usePublicReport = (token: string | undefined) => {
  const reportQuery = useQuery({
    queryKey: ['public-report', token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase
        .from('cleaning_reports')
        .select('*')
        .eq('public_token', token)
        .eq('status', 'published')
        .maybeSingle();
      if (error) throw error;
      return data as CleaningReport | null;
    },
    enabled: !!token,
  });

  const roomsQuery = useQuery({
    queryKey: ['public-report-rooms', reportQuery.data?.id],
    queryFn: async () => {
      if (!reportQuery.data?.id) return [];
      const { data, error } = await supabase
        .from('report_rooms')
        .select('*')
        .eq('report_id', reportQuery.data.id)
        .order('display_order');
      if (error) throw error;
      return data as ReportRoom[];
    },
    enabled: !!reportQuery.data?.id,
  });

  const photosQuery = useQuery({
    queryKey: ['public-report-photos', reportQuery.data?.id],
    queryFn: async () => {
      if (!reportQuery.data?.id) return [];
      const { data, error } = await supabase
        .from('report_photos')
        .select('*')
        .eq('report_id', reportQuery.data.id)
        .order('display_order');
      if (error) throw error;
      return data as ReportPhoto[];
    },
    enabled: !!reportQuery.data?.id,
  });

  return {
    report: reportQuery.data,
    rooms: roomsQuery.data || [],
    photos: photosQuery.data || [],
    isLoading: reportQuery.isLoading || roomsQuery.isLoading || photosQuery.isLoading,
    error: reportQuery.error,
  };
};
