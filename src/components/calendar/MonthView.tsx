import { motion, AnimatePresence } from 'framer-motion';
import { Job } from '@/types';
import { CalendarJobItem } from './CalendarJobItem';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isSameMonth 
} from 'date-fns';

interface MonthViewProps {
  currentMonth: Date;
  selectedDate: Date;
  jobs: Job[];
  onSelectDate: (date: Date) => void;
  onViewJob: (jobId: string) => void;
  onDragStart: (e: React.DragEvent, job: Job) => void;
  onDrop: (e: React.DragEvent, date: Date) => void;
}

export const MonthView = ({ 
  currentMonth, 
  selectedDate,
  jobs, 
  onSelectDate,
  onViewJob, 
  onDragStart, 
  onDrop 
}: MonthViewProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const getJobsForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return jobs.filter(j => j.date === dateStr);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div>
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
          <div key={i} className="text-center text-[10px] font-bold uppercase text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          const isToday = isSameDay(date, new Date());
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const dayJobs = getJobsForDate(date);
          
          return (
            <div
              key={i}
              className={`
                min-h-[72px] rounded-lg border border-transparent p-1 transition-colors cursor-pointer
                ${isSelected ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted/50'}
                ${!isCurrentMonth ? 'opacity-40' : ''}
              `}
              onClick={() => onSelectDate(date)}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                e.stopPropagation();
                onDrop(e, date);
              }}
            >
              <div 
                className={`
                  text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-primary text-primary-foreground' : 'text-foreground'}
                  ${isSelected && !isToday ? 'bg-secondary text-secondary-foreground' : ''}
                `}
              >
                {format(date, 'd')}
              </div>
              
              <AnimatePresence>
                {dayJobs.slice(0, 2).map(job => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-0.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CalendarJobItem
                      job={job}
                      compact
                      onView={onViewJob}
                      onDragStart={onDragStart}
                    />
                  </motion.div>
                ))}
                {dayJobs.length > 2 && (
                  <div className="text-[9px] text-muted-foreground text-center">
                    +{dayJobs.length - 2}
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};
