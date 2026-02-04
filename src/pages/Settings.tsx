import { useNavigate } from 'react-router-dom';
import { SettingsView as SettingsContent } from '@/views/SettingsView';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useEmployees } from '@/hooks/useEmployees';
import { UserProfile, Employee } from '@/types';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, isLoading: profileLoading } = useProfile(user?.id);
  const { employees, addEmployee, deleteEmployee, isLoading: employeesLoading } = useEmployees(user?.id);

  const isLoading = profileLoading || employeesLoading;

  const userProfile: UserProfile = profile || {
    name: user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    phone: '',
    avatar: '',
    role: 'Cleaner',
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleViewFinance = () => {
    navigate('/finance');
  };

  const handleAddEmployee = (employee: Employee) => {
    addEmployee(employee);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    deleteEmployee(employeeId);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    updateProfile(updatedProfile);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <SettingsContent
      userId={user?.id}
      userProfile={userProfile}
      employees={employees}
      onLogout={handleLogout}
      onViewFinance={handleViewFinance}
      onAddEmployee={handleAddEmployee}
      onDeleteEmployee={handleDeleteEmployee}
      onUpdateProfile={handleUpdateProfile}
    />
  );
}
