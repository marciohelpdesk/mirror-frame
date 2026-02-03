import { useNavigate, useParams } from 'react-router-dom';
import { ExecutionView as ExecutionContent } from '@/views/ExecutionView';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useInventory } from '@/hooks/useInventory';
import { Job, JobStatus } from '@/types';
import { PageLoader } from '@/lib/routes';

export default function Execution() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, updateJob, isLoading: jobsLoading } = useJobs(user?.id);
  const { inventory, isLoading: inventoryLoading } = useInventory(user?.id);

  const isLoading = jobsLoading || inventoryLoading;
  const job = jobs.find(j => j.id === jobId);

  const handleUpdateJob = (updatedJob: Job) => {
    updateJob(updatedJob);
  };

  const handleComplete = (completedJob: Job) => {
    updateJob({
      ...completedJob,
      status: JobStatus.COMPLETED,
      endTime: Date.now()
    });
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
