import { motion } from 'framer-motion';
import { Clock, TrendingUp, CheckCircle2, DollarSign } from 'lucide-react';
import { Job, JobStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface DashboardStatsProps {
  jobs: Job[];
}

export const DashboardStats = ({ jobs }: DashboardStatsProps) => {
  const { t } = useLanguage();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayJobs = jobs.filter(j => j.date === todayStr);
  
  const inProgressJobs = todayJobs.filter(j => j.status === JobStatus.IN_PROGRESS);
  const scheduledJobs = todayJobs.filter(j => j.status === JobStatus.SCHEDULED);
  const completedJobs = todayJobs.filter(j => j.status === JobStatus.COMPLETED);
  
  // Calculate today's earnings
  const todayEarnings = completedJobs.reduce((sum, job) => sum + (job.price || 0), 0);

  const stats = [
    {
      icon: Clock,
      value: inProgressJobs.length,
      label: t('dashboard.active'),
      color: 'bg-status-active/10',
      iconColor: 'text-status-active',
    },
    {
      icon: TrendingUp,
      value: scheduledJobs.length,
      label: t('dashboard.scheduled'),
      color: 'bg-status-pending/10',
      iconColor: 'text-status-pending',
    },
    {
      icon: CheckCircle2,
      value: completedJobs.length,
      label: t('dashboard.done'),
      color: 'bg-status-done/10',
      iconColor: 'text-status-done',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay: 0.1 + idx * 0.1
          }}
          className="glass-panel p-4 text-center cursor-default group"
        >
          <motion.div
            className={`flex items-center justify-center w-9 h-9 mx-auto mb-2 rounded-xl ${stat.color} group-hover:scale-110 transition-transform`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <stat.icon size={18} className={stat.iconColor} />
          </motion.div>
          <motion.p
            className="text-2xl font-bold text-foreground"
            key={stat.value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {stat.value}
          </motion.p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            {stat.label}
          </p>
        </motion.div>
      ))}
    </div>
  );
};
