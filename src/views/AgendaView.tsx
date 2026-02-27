import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar, CalendarDays, CalendarRange, Plus,
  MapPin, Bed, Bath, Play, Clock, Check, AlertTriangle, Car, ExternalLink
} from 'lucide-react';
import { openAddressInMaps } from '@/lib/utils';
import { Job, JobStatus, Property, Employee } from '@/types';
import { DayView } from '@/components/calendar/DayView';
import { WeekView } from '@/components/calendar/WeekView';
import { MonthView } from '@/components/calendar/MonthView';
import { AddJobModal } from '@/components/AddJobModal';
import { useLanguage } from '@/contexts/LanguageContext';
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
  properties: Property[];
  employees?: Employee[];
  onStartJob?: (jobId: string) => void;
  onViewJob: (jobId: string) => void;
  onRescheduleJob?: (jobId: string, newDate: string, newTime?: string) => void;
  onAddJob?: (job: Job) => void;
}

type CalendarView = 'day' | 'week' | 'month';

export const AgendaView = ({ jobs, properties, employees = [], onStartJob, onViewJob, onRescheduleJob, onAddJob }: AgendaViewProps) => {
  const { t } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date()));
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [showAddJobModal, setShowAddJobModal] = useState(false);

  const handleAddJob = (job: Job) => {
    if (onAddJob) {
      onAddJob(job);
      toast.success('Job scheduled successfully');
    }
  };

  const handleDragStart = useCallback((e: React.DragEvent, job: Job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', job.id);
    
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

  const viewButtons: { view: CalendarView; label: string }[] = [
    { view: 'day', label: t('agenda.day') },
    { view: 'week', label: t('agenda.week') },
    { view: 'month', label: t('agenda.month') },
  ];

  // Get selected date jobs for the timeline
  const selectedDateJobs = useMemo(() => 
    jobs.filter(j => j.date === format(selectedDate, 'yyyy-MM-dd'))
      .sort((a, b) => a.time.localeCompare(b.time)),
    [jobs, selectedDate]
  );

  // Day summary
  const daySummary = useMemo(() => {
    const total = selectedDateJobs.length;
    const totalEarnings = selectedDateJobs.reduce((sum, j) => sum + (j.price || 0), 0);
    return { total, totalEarnings };
  }, [selectedDateJobs]);

  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border/30 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t('agenda.subtitle')}</p>
            <h1 className="font-bold text-foreground text-2xl">{t('agenda.title')}</h1>
          </div>
          <button
            onClick={() => setShowAddJobModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/30"
          >
            <Plus size={14} /> {t('agenda.addJob')}
          </button>
        </div>
        
        {/* View Toggle */}
        <div className="bg-muted p-1 rounded-xl flex">
          {viewButtons.map(({ view, label }) => (
            <button
              key={view}
              onClick={() => setCalendarView(view)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                ${calendarView === view 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <AddJobModal
        open={showAddJobModal}
        onOpenChange={setShowAddJobModal}
        properties={properties}
        employees={employees}
        onAddJob={handleAddJob}
      />
      
      <div className="px-6 py-4 space-y-6">
        {/* Calendar Navigation */}
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 p-4">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigate('prev')}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-semibold text-foreground">{getHeaderTitle()}</h2>
            <button 
              onClick={() => navigate('next')}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          
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

        {/* Day Timeline */}
        {calendarView !== 'day' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-foreground text-lg">
                  {format(selectedDate, 'EEEE, d MMM')}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {daySummary.total} jobs • ${daySummary.totalEarnings} previsto
                </p>
              </div>
              {selectedDateJobs.length > 0 && (
                <span className="text-xs font-medium text-success bg-success/10 px-3 py-1 rounded-full">
                  <Check size={10} className="inline mr-1" />
                  {selectedDateJobs.filter(j => j.status === JobStatus.COMPLETED).length}/{selectedDateJobs.length}
                </span>
              )}
            </div>

            <div className="relative space-y-6">
              {selectedDateJobs.map((job, idx) => {
                const isInProgress = job.status === JobStatus.IN_PROGRESS;
                const isCompleted = job.status === JobStatus.COMPLETED;
                const property = properties.find(p => p.id === job.propertyId);

                return (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="relative pl-14"
                  >
                    {/* Timeline connector */}
                    {idx < selectedDateJobs.length - 1 && (
                      <div className="absolute left-[44px] top-12 bottom-[-24px] w-0.5 bg-gradient-to-b from-primary/40 to-border/30" />
                    )}

                    {/* Time label */}
                    <div className="absolute left-0 top-0 w-12 text-center">
                      <p className="text-xs font-bold text-foreground">{job.time}</p>
                      {job.checkinDeadline && (
                        <p className="text-[10px] text-muted-foreground">{job.checkinDeadline}</p>
                      )}
                    </div>

                    {/* Timeline dot */}
                    <div className={`absolute left-[38px] top-1 w-5 h-5 rounded-full border-4 border-card shadow flex items-center justify-center z-10
                      ${isCompleted ? 'bg-success' : isInProgress ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}
                    `}>
                      {isCompleted && <Check size={8} className="text-success-foreground" />}
                      {isInProgress && <Play size={8} className="text-primary-foreground fill-primary-foreground" />}
                    </div>

                    {/* Job Card */}
                    <div 
                      className={`bg-card rounded-2xl p-4 shadow-sm cursor-pointer transition-all
                        ${isInProgress 
                          ? 'border-2 border-primary shadow-lg' 
                          : 'border border-border/50'
                        }
                        ${isCompleted ? 'opacity-75' : ''}
                      `}
                      onClick={() => onViewJob(job.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                              ${isCompleted ? 'text-success bg-success/10' : 
                                isInProgress ? 'text-primary-foreground bg-gradient-to-r from-primary to-primary/80' : 
                                'text-muted-foreground bg-muted'}
                            `}>
                              {isCompleted ? 'CONCLUÍDO' : isInProgress ? 'EM ANDAMENTO' : 'AGENDADO'}
                            </span>
                          </div>
                          <h3 className="font-bold text-foreground text-lg">{job.clientName}</h3>
                          <button
                            onClick={(e) => { e.stopPropagation(); openAddressInMaps(job.address); }}
                            className="text-xs text-muted-foreground mt-1 flex items-center gap-1 underline decoration-dotted hover:text-primary transition-colors"
                          >
                            <MapPin size={10} /> {job.address}
                            <ExternalLink size={9} className="opacity-50" />
                          </button>
                        </div>
                        <div className="text-right">
                          {job.price && <p className="font-bold text-primary text-xl">${job.price}</p>}
                        </div>
                      </div>

                      {/* Progress bar for in-progress */}
                      {isInProgress && (
                        <div className="mt-3">
                          <div className="bg-muted rounded-full h-2 mb-1 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full relative" style={{ width: '65%' }}>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Property details */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {property?.bedrooms && <span className="flex items-center gap-1"><Bed size={12} /> {property.bedrooms}</span>}
                          {property?.bathrooms && <span className="flex items-center gap-1"><Bath size={12} /> {property.bathrooms}</span>}
                        </div>
                        {isInProgress && onStartJob && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onStartJob(job.id); }}
                            className="px-4 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
                          >
                            Continuar
                          </button>
                        )}
                      </div>

                      {/* Scheduled actions */}
                      {job.status === JobStatus.SCHEDULED && (
                        <div className="mt-3 pt-3 border-t border-border/30 flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onStartJob?.(job.id); }}
                            className="flex-1 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg text-xs font-medium"
                          >
                            <Play size={10} className="inline mr-1 fill-primary-foreground" /> Iniciar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Travel time between jobs */}
                    {idx < selectedDateJobs.length - 1 && (
                      <div className="flex items-center gap-3 text-xs text-muted-foreground ml-4 mt-3">
                        <Car size={12} />
                        <span>~15 min</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {selectedDateJobs.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card rounded-2xl p-6 text-center shadow-sm border border-border/50"
                >
                  <p className="text-muted-foreground text-sm">{t('agenda.noJobs')}</p>
                </motion.div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
