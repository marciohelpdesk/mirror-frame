import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Job, Property, UserProfile, ViewState, JobStatus, Employee, InventoryItem } from '@/types';
import { BottomNav } from '@/components/BottomNav';
import { DashboardView } from '@/views/DashboardView';
import { AgendaView } from '@/views/AgendaView';
import { PropertiesView } from '@/views/PropertiesView';
import { SettingsView } from '@/views/SettingsView';
import { LoginView } from '@/views/LoginView';
import { ResetPasswordView } from '@/views/ResetPasswordView';
import { PropertyDetailsView } from '@/views/PropertyDetailsView';
import { JobDetailsView } from '@/views/JobDetailsView';
import { ExecutionView } from '@/views/ExecutionView';
import { FinanceView } from '@/views/FinanceView';
import { PageTransition, getTransitionDirection } from '@/components/PageTransition';
import { DashboardSkeleton, AgendaSkeleton, PropertiesSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useProperties } from '@/hooks/useProperties';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { useInventory } from '@/hooks/useInventory';

const Index = () => {
  // Auth State
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);
  
  // Check if we're on the reset password page
  useEffect(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    // Check for reset password route or recovery token in hash
    if (path === '/reset-password' || hash.includes('type=recovery')) {
      setIsResetPasswordMode(true);
    }
  }, []);
  
  // Data from Supabase
  const { profile, updateProfile, isLoading: profileLoading } = useProfile(user?.id);
  const { properties, addProperty, updateProperty, deleteProperty, isLoading: propertiesLoading } = useProperties(user?.id);
  const { jobs, addJob, updateJob, deleteJob, isLoading: jobsLoading } = useJobs(user?.id);
  const { employees, addEmployee, deleteEmployee, isLoading: employeesLoading } = useEmployees(user?.id);
  const { inventory, isLoading: inventoryLoading } = useInventory(user?.id);
  
  // App State
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const previousViewRef = useRef<ViewState>('DASHBOARD');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  // Convert inventory items to the expected format
  const inventoryItems: InventoryItem[] = inventory;

  // Create default user profile if not loaded
  const userProfile: UserProfile = profile || {
    name: user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    phone: '',
    avatar: '',
    role: 'Cleaner',
  };

  // Auth Handlers
  const handleSignIn = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);
    setAuthError('');
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setAuthError(error.message);
    }
    setIsAuthenticating(false);
  }, [signIn]);

  const handleSignUp = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);
    setAuthError('');
    
    const { error } = await signUp(email, password);
    
    if (error) {
      setAuthError(error.message);
    } else {
      setAuthError('Check your email to confirm your account!');
    }
    setIsAuthenticating(false);
  }, [signUp]);

  const handleLogout = useCallback(async () => {
    await signOut();
    setView('DASHBOARD');
  }, [signOut]);

  // Job Handlers
  const startJob = useCallback((jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      updateJob({
        ...job,
        status: JobStatus.IN_PROGRESS,
        startTime: Date.now(),
        currentStep: 'BEFORE_PHOTOS'
      });
      setActiveJobId(jobId);
      setView('EXECUTION');
    }
  }, [jobs, updateJob]);

  const viewJob = useCallback((jobId: string) => {
    setActiveJobId(jobId);
    const job = jobs.find(j => j.id === jobId);
    if (job?.status === JobStatus.IN_PROGRESS) {
      setView('EXECUTION');
    } else {
      setView('JOB_DETAILS');
    }
  }, [jobs]);

  const handleUpdateJob = useCallback((updatedJob: Job) => {
    updateJob(updatedJob);
  }, [updateJob]);

  const rescheduleJob = useCallback((jobId: string, newDate: string, newTime?: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      updateJob({
        ...job,
        date: newDate,
        time: newTime || job.time
      });
    }
  }, [jobs, updateJob]);

  const completeJob = useCallback((completedJob: Job) => {
    updateJob({
      ...completedJob,
      status: JobStatus.COMPLETED,
      endTime: Date.now()
    });
    setActiveJobId(null);
    setView('DASHBOARD');
  }, [updateJob]);

  const cancelExecution = useCallback(() => {
    setActiveJobId(null);
    setView('DASHBOARD');
  }, []);

  // Property Handlers
  const viewProperty = useCallback((propertyId: string) => {
    setActivePropertyId(propertyId);
    setView('PROPERTY_DETAILS');
  }, []);

  const handleUpdateProperty = useCallback((updatedProperty: Property) => {
    updateProperty(updatedProperty);
  }, [updateProperty]);

  const handleAddProperty = useCallback((newProperty: Property) => {
    addProperty(newProperty);
  }, [addProperty]);

  const handleAddJob = useCallback((newJob: Job) => {
    addJob(newJob);
  }, [addJob]);

  const handleDeleteJob = useCallback((jobId: string) => {
    deleteJob(jobId);
    setActiveJobId(null);
    setView('AGENDA');
  }, [deleteJob]);

  const handleDeleteProperty = useCallback((propertyId: string) => {
    deleteProperty(propertyId);
    setActivePropertyId(null);
    setView('PROPERTIES');
  }, [deleteProperty]);

  // Employee Handlers
  const handleAddEmployee = useCallback((employee: Employee) => {
    addEmployee(employee);
  }, [addEmployee]);

  const handleDeleteEmployee = useCallback((employeeId: string) => {
    deleteEmployee(employeeId);
    // Unassign from any jobs - this should be handled by update mutation
    jobs.forEach(job => {
      if (job.assignedTo === employeeId) {
        updateJob({ ...job, assignedTo: undefined });
      }
    });
  }, [deleteEmployee, jobs, updateJob]);

  // Profile Handler
  const handleUpdateProfile = useCallback((updatedProfile: UserProfile) => {
    updateProfile(updatedProfile);
  }, [updateProfile]);

  // Navigation Handler
  const handleNavigate = useCallback((newView: ViewState) => {
    previousViewRef.current = view;
    setView(newView);
  }, [view]);

  const activeProperty = properties.find(p => p.id === activePropertyId);
  const activeJob = jobs.find(j => j.id === activeJobId);

  // Handler for password reset completion
  const handlePasswordResetComplete = useCallback(() => {
    setIsResetPasswordMode(false);
    window.history.replaceState({}, '', '/');
  }, []);

  // Show loading state
  if (authLoading) {
    return (
      <>
        <div className="bg-florida-sky-fixed" />
        <div className="min-h-screen relative z-10 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  // Show Reset Password view if in reset mode
  if (isResetPasswordMode) {
    return (
      <>
        <div className="bg-florida-sky-fixed" />
        <div className="min-h-screen relative z-10 md:flex md:items-center md:justify-center">
          <ResetPasswordView onPasswordReset={handlePasswordResetComplete} />
        </div>
      </>
    );
  }

  // Render Login if not authenticated
  if (!user) {
    return (
      <>
        <div className="bg-florida-sky-fixed" />
        <div className="min-h-screen relative z-10 md:flex md:items-center md:justify-center">
          <LoginView 
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            isLoading={isAuthenticating}
            error={authError}
          />
        </div>
      </>
    );
  }

  // Show loading state while fetching data
  const isDataLoading = profileLoading || propertiesLoading || jobsLoading || employeesLoading || inventoryLoading;

  // Main App View
  return (
    <>
      <div className="bg-florida-sky-fixed" />
      <div className="min-h-screen relative z-10 md:flex md:items-center md:justify-center">
      <div className="mobile-frame">
        {/* Skeleton Loading States */}
        {isDataLoading && (
          <div className="absolute inset-0 z-40">
            {(view === 'DASHBOARD' || !view) && <DashboardSkeleton />}
            {view === 'AGENDA' && <AgendaSkeleton />}
            {view === 'PROPERTIES' && <PropertiesSkeleton />}
            {view === 'SETTINGS' && <DashboardSkeleton />}
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {!isDataLoading && view === 'DASHBOARD' && (
            <PageTransition
              key="dashboard"
              direction={getTransitionDirection('DASHBOARD', previousViewRef.current)}
              className="h-full"
            >
              <DashboardView 
                jobs={jobs}
                properties={properties}
                onStartJob={startJob}
                onViewJob={viewJob}
                userProfile={userProfile}
              />
            </PageTransition>
          )}
          
          {!isDataLoading && view === 'AGENDA' && (
            <PageTransition
              key="agenda"
              direction={getTransitionDirection('AGENDA', previousViewRef.current)}
              className="h-full"
            >
              <AgendaView 
                jobs={jobs}
                properties={properties}
                employees={employees}
                onStartJob={startJob}
                onViewJob={viewJob}
                onRescheduleJob={rescheduleJob}
                onAddJob={handleAddJob}
              />
            </PageTransition>
          )}
          
          {!isDataLoading && view === 'PROPERTIES' && (
            <PageTransition
              key="properties"
              direction={getTransitionDirection('PROPERTIES', previousViewRef.current)}
              className="h-full"
            >
              <PropertiesView 
                properties={properties}
                onViewProperty={viewProperty}
                onAddProperty={handleAddProperty}
              />
            </PageTransition>
          )}
          
          {view === 'PROPERTY_DETAILS' && activeProperty && (
            <PageTransition
              key="property-details"
              direction="right"
              className="h-full"
            >
              <PropertyDetailsView 
                property={activeProperty}
                onBack={() => handleNavigate('PROPERTIES')}
                onUpdate={handleUpdateProperty}
                onDelete={handleDeleteProperty}
              />
            </PageTransition>
          )}

          {view === 'JOB_DETAILS' && activeJob && (
            <PageTransition
              key="job-details"
              direction="right"
              className="h-full"
            >
              <JobDetailsView 
                job={activeJob}
                properties={properties}
                employees={employees}
                onBack={() => handleNavigate('AGENDA')}
                onStartJob={startJob}
                onUpdateJob={handleUpdateJob}
                onDeleteJob={handleDeleteJob}
              />
            </PageTransition>
          )}

          {view === 'EXECUTION' && activeJob && (
            <PageTransition
              key="execution"
              direction="scale"
              className="h-full"
            >
              <ExecutionView
                job={activeJob}
                inventory={inventoryItems}
                userId={user!.id}
                onUpdateJob={handleUpdateJob}
                onComplete={completeJob}
                onCancel={cancelExecution}
              />
            </PageTransition>
          )}
          
          {!isDataLoading && view === 'SETTINGS' && (
            <PageTransition
              key="settings"
              direction={getTransitionDirection('SETTINGS', previousViewRef.current)}
              className="h-full"
            >
              <SettingsView 
                userId={user?.id}
                userProfile={userProfile}
                employees={employees}
                onLogout={handleLogout}
                onViewFinance={() => handleNavigate('FINANCE')}
                onAddEmployee={handleAddEmployee}
                onDeleteEmployee={handleDeleteEmployee}
                onUpdateProfile={handleUpdateProfile}
              />
            </PageTransition>
          )}

          {view === 'FINANCE' && (
            <PageTransition
              key="finance"
              direction="right"
              className="h-full"
            >
              <FinanceView 
                jobs={jobs}
                onBack={() => handleNavigate('SETTINGS')}
              />
            </PageTransition>
          )}
        </AnimatePresence>
        
        {view !== 'EXECUTION' && (
          <BottomNav 
            currentView={view}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
    </>
  );
};

export default Index;
