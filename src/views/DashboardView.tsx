import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Job, JobStatus } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { JobCard } from '@/components/JobCard';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { LiquidProgressBubble } from '@/components/LiquidProgressBubble';
import { useLanguage } from '@/contexts/LanguageContext';
import { staggerContainer, staggerItem, glassCardVariants } from '@/lib/animations';
import purLogo from '@/assets/pur-logo.png';

interface DashboardViewProps {
  jobs: Job[];
  onStartJob: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
  userProfile: { name: string; avatar: string };
}

export const DashboardView = ({ jobs, onStartJob, onViewJob, userProfile }: DashboardViewProps) => {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayJobs = jobs.filter(j => j.date === new Date().toISOString().split('T')[0]);
  const inProgressJobs = todayJobs.filter(j => j.status === JobStatus.IN_PROGRESS);
  const scheduledJobs = todayJobs.filter(j => j.status === JobStatus.SCHEDULED);
  const completedJobs = todayJobs.filter(j => j.status === JobStatus.COMPLETED);

  // Calculate purification progress based on all today's jobs checklists
  const purificationProgress = useMemo(() => {
    const activeJobs = [...inProgressJobs, ...completedJobs];
    if (activeJobs.length === 0) return 0;
    
    let totalItems = 0;
    let completedItems = 0;
    
    activeJobs.forEach(job => {
      job.checklist.forEach(section => {
        section.items.forEach(item => {
          totalItems++;
          if (item.completed) completedItems++;
        });
      });
    });
    
    return totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  }, [inProgressJobs, completedJobs]);

  const greeting = currentTime.getHours() < 12 ? t('dashboard.goodMorning') : 
                   currentTime.getHours() < 17 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening');

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
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-6"
          variants={staggerContainer}
          initial="initial"
          animate="enter"
        >
          <motion.div 
            variants={glassCardVariants}
            whileHover="hover"
            className="glass-panel p-4 text-center cursor-default group relative overflow-hidden"
          >
            <motion.div 
              className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Clock size={16} className="text-primary" />
            </motion.div>
            <p className="text-2xl font-light text-foreground">
              {inProgressJobs.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('dashboard.active')}</p>
          </motion.div>
          
          <motion.div 
            variants={glassCardVariants}
            whileHover="hover"
            className="glass-panel p-4 text-center cursor-default group relative overflow-hidden"
          >
            <motion.div 
              className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-warning/10 group-hover:bg-warning/20 transition-colors"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <TrendingUp size={16} className="text-warning" />
            </motion.div>
            <p className="text-2xl font-light text-foreground">
              {scheduledJobs.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('dashboard.scheduled')}</p>
          </motion.div>
          
          <motion.div 
            variants={glassCardVariants}
            whileHover="hover"
            className="glass-panel p-4 text-center cursor-default group relative overflow-hidden"
          >
            <motion.div 
              className="flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full bg-success/10 group-hover:bg-success/20 transition-colors"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle2 size={16} className="text-success" />
            </motion.div>
            <p className="text-2xl font-light text-foreground">
              {completedJobs.length}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{t('dashboard.done')}</p>
          </motion.div>
        </motion.div>

        {/* Purification Bubble */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center mb-8"
        >
          <LiquidProgressBubble percentage={purificationProgress} showLabel={false} />
        </motion.div>

        {/* Today's Jobs */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            {t('dashboard.todayJobs')}
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
                <p className="text-muted-foreground">{t('dashboard.noJobsToday')}</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
