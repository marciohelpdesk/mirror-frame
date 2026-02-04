import { useNavigate } from 'react-router-dom';
import { DashboardView as DashboardContent } from '@/views/DashboardView';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { useJobs } from '@/hooks/useJobs';
import { UserProfile, JobStatus } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isLoading: profileLoading } = useProfile(user?.id);
  const { properties, isLoading: propertiesLoading } = useProperties(user?.id);
  const { jobs, updateJob, isLoading: jobsLoading } = useJobs(user?.id);

  const isLoading = profileLoading || propertiesLoading || jobsLoading;

  const userProfile: UserProfile = profile || {
    name: user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    phone: '',
    avatar: '',
    role: 'Cleaner',
  };

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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <DashboardContent
      jobs={jobs}
      properties={properties}
      onStartJob={handleStartJob}
      onViewJob={handleViewJob}
      userProfile={userProfile}
    />
  );
}
