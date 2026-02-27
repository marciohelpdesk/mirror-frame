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

  return;




















































































};