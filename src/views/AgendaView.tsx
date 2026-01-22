import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { Job, JobStatus } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { CalendarJobItem } from '@/components/calendar/CalendarJobItem';
import { 
  format, 
  addDays, 
  addWeeks,
  addMonths,
  startOfWeek, 
  startOfMonth
} from 'date-fns';
import { toast } from 'sonner';

interface AgendaViewProps {
  jobs: Job[];
  onStartJob?: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
  onRescheduleJob?: (jobId: string, newDate: string, newTime?: string) => void;
}

type CalendarView = 'day' | 'week' | 'month';

export const AgendaView = ({ jobs, onStartJob, onViewJob, onRescheduleJob }: AgendaViewProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, job: Job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', job.id);
    
    // Create a custom drag image
    const dragImage = document.createElement('div');
    dragImage.textContent = job.clientName;
    dragImage.style.cssText = 'position: absolute; top: -1000px; padding: 8px 12px; background: white; border-radius: 8px; font-size: 12px;';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, date: Date, hour?: number) => {
    e.preventDefault();
    
    if (!draggedJob || draggedJob.status !== JobStatus.SCHEDULED) {
      setDraggedJob(null);
      return;
    }

    const newDateStr = format(date, 'yyyy-MM-dd');
    let newTime = draggedJob.time;
    
    if (hour !== undefined) {
      newTime = `${hour.toString().padStart(2, '0')}:00`;
    }

    if (onRescheduleJob) {
      onRescheduleJob(draggedJob.id, newDateStr, newTime);
      toast.success(`Rescheduled to ${format(date, 'MMM d')}${hour !== undefined ? ` at ${newTime}` : ''}`);
    } else {
      toast.info('Drag-to-reschedule is in preview mode');
    }
    
    setDraggedJob(null);
  }, [draggedJob, onRescheduleJob]);

  const navigate = (direction: 'prev' | 'next') => {
    const delta = direction === 'next' ? 1 : -1;
    
    switch (calendarView) {
      case 'day':
        setSelectedDate(prev => addDays(prev, delta));
        break;
      case 'week':
        setCurrentWeekStart(prev => addWeeks(prev, delta));
        break;
      case 'month':
        setCurrentMonth(prev => addMonths(prev, delta));
        break;
    }
  };

  const getHeaderTitle = () => {
    switch (calendarView) {
      case 'day':
        return format(selectedDate, 'EEEE, MMM d');
      case 'week':
        return format(currentWeekStart, 'MMMM yyyy');
      case 'month':
        return format(currentMonth, 'MMMM yyyy');
    }
  };

  const viewButtons: { view: CalendarView; icon: typeof Calendar; label: string }[] = [
    { view: 'day', icon: Calendar, label: 'Day' },
    { view: 'week', icon: CalendarDays, label: 'Week' },
    { view: 'month', icon: CalendarRange, label: 'Month' },
  ];

  // Get selected date jobs for the list below
  const selectedDateJobs = jobs.filter(j => 
    j.date === format(selectedDate, 'yyyy-MM-dd')
  );

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <BackgroundEffects />
      
      <PageHeader 
        title="Agenda"
        subtitle="Your Schedule"
      />
      
      <div className="px-4 relative z-10">
        {/* View Toggle */}
        <div className="glass-panel p-1 mb-4 flex gap-1">
          {viewButtons.map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => setCalendarView(view)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all
                ${calendarView === view 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted'
                }
              `}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Calendar Navigation */}
        <div className="glass-panel p-4 mb-4">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => navigate('prev')}
              className="liquid-btn w-10 h-10 text-muted-foreground"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-medium text-foreground">
              {getHeaderTitle()}
            </h3>
            <button 
              onClick={() => navigate('next')}
              className="liquid-btn w-10 h-10 text-muted-foreground"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Calendar Views */}
          <AnimatePresence mode="wait">
            <motion.div
              key={calendarView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {calendarView === 'day' && (
                <DayView
                  selectedDate={selectedDate}
                  jobs={jobs}
                  onViewJob={onViewJob}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                />
              )}
              
              {calendarView === 'week' && (
                <WeekView
                  weekStart={currentWeekStart}
                  selectedDate={selectedDate}
                  jobs={jobs}
                  onSelectDate={setSelectedDate}
                  onViewJob={onViewJob}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                />
              )}
              
              {calendarView === 'month' && (
                <MonthView
                  currentMonth={currentMonth}
                  selectedDate={selectedDate}
                  jobs={jobs}
                  onSelectDate={setSelectedDate}
                  onViewJob={onViewJob}
                  onDragStart={handleDragStart}
                  onDrop={handleDrop}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Selected Day Jobs List */}
        {calendarView !== 'day' && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
              {format(selectedDate, 'EEEE, MMMM d')}
            </h2>
            
            <div className="space-y-2">
              <AnimatePresence>
                {selectedDateJobs.map(job => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <CalendarJobItem
                      job={job}
                      onView={onViewJob}
                      onDragStart={handleDragStart}
                      draggable={false}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {selectedDateJobs.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel p-6 text-center"
                >
                  <p className="text-muted-foreground text-sm">No jobs scheduled</p>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
