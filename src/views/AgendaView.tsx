import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Job, JobStatus } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { JobCard } from '@/components/JobCard';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

interface AgendaViewProps {
  jobs: Job[];
  onStartJob: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
}

export const AgendaView = ({ jobs, onStartJob, onViewJob }: AgendaViewProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));

  const daysToRender = Array.from({ length: 7 }).map((_, i) => addDays(currentWeekStart, i));

  const filteredJobs = jobs.filter(j => 
    j.date === format(selectedDate, 'yyyy-MM-dd')
  );

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <BackgroundEffects />
      
      <PageHeader 
        title="Agenda"
        subtitle="Your Schedule"
      />
      
      <div className="px-6 relative z-10">
        {/* Week Navigation */}
        <div className="glass-panel p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => navigateWeek('prev')}
              className="liquid-btn w-10 h-10 text-muted-foreground"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-medium text-foreground">
              {format(currentWeekStart, 'MMMM yyyy')}
            </h3>
            <button 
              onClick={() => navigateWeek('next')}
              className="liquid-btn w-10 h-10 text-muted-foreground"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-muted-foreground mb-2">
                {day}
              </div>
            ))}
            
            {daysToRender.map((date, i) => {
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const hasJobs = jobs.some(j => j.date === format(date, 'yyyy-MM-dd'));
              
              return (
                <button 
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    relative flex flex-col items-center justify-center py-2 rounded-xl transition-all
                    ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                    ${isToday && !isSelected ? 'ring-2 ring-primary/50' : ''}
                  `}
                >
                  <span className={`text-sm font-medium ${isSelected ? '' : 'text-foreground'}`}>
                    {format(date, 'd')}
                  </span>
                  {hasJobs && !isSelected && (
                    <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Selected Day Jobs */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h2>
          
          <div className="space-y-3">
            <AnimatePresence>
              {filteredJobs.map(job => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onStart={onStartJob}
                  onView={onViewJob}
                />
              ))}
            </AnimatePresence>
            
            {filteredJobs.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-8 text-center"
              >
                <p className="text-muted-foreground">No jobs scheduled</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
