import { motion } from 'framer-motion';
import { Check, Circle, Minus } from 'lucide-react';
import { Job, JobStatus } from '@/types';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface WeeklyProgressProps {
  jobs: Job[];
}

export const WeeklyProgress = ({ jobs }: WeeklyProgressProps) => {
  const { t } = useLanguage();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start
  
  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      dayLabel: format(date, 'EEE').slice(0, 3),
      isToday: isSameDay(date, today),
      isPast: date < today && !isSameDay(date, today),
      isFuture: date > today,
    };
  });

  // Calculate completion for each day
  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayJobs = jobs.filter(j => j.date === dateStr);
    
    if (dayJobs.length === 0) return 'empty';
    
    const completedCount = dayJobs.filter(j => j.status === JobStatus.COMPLETED).length;
    
    if (completedCount === dayJobs.length) return 'completed';
    if (completedCount > 0) return 'partial';
    return 'pending';
  };

  // Calculate overall weekly progress
  const thisWeekJobs = jobs.filter(j => {
    const jobDate = new Date(j.date);
    return jobDate >= weekStart && jobDate <= addDays(weekStart, 6);
  });
  
  const completedJobs = thisWeekJobs.filter(j => j.status === JobStatus.COMPLETED).length;
  const totalJobs = thisWeekJobs.length;
  const progressPercent = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 25 }}
      className="glass-panel p-5"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {t('dashboard.weeklyProgress') || 'Progresso Semanal'}
        </h3>
        <span className="text-primary font-bold text-lg">{progressPercent}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
          className="h-full bg-gradient-to-r from-primary to-success rounded-full"
        />
      </div>

      {/* Jobs count */}
      <p className="text-sm text-muted-foreground mb-5">
        {completedJobs}/{totalJobs} {t('dashboard.cleaningsCompleted') || 'limpezas concluídas'}
      </p>

      {/* Week days grid */}
      <div className="flex justify-between gap-1">
        {weekDays.map((day, idx) => {
          const status = getDayStatus(day.date);
          
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + idx * 0.05 }}
              className="flex flex-col items-center gap-2"
            >
              <div 
                className={`
                  w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold
                  transition-all duration-300
                  ${day.isToday 
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2' 
                    : status === 'completed' 
                      ? 'bg-success text-success-foreground' 
                      : status === 'partial'
                        ? 'bg-warning text-warning-foreground'
                        : status === 'pending'
                          ? 'bg-muted text-muted-foreground'
                          : day.isFuture
                            ? 'bg-muted/50 text-muted-foreground/50 border-2 border-dashed border-muted'
                            : 'bg-muted/30 text-muted-foreground/30'
                  }
                `}
              >
                {status === 'completed' ? (
                  <Check size={14} strokeWidth={3} />
                ) : status === 'partial' ? (
                  <Circle size={10} className="fill-current" />
                ) : day.isFuture ? (
                  <Minus size={12} />
                ) : status === 'empty' ? (
                  <span className="text-[10px]">-</span>
                ) : (
                  <Circle size={10} />
                )}
              </div>
              <span className={`
                text-[10px] font-medium
                ${day.isToday ? 'text-primary font-bold' : 'text-muted-foreground'}
              `}>
                {day.dayLabel}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
