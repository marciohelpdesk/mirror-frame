import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { FinanceView as FinanceContent } from '@/views/FinanceView';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { PageLoader } from '@/lib/routes';

export default function Finance() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { jobs, isLoading } = useJobs(user?.id);

  const handleBack = () => {
    navigate('/settings');
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <MobileLayout showNav={false}>
      <FinanceContent
        jobs={jobs}
        onBack={handleBack}
      />
    </MobileLayout>
  );
}
