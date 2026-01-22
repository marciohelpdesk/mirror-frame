import { motion, AnimatePresence } from 'framer-motion';
import { Job } from '@/types';
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

export const WeekView = ({ 
  weekStart, 
  selectedDate,
  jobs, 
  onSelectDate,
  onViewJob, 
  onDragStart, 
  onDrop 
}: WeekViewProps) => {
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
    <div className="grid grid-cols-7 gap-1">
      {/* Header */}
      {days.map((date, i) => {
        const isToday = isSameDay(date, new Date());
        const isSelected = isSameDay(date, selectedDate);
        
        return (
          <button
            key={i}
            onClick={() => onSelectDate(date)}
            className={`
              text-center py-2 rounded-lg transition-colors
              ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
              ${isToday && !isSelected ? 'ring-2 ring-primary/50' : ''}
            `}
          >
            <div className="text-[10px] font-bold text-muted-foreground uppercase">
              {format(date, 'EEE')}
            </div>
            <div className={`text-lg font-medium ${isSelected ? '' : 'text-foreground'}`}>
              {format(date, 'd')}
            </div>
          </button>
        );
      })}
      
      {/* Job slots */}
      {days.map((date, i) => {
        const dayJobs = getJobsForDate(date);
        
        return (
          <div
            key={`jobs-${i}`}
            className="min-h-[120px] border border-dashed border-border/30 rounded-lg p-1 transition-colors hover:border-primary/30 hover:bg-primary/5"
            onDragOver={handleDragOver}
            onDrop={(e) => onDrop(e, date)}
          >
            <AnimatePresence>
              {dayJobs.slice(0, 3).map(job => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
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
                <div className="text-[10px] text-muted-foreground text-center py-0.5">
                  +{dayJobs.length - 3} more
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
