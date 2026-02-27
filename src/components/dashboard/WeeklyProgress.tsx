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
      isFuture: date > today
    };
  });

  // Calculate completion for each day
  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayJobs = jobs.filter((j) => j.date === dateStr);

    if (dayJobs.length === 0) return 'empty';

    const completedCount = dayJobs.filter((j) => j.status === JobStatus.COMPLETED).length;

    if (completedCount === dayJobs.length) return 'completed';
    if (completedCount > 0) return 'partial';
    return 'pending';
  };

  // Calculate overall weekly progress
  const thisWeekJobs = jobs.filter((j) => {
    const jobDate = new Date(j.date);
    return jobDate >= weekStart && jobDate <= addDays(weekStart, 6);
  });

  const completedJobs = thisWeekJobs.filter((j) => j.status === JobStatus.COMPLETED).length;
  const totalJobs = thisWeekJobs.length;
  const progressPercent = totalJobs > 0 ? Math.round(completedJobs / totalJobs * 100) : 0;

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">{t('dashboard.weeklyProgress') || 'Progresso Semanal'}</h3>
        <span className="text-xs text-muted-foreground">{completedJobs}/{totalJobs} {t('dashboard.completed') || 'concluídos'}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="bg-muted rounded-full h-2.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1.5 text-right">{progressPercent}%</p>
      </div>

      {/* Week days */}
      <div className="flex justify-between gap-1">
        {weekDays.map((day) => {
          const dayJobs = jobs.filter((j) => isSameDay(new Date(j.date), day.date));
          const allCompleted = dayJobs.length > 0 && dayJobs.every((j) => j.status === JobStatus.COMPLETED);
          const hasJobs = dayJobs.length > 0;
          const isToday = isSameDay(day.date, today);

          return (
            <motion.div
              key={day.dayLabel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-1.5"
            >
              <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {day.dayLabel}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all
                ${allCompleted ? 'bg-success/20 text-success' :
                  isToday ? 'bg-primary/20 text-primary ring-2 ring-primary/30' :
                  hasJobs ? 'bg-muted text-foreground' :
                  'bg-muted/50 text-muted-foreground'}
              `}>
                {allCompleted ? <Check size={14} /> :
                  hasJobs ? dayJobs.length :
                  <Minus size={10} className="opacity-30" />}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};