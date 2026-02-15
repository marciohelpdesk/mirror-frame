import { useNavigate, useParams } from 'react-router-dom';
import { ExecutionView as ExecutionContent } from '@/views/ExecutionView';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useInventory } from '@/hooks/useInventory';
import { useReports } from '@/hooks/useReports';
import { useProfile } from '@/hooks/useProfile';
import { Job, JobStatus } from '@/types';
import { PageLoader } from '@/lib/routes';

export default function Execution() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, updateJob, isLoading: jobsLoading } = useJobs(user?.id);
  const { inventory, isLoading: inventoryLoading } = useInventory(user?.id);
  const { createReport } = useReports(user?.id);
  const { profile } = useProfile(user?.id);

  const isLoading = jobsLoading || inventoryLoading;
  const job = jobs.find(j => j.id === jobId);

  const handleUpdateJob = (updatedJob: Job) => {
    updateJob(updatedJob);
  };

  const handleComplete = async (completedJob: Job) => {
    const finalJob = {
      ...completedJob,
      status: JobStatus.COMPLETED,
      endTime: Date.now()
    };
    updateJob(finalJob);

    // Auto-generate report
    try {
      const rooms = finalJob.checklist.map((section, i) => ({
        name: section.title,
        room_type: 'other',
        display_order: i,
        checklist: section.items,
        tasks_total: section.items.length,
        tasks_completed: section.items.filter(it => it.completed).length,
        damages: [],
        lost_and_found: [],
      }));

      const photos = [
        ...finalJob.photosBefore.map((url, i) => ({ photo_url: url, photo_type: 'before' as const, display_order: i })),
        ...finalJob.photosAfter.map((url, i) => ({ photo_url: url, photo_type: 'after' as const, display_order: i })),
        ...(finalJob.damages || []).filter(d => d.photoUrl).map((d, i) => ({ photo_url: d.photoUrl!, photo_type: 'damage' as const, display_order: i, caption: d.description })),
        ...(finalJob.lostAndFound || []).filter(l => l.photoUrl).map((l, i) => ({ photo_url: l.photoUrl!, photo_type: 'lost_found' as const, display_order: i, caption: l.description })),
      ];

      const totalTasks = finalJob.checklist.reduce((acc, s) => acc + s.items.length, 0);
      const completedTasks = finalJob.checklist.reduce((acc, s) => acc + s.items.filter(it => it.completed).length, 0);

      await createReport({
        job_id: finalJob.id,
        property_id: finalJob.propertyId || null,
        property_name: finalJob.clientName,
        property_address: finalJob.address,
        service_type: finalJob.type,
        cleaner_name: profile?.name || 'Cleaner',
        cleaning_date: finalJob.date,
        start_time: finalJob.startTime || null,
        end_time: finalJob.endTime || null,
        status: 'draft',
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        total_photos: photos.length,
        notes: finalJob.reportNote || null,
        rooms,
        photos,
      });
    } catch (error) {
      console.error('Auto-report generation failed:', error);
    }

    navigate('/dashboard');
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!job) {
    navigate('/dashboard');
    return null;
  }

  return (
    <>
      <div className="bg-florida-sky-fixed" />
      <div className="min-h-screen relative z-10 md:flex md:items-center md:justify-center">
        <div className="mobile-frame">
          <ExecutionContent
            job={job}
            inventory={inventory}
            userId={user!.id}
            onUpdateJob={handleUpdateJob}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </>
  );
}
