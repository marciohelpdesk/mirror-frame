import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Job } from '@/types';
import { CalendarJobItem } from './CalendarJobItem';
import { format } from 'date-fns';

interface DayViewProps {
  selectedDate: Date;
  jobs: Job[];
  onViewJob: (jobId: string) => void;
  onDragStart: (e: React.DragEvent, job: Job) => void;
  onDrop: (e: React.DragEvent, date: Date, hour?: number) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM

export const DayView = forwardRef<HTMLDivElement, DayViewProps>(
  ({ selectedDate, jobs, onViewJob, onDragStart, onDrop }, ref) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayJobs = jobs.filter(j => j.date === dateStr);

    const getJobsForHour = (hour: number) => {
      return dayJobs.filter(job => {
        const jobHour = parseInt(job.time.split(':')[0], 10);
        return jobHour === hour;
      });
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    return (
      <div ref={ref} className="space-y-1">
        {HOURS.map(hour => {
          const hourJobs = getJobsForHour(hour);
          const timeLabel = format(new Date().setHours(hour, 0), 'h a');
          
          return (
            <div
              key={hour}
              className="flex gap-3"
              onDragOver={handleDragOver}
              onDrop={(e) => onDrop(e, selectedDate, hour)}
            >
              <div className="w-12 text-xs text-muted-foreground text-right pt-1 shrink-0">
                {timeLabel}
              </div>
              <div 
                className={`
                  flex-1 min-h-[60px] rounded-lg border border-dashed border-border/50 p-1.5
                  transition-colors hover:border-primary/30 hover:bg-primary/5
                `}
              >
                <AnimatePresence>
                  {hourJobs.map(job => (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="mb-1 last:mb-0"
                    >
                      <CalendarJobItem
                        job={job}
                        onView={onViewJob}
                        onDragStart={onDragStart}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
);

DayView.displayName = 'DayView';
