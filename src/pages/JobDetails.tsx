import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { JobDetailsView as JobDetailsContent } from '@/views/JobDetailsView';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useProperties } from '@/hooks/useProperties';
import { useEmployees } from '@/hooks/useEmployees';
import { Job, JobStatus } from '@/types';
import { PageLoader } from '@/lib/routes';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, updateJob, deleteJob, isLoading: jobsLoading } = useJobs(user?.id);
  const { properties, isLoading: propertiesLoading } = useProperties(user?.id);
  const { employees, isLoading: employeesLoading } = useEmployees(user?.id);

  const isLoading = jobsLoading || propertiesLoading || employeesLoading;
  const job = jobs.find(j => j.id === id);

  const handleBack = () => {
    navigate('/agenda');
  };

  const handleStartJob = (jobId: string) => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (targetJob) {
      updateJob({
        ...targetJob,
        status: JobStatus.IN_PROGRESS,
        startTime: Date.now(),
        currentStep: 'BEFORE_PHOTOS'
      });
      navigate(`/execution/${jobId}`);
    }
  };

  const handleUpdateJob = (updatedJob: Job) => {
    updateJob(updatedJob);
  };

  const handleDeleteJob = (jobId: string) => {
    deleteJob(jobId);
    navigate('/agenda');
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!job) {
    navigate('/agenda');
    return null;
  }

  return (
    <MobileLayout showNav={false}>
      <JobDetailsContent
        job={job}
        properties={properties}
        employees={employees}
        onBack={handleBack}
        onStartJob={handleStartJob}
        onUpdateJob={handleUpdateJob}
        onDeleteJob={handleDeleteJob}
      />
    </MobileLayout>
  );
}
