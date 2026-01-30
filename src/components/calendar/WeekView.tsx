import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Job, JobStatus } from '@/types';
import { CalendarJobItem } from './CalendarJobItem';
import { format, addDays, isSameDay } from 'date-fns';

interface WeekViewProps {
  weekStart: Date;
  selectedDate: Date;
  jobs: Job[];
  onSelectDate: (date: Date) => void;
  onViewJob: (jobId: string) => void;
  onDragStart: (e: React.DragEvent, job: Job) => void;
  onDrop: (e: React.DragEvent, date: Date) => void;
}

const getStatusDotColor = (status: JobStatus) => {
  switch (status) {
    case JobStatus.SCHEDULED:
      return 'bg-status-scheduled';
    case JobStatus.IN_PROGRESS:
      return 'bg-status-active';
    case JobStatus.COMPLETED:
      return 'bg-status-done';
    default:
      return 'bg-muted';
  }
};

export const WeekView = forwardRef<HTMLDivElement, WeekViewProps>(
  ({ weekStart, selectedDate, jobs, onSelectDate, onViewJob, onDragStart, onDrop }, ref) => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const getJobsForDate = (date: Date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return jobs.filter(j => j.date === dateStr);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    return (
      <div ref={ref} className="grid grid-cols-7 gap-1.5">
        {/* Header */}
        {days.map((date, i) => {
          const isToday = isSameDay(date, new Date());
          const isSelected = isSameDay(date, selectedDate);
          const dayJobs = getJobsForDate(date);
          
          return (
            <motion.button
              key={i}
              onClick={() => onSelectDate(date)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                text-center py-2.5 rounded-xl transition-all duration-200
                ${isSelected 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' 
                  : 'hover:bg-muted'
                }
                ${isToday && !isSelected ? 'ring-2 ring-primary/50' : ''}
              `}
            >
              <div className="text-[10px] font-bold text-muted-foreground uppercase">
                {format(date, 'EEE')}
              </div>
              <div className={`text-lg font-bold ${isSelected ? '' : 'text-foreground'}`}>
                {format(date, 'd')}
              </div>
              {/* Status dots */}
              <div className="flex justify-center gap-0.5 mt-1 min-h-[8px]">
                {dayJobs.slice(0, 3).map((job, jidx) => (
                  <motion.div
                    key={jidx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(job.status)}`}
                  />
                ))}
                {dayJobs.length > 3 && (
                  <span className="text-[8px] text-muted-foreground ml-0.5">+{dayJobs.length - 3}</span>
                )}
              </div>
            </motion.button>
          );
        })}
        
        {/* Job slots */}
        {days.map((date, i) => {
          const dayJobs = getJobsForDate(date);
          
          return (
            <div
              key={`jobs-${i}`}
              className="min-h-[100px] border border-dashed border-border/30 rounded-xl p-1.5 transition-colors hover:border-primary/30 hover:bg-primary/5"
              onDragOver={handleDragOver}
              onDrop={(e) => onDrop(e, date)}
            >
              <AnimatePresence>
                {dayJobs.slice(0, 3).map((job, idx) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ delay: idx * 0.05 }}
                    className="mb-1"
                  >
                    <CalendarJobItem
                      job={job}
                      compact
                      onView={onViewJob}
                      onDragStart={onDragStart}
                    />
                  </motion.div>
                ))}
                {dayJobs.length > 3 && (
                  <div className="text-[10px] text-muted-foreground text-center py-0.5 font-medium">
                    +{dayJobs.length - 3} more
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  }
);

WeekView.displayName = 'WeekView';
