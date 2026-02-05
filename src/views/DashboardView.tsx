import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, Zap } from 'lucide-react';
import { Job, JobStatus, Property } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { JobCard } from '@/components/JobCard';
import { NextJobCard } from '@/components/dashboard/NextJobCard';
import { WeeklyProgress } from '@/components/dashboard/WeeklyProgress';
import { useLanguage } from '@/contexts/LanguageContext';
import purLogo from '@/assets/pur-logo.png';

interface DashboardViewProps {
  jobs: Job[];
  properties?: Property[];
  onStartJob: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
  userProfile: { name: string; avatar: string };
}

export const DashboardView = ({ jobs, properties = [], onStartJob, onViewJob, userProfile }: DashboardViewProps) => {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayJobs = jobs.filter(j => j.date === todayStr);
  const inProgressJobs = todayJobs.filter(j => j.status === JobStatus.IN_PROGRESS);
  const scheduledJobs = todayJobs.filter(j => j.status === JobStatus.SCHEDULED);
  const completedJobs = todayJobs.filter(j => j.status === JobStatus.COMPLETED);

  // Get the next upcoming job (first in-progress or first scheduled)
  const nextJob = useMemo(() => {
    if (inProgressJobs.length > 0) return inProgressJobs[0];
    if (scheduledJobs.length > 0) {
      // Sort by time and return the earliest
      return [...scheduledJobs].sort((a, b) => a.time.localeCompare(b.time))[0];
    }
    return null;
  }, [inProgressJobs, scheduledJobs]);

  // Get property for next job
  const nextJobProperty = nextJob?.propertyId 
    ? properties.find(p => p.id === nextJob.propertyId)
    : undefined;

  // Calculate today's progress
  const todayProgress = todayJobs.length > 0 
    ? Math.round((completedJobs.length / todayJobs.length) * 100) 
    : 0;

  const greeting = currentTime.getHours() < 12 ? t('dashboard.goodMorning') : 
                   currentTime.getHours() < 17 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening');

  // Remaining jobs after next job
  const remainingJobs = useMemo(() => {
    const allUpcoming = [...inProgressJobs, ...scheduledJobs];
    if (nextJob) {
      return allUpcoming.filter(j => j.id !== nextJob.id);
    }
    return allUpcoming;
  }, [inProgressJobs, scheduledJobs, nextJob]);

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
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
      
      <div className="px-6 pt-2 relative z-10 space-y-6">
        {/* Modern Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {/* Today's Progress */}
          <div className="glass-panel p-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap size={16} className="text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{todayProgress}%</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {t('dashboard.progress') || 'Progresso'}
              </p>
            </div>
          </div>

          {/* Today's Jobs */}
          <div className="glass-panel p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
                  <Calendar size={16} className="text-success" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">
                <span className="text-success">{completedJobs.length}</span>
                <span className="text-muted-foreground text-lg">/{todayJobs.length}</span>
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {t('dashboard.today') || 'Hoje'}
              </p>
            </div>
          </div>

          {/* Pending */}
          <div className="glass-panel p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-warning/10 flex items-center justify-center">
                  <TrendingUp size={16} className="text-warning" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{scheduledJobs.length + inProgressJobs.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {t('dashboard.pending') || 'Pendentes'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Next Job Highlight */}
        {nextJob && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              {t('dashboard.nextCleaning') || 'Próxima Limpeza'}
            </h2>
            <NextJobCard 
              job={nextJob}
              property={nextJobProperty}
              onStart={onStartJob}
              onView={onViewJob}
            />
          </div>
        )}

        {/* Weekly Progress */}
        <WeeklyProgress jobs={jobs} />

        {/* Remaining Today's Jobs */}
        {remainingJobs.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              {t('dashboard.todayJobs')}
            </h2>
            
            <div className="space-y-3">
              <AnimatePresence>
                {remainingJobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onStart={onStartJob}
                    onView={onViewJob}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        
        {todayJobs.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-8 text-center"
          >
            <p className="text-muted-foreground">{t('dashboard.noJobsToday')}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
