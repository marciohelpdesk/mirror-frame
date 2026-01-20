import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Job, JobStatus, ViewState } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { JobCard } from '@/components/JobCard';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import purLogo from '@/assets/pur-logo.png';

interface DashboardViewProps {
  jobs: Job[];
  onStartJob: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
  userProfile: { name: string; avatar: string };
}

export const DashboardView = ({ jobs, onStartJob, onViewJob, userProfile }: DashboardViewProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayJobs = jobs.filter(j => j.date === new Date().toISOString().split('T')[0]);
  const inProgressJobs = todayJobs.filter(j => j.status === JobStatus.IN_PROGRESS);
  const scheduledJobs = todayJobs.filter(j => j.status === JobStatus.SCHEDULED);
  const completedJobs = todayJobs.filter(j => j.status === JobStatus.COMPLETED);

  const greeting = currentTime.getHours() < 12 ? 'Good Morning' : 
                   currentTime.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <BackgroundEffects />
      
      <PageHeader 
        title={greeting}
        subtitle={currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        rightElement={
          <div className="flex items-center gap-3">
            <img 
              src={purLogo}
              alt="Pur Logo"
              className="w-10 h-10 object-contain drop-shadow-lg"
            />
            <img 
              src={userProfile.avatar} 
              alt={userProfile.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
            />
          </div>
        }
      />
      
      <div className="px-6 pt-2 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-4 text-center"
          >
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-primary/10">
              <Clock size={16} className="text-primary" />
            </div>
            <p className="text-2xl font-light text-foreground">{inProgressJobs.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Active</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-4 text-center"
          >
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-warning/10">
              <TrendingUp size={16} className="text-warning" />
            </div>
            <p className="text-2xl font-light text-foreground">{scheduledJobs.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Scheduled</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-4 text-center"
          >
            <div className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-success/10">
              <CheckCircle2 size={16} className="text-success" />
            </div>
            <p className="text-2xl font-light text-foreground">{completedJobs.length}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Done</p>
          </motion.div>
        </div>

        {/* Today's Jobs */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Today's Jobs
          </h2>
          
          <div className="space-y-3">
            <AnimatePresence>
              {inProgressJobs.map((job, i) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onStart={onStartJob}
                  onView={onViewJob}
                />
              ))}
              {scheduledJobs.map((job, i) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onStart={onStartJob}
                  onView={onViewJob}
                />
              ))}
            </AnimatePresence>
            
            {todayJobs.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-8 text-center"
              >
                <p className="text-muted-foreground">No jobs scheduled for today</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
