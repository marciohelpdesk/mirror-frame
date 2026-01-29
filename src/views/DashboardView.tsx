import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Job, JobStatus } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { JobCard } from '@/components/JobCard';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { LiquidProgressBubble } from '@/components/LiquidProgressBubble';
import { useLanguage } from '@/contexts/LanguageContext';
import { staggerContainer, staggerItem, createCounterVariants, fadeInScale } from '@/lib/animations';
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

  const statsCards = [
    { 
      icon: Clock, 
      value: inProgressJobs.length, 
      label: t('dashboard.active'), 
      colorClass: 'bg-primary/10',
      iconClass: 'text-primary'
    },
    { 
      icon: TrendingUp, 
      value: scheduledJobs.length, 
      label: t('dashboard.scheduled'), 
      colorClass: 'bg-warning/10',
      iconClass: 'text-warning'
    },
    { 
      icon: CheckCircle2, 
      value: completedJobs.length, 
      label: t('dashboard.done'), 
      colorClass: 'bg-success/10',
      iconClass: 'text-success'
    },
  ];

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <BackgroundEffects />
      
      <PageHeader 
        title={greeting}
        subtitle={currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        rightElement={
          <div className="flex items-center gap-3">
            <motion.img 
              src={purLogo}
              alt="Pur Logo"
              className="w-10 h-10 object-contain drop-shadow-lg"
              initial={{ opacity: 0, rotate: -10 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
            <motion.img 
              src={userProfile.avatar} 
              alt={userProfile.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
            />
          </div>
        }
      />
      
      <div className="px-6 pt-2 relative z-10">
        {/* Stats Cards with Stagger Animation */}
        <motion.div 
          className="grid grid-cols-3 gap-3 mb-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.label}
                variants={createCounterVariants(index * 0.08)}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="glass-panel p-4 text-center cursor-pointer"
              >
                <motion.div 
                  className={`flex items-center justify-center w-8 h-8 mx-auto mb-2 rounded-full ${stat.colorClass}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, delay: 0.2 + index * 0.1 }}
                >
                  <Icon size={16} className={stat.iconClass} />
                </motion.div>
                <motion.p 
                  className="text-2xl font-light text-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {stat.value}
                </motion.p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Purification Bubble */}
        <motion.div 
          variants={fadeInScale}
          initial="initial"
          animate="animate"
          className="flex justify-center mb-8"
        >
          <LiquidProgressBubble percentage={purificationProgress} showLabel={false} />
        </motion.div>

        {/* Today's Jobs */}
        <div className="mb-6">
          <motion.h2 
            className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {t('dashboard.todayJobs')}
          </motion.h2>
          
          <motion.div 
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {inProgressJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onStart={onStartJob}
                  onView={onViewJob}
                />
              ))}
              {scheduledJobs.map((job) => (
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
                variants={staggerItem}
                className="glass-panel p-8 text-center"
              >
                <p className="text-muted-foreground">{t('dashboard.noJobsToday')}</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
