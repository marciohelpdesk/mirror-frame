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
      // Distribute damages and lost&found across rooms (first room gets unmatched items)
      const allDamages = finalJob.damages || [];
      const allLostFound = finalJob.lostAndFound || [];

      const rooms = finalJob.checklist.map((section, i) => {
        const sectionTitle = section.title.toLowerCase();
        const sectionDamages = allDamages.filter(d => 
          d.description?.toLowerCase().includes(sectionTitle)
        );
        const sectionLostFound = allLostFound.filter(l => 
          l.location?.toLowerCase().includes(sectionTitle) ||
          l.description?.toLowerCase().includes(sectionTitle)
        );
        return {
          name: section.title,
          room_type: 'other',
          display_order: i,
          checklist: section.items,
          tasks_total: section.items.length,
          tasks_completed: section.items.filter(it => it.completed).length,
          damages: i === 0 
            ? [...sectionDamages, ...allDamages.filter(d => !finalJob.checklist.some(s => {
                const t = s.title.toLowerCase();
                return d.description?.toLowerCase().includes(t);
              }))]
            : sectionDamages,
          lost_and_found: i === 0 
            ? [...sectionLostFound, ...allLostFound.filter(l => !finalJob.checklist.some(s => {
                const t = s.title.toLowerCase();
                return l.location?.toLowerCase().includes(t) || l.description?.toLowerCase().includes(t);
              }))]
            : sectionLostFound,
        };
      });

      // Collect all photos including room-specific photos with _room_index
      const photos = [
        ...finalJob.photosBefore.map((url, i) => ({ photo_url: url, photo_type: 'before' as const, display_order: i })),
        ...finalJob.photosAfter.map((url, i) => ({ photo_url: url, photo_type: 'after' as const, display_order: i })),
        ...(finalJob.damages || []).filter(d => d.photoUrl).map((d, i) => ({ photo_url: d.photoUrl!, photo_type: 'damage' as const, display_order: i, caption: d.description })),
        ...(finalJob.lostAndFound || []).filter(l => l.photoUrl).map((l, i) => ({ photo_url: l.photoUrl!, photo_type: 'lost_found' as const, display_order: i, caption: l.description })),
        // Room-specific photos from checklist sections
        ...finalJob.checklist.flatMap((section, sIdx) => {
          const roomPhotos = (section as any).roomPhotos || [];
          return roomPhotos.map((url: string, pIdx: number) => ({
            photo_url: url,
            photo_type: 'verification' as const,
            display_order: pIdx,
            caption: section.title,
            _room_index: sIdx,
          }));
        }),
        // Checklist item verification photos
        ...finalJob.checklist.flatMap((section, sIdx) =>
          section.items
            .filter(item => item.photoUrl)
            .map((item, idx) => ({
              photo_url: item.photoUrl!,
              photo_type: 'verification' as const,
              display_order: idx,
              caption: `${section.title}: ${item.label}`,
              _room_index: sIdx,
            }))
        ),
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
        status: 'published',
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
