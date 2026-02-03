import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { AgendaView as AgendaContent } from '@/views/AgendaView';
import { AgendaSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useProperties } from '@/hooks/useProperties';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { Job, JobStatus } from '@/types';

export default function Agenda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties, isLoading: propertiesLoading } = useProperties(user?.id);
  const { jobs, addJob, updateJob, isLoading: jobsLoading } = useJobs(user?.id);
  const { employees, isLoading: employeesLoading } = useEmployees(user?.id);

  const isLoading = propertiesLoading || jobsLoading || employeesLoading;

  const handleStartJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      updateJob({
        ...job,
        status: JobStatus.IN_PROGRESS,
        startTime: Date.now(),
        currentStep: 'BEFORE_PHOTOS'
      });
      navigate(`/execution/${jobId}`);
    }
  };

  const handleViewJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job?.status === JobStatus.IN_PROGRESS) {
      navigate(`/execution/${jobId}`);
    } else {
      navigate(`/jobs/${jobId}`);
    }
  };

  const handleRescheduleJob = (jobId: string, newDate: string, newTime?: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      updateJob({
        ...job,
        date: newDate,
        time: newTime || job.time
      });
    }
  };

  const handleAddJob = (newJob: Job) => {
    addJob(newJob);
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <AgendaSkeleton />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <AgendaContent
        jobs={jobs}
        properties={properties}
        employees={employees}
        onStartJob={handleStartJob}
        onViewJob={handleViewJob}
        onRescheduleJob={handleRescheduleJob}
        onAddJob={handleAddJob}
      />
    </MobileLayout>
  );
}
