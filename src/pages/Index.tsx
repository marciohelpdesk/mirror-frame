import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Job, Property, UserProfile, ViewState, JobStatus, Employee, InventoryItem } from '@/types';
import { INITIAL_JOBS, INITIAL_PROPERTIES, INITIAL_PROFILE, INITIAL_EMPLOYEES, INITIAL_INVENTORY } from '@/data/initialData';
import { BottomNav } from '@/components/BottomNav';
import { DashboardView } from '@/views/DashboardView';
import { AgendaView } from '@/views/AgendaView';
import { PropertiesView } from '@/views/PropertiesView';
import { SettingsView } from '@/views/SettingsView';
import { LoginView } from '@/views/LoginView';
import { PropertyDetailsView } from '@/views/PropertyDetailsView';
import { JobDetailsView } from '@/views/JobDetailsView';
import { ExecutionView } from '@/views/ExecutionView';
import { FinanceView } from '@/views/FinanceView';

const Index = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // App State
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  // Auth Handlers
  const handleLogin = (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError('');
    
    // Simulated login - in production this would call Supabase
    setTimeout(() => {
      if (email && password) {
        setIsAuthenticated(true);
        setUserProfile({
          ...INITIAL_PROFILE,
          email
        });
      } else {
        setAuthError('Please enter valid credentials');
      }
      setAuthLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setView('DASHBOARD');
  };

  // Job Handlers
  const startJob = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? {
      ...j, 
      status: JobStatus.IN_PROGRESS, 
      startTime: Date.now(),
      currentStep: 'BEFORE_PHOTOS' 
    } : j));
    setActiveJobId(jobId);
    setView('EXECUTION');
  };

  const viewJob = (jobId: string) => {
    setActiveJobId(jobId);
    const job = jobs.find(j => j.id === jobId);
    if (job?.status === JobStatus.IN_PROGRESS) {
      setView('EXECUTION');
    } else {
      setView('JOB_DETAILS');
    }
  };

  const updateJob = (updatedJob: Job) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
  };

  const rescheduleJob = (jobId: string, newDate: string, newTime?: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          date: newDate,
          time: newTime || j.time
        };
      }
      return j;
    }));
  };

  const completeJob = (completedJob: Job) => {
    setJobs(prev => prev.map(j => j.id === completedJob.id ? {
      ...completedJob,
      status: JobStatus.COMPLETED
    } : j));
    setActiveJobId(null);
    setView('DASHBOARD');
  };

  const cancelExecution = () => {
    setActiveJobId(null);
    setView('DASHBOARD');
  };

  // Property Handlers
  const viewProperty = (propertyId: string) => {
    setActivePropertyId(propertyId);
    setView('PROPERTY_DETAILS');
  };

  const updateProperty = (updatedProperty: Property) => {
    setProperties(prev => prev.map(p => 
      p.id === updatedProperty.id ? updatedProperty : p
    ));
  };

  const addProperty = (newProperty: Property) => {
    setProperties(prev => [...prev, newProperty]);
  };

  const addJob = (newJob: Job) => {
    setJobs(prev => [...prev, newJob]);
  };

  const deleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    setActiveJobId(null);
    setView('AGENDA');
  };

  const deleteProperty = (propertyId: string) => {
    setProperties(prev => prev.filter(p => p.id !== propertyId));
    setActivePropertyId(null);
    setView('PROPERTIES');
  };

  // Employee Handlers
  const addEmployee = (employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  };

  const deleteEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
    // Unassign from any jobs
    setJobs(prev => prev.map(j => j.assignedTo === employeeId ? { ...j, assignedTo: undefined } : j));
  };

  // Navigation Handler
  const handleNavigate = (newView: ViewState) => {
    setView(newView);
  };

  const activeProperty = properties.find(p => p.id === activePropertyId);
  const activeJob = jobs.find(j => j.id === activeJobId);

  // Render Login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <div className="bg-florida-sky-fixed" />
        <div className="min-h-screen relative z-10 md:flex md:items-center md:justify-center">
          <LoginView 
            onLogin={handleLogin}
            isLoading={authLoading}
            error={authError}
          />
        </div>
      </>
    );
  }

  // Main App View
  return (
    <>
      <div className="bg-florida-sky-fixed" />
      <div className="min-h-screen relative z-10 md:flex md:items-center md:justify-center">
      <div className="mobile-frame">
        <AnimatePresence mode="wait">
          {view === 'DASHBOARD' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <DashboardView 
                jobs={jobs}
                onStartJob={startJob}
                onViewJob={viewJob}
                userProfile={userProfile}
              />
            </motion.div>
          )}
          
          {view === 'AGENDA' && (
            <motion.div
              key="agenda"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <AgendaView 
                jobs={jobs}
                properties={properties}
                employees={employees}
                onStartJob={startJob}
                onViewJob={viewJob}
                onRescheduleJob={rescheduleJob}
                onAddJob={addJob}
              />
            </motion.div>
          )}
          
          {view === 'PROPERTIES' && (
            <motion.div
              key="properties"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <PropertiesView 
                properties={properties}
                onViewProperty={viewProperty}
                onAddProperty={addProperty}
              />
            </motion.div>
          )}
          
          {view === 'PROPERTY_DETAILS' && activeProperty && (
            <motion.div
              key="property-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <PropertyDetailsView 
                property={activeProperty}
                onBack={() => setView('PROPERTIES')}
                onUpdate={updateProperty}
                onDelete={deleteProperty}
              />
            </motion.div>
          )}

          {view === 'JOB_DETAILS' && activeJob && (
            <motion.div
              key="job-details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <JobDetailsView 
                job={activeJob}
                properties={properties}
                employees={employees}
                onBack={() => setView('AGENDA')}
                onStartJob={startJob}
                onUpdateJob={updateJob}
                onDeleteJob={deleteJob}
              />
            </motion.div>
          )}

          {view === 'EXECUTION' && activeJob && (
            <motion.div
              key="execution"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full"
            >
              <ExecutionView
                job={activeJob}
                inventory={inventory}
                onUpdateJob={updateJob}
                onComplete={completeJob}
                onCancel={cancelExecution}
              />
            </motion.div>
          )}
          
          {view === 'SETTINGS' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <SettingsView 
                userProfile={userProfile}
                employees={employees}
                onLogout={handleLogout}
                onViewFinance={() => setView('FINANCE')}
                onAddEmployee={addEmployee}
                onDeleteEmployee={deleteEmployee}
              />
            </motion.div>
          )}

          {view === 'FINANCE' && (
            <motion.div
              key="finance"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <FinanceView 
                jobs={jobs}
                onBack={() => setView('SETTINGS')}
              />
            </motion.div>
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