import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Job, JobStatus, ChecklistSection, DamageReport, InventoryUsage, LostAndFoundItem, ExecutionStep } from '@/types';
import { Json } from '@/integrations/supabase/types';

interface DbJob {
  id: string;
  user_id: string;
  property_id: string | null;
  client_name: string;
  address: string;
  date: string;
  time: string;
  checkout_time: string | null;
  checkin_deadline: string | null;
  status: string;
  type: string;
  price: number | null;
  checklist: Json;
  start_time: number | null;
  end_time: number | null;
  assigned_to: string | null;
  check_in_time: string | null;
  current_step: string | null;
  photos_before: string[] | null;
  photos_after: string[] | null;
  report_note: string | null;
  report_pdf_url: string | null;
  damages: Json;
  inventory_used: Json;
  lost_and_found: Json;
  created_at: string;
  updated_at: string;
}

const mapDbToJob = (db: DbJob): Job => ({
  id: db.id,
  propertyId: db.property_id || undefined,
  clientName: db.client_name,
  address: db.address,
  date: db.date,
  time: db.time,
  checkoutTime: db.checkout_time || undefined,
  checkinDeadline: db.checkin_deadline || undefined,
  status: db.status as JobStatus,
  type: db.type as Job['type'],
  price: db.price || undefined,
  checklist: (db.checklist as unknown as ChecklistSection[]) || [],
  startTime: db.start_time || undefined,
  endTime: db.end_time || undefined,
  assignedTo: db.assigned_to || undefined,
  checkInTime: db.check_in_time || undefined,
  currentStep: db.current_step as ExecutionStep | undefined,
  photosBefore: db.photos_before || [],
  photosAfter: db.photos_after || [],
  reportNote: db.report_note || undefined,
  reportPdfUrl: db.report_pdf_url || undefined,
  damages: (db.damages as unknown as DamageReport[]) || [],
  inventoryUsed: (db.inventory_used as unknown as InventoryUsage[]) || [],
  lostAndFound: (db.lost_and_found as unknown as LostAndFoundItem[]) || [],
});

const mapJobToDb = (job: Partial<Job>, userId: string): Partial<DbJob> => ({
  user_id: userId,
  property_id: job.propertyId || null,
  client_name: job.clientName,
  address: job.address,
  date: job.date,
  time: job.time,
  checkout_time: job.checkoutTime || null,
  checkin_deadline: job.checkinDeadline || null,
  status: job.status,
  type: job.type,
  price: job.price || null,
  checklist: (job.checklist || []) as unknown as Json,
  start_time: job.startTime || null,
  end_time: job.endTime || null,
  assigned_to: job.assignedTo || null,
  check_in_time: job.checkInTime || null,
  current_step: job.currentStep || null,
  photos_before: job.photosBefore || [],
  photos_after: job.photosAfter || [],
  report_note: job.reportNote || null,
  report_pdf_url: job.reportPdfUrl || null,
  damages: (job.damages || []) as unknown as Json,
  inventory_used: (job.inventoryUsed || []) as unknown as Json,
  lost_and_found: (job.lostAndFound || []) as unknown as Json,
});

export const useJobs = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['jobs', userId],
    queryFn: async (): Promise<Job[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });
      
      if (error) throw error;
      return (data as DbJob[]).map(mapDbToJob);
    },
    enabled: !!userId,
  });

  const addJob = useMutation({
    mutationFn: async (job: Omit<Job, 'id'>) => {
      if (!userId) throw new Error('No user ID');
      
      const dbData = mapJobToDb(job, userId);
      const { data, error } = await supabase
        .from('jobs')
        .insert(dbData as any)
        .select()
        .single();
      
      if (error) throw error;
      return mapDbToJob(data as DbJob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', userId] });
    },
  });

  const updateJob = useMutation({
    mutationFn: async (job: Job) => {
      if (!userId) throw new Error('No user ID');
      
      const { id, ...rest } = job;
      const dbData = mapJobToDb(rest, userId);
      
      const { error } = await supabase
        .from('jobs')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', userId] });
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (jobId: string) => {
      if (!userId) throw new Error('No user ID');
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs', userId] });
    },
  });

  return {
    jobs: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    addJob: addJob.mutate,
    updateJob: updateJob.mutate,
    deleteJob: deleteJob.mutate,
    isAdding: addJob.isPending,
    isUpdating: updateJob.isPending,
    isDeleting: deleteJob.isPending,
  };
};
