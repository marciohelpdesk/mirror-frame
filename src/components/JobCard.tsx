import { Clock, MapPin, Play, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Job, JobStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface JobCardProps {
  job: Job;
  onStart: (jobId: string) => void;
  onView: (jobId: string) => void;
}

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const JobCard = ({ job, onStart, onView }: JobCardProps) => {
  const { t } = useLanguage();
  const elapsed = job.startTime ? Date.now() - job.startTime : 0;
  
  const statusClasses = {
    [JobStatus.SCHEDULED]: 'status-scheduled',
    [JobStatus.IN_PROGRESS]: 'status-in-progress',
    [JobStatus.COMPLETED]: 'status-completed',
  };
  
  const statusLabels = {
    [JobStatus.SCHEDULED]: t('status.scheduled'),
    [JobStatus.IN_PROGRESS]: t('status.inProgress'),
    [JobStatus.COMPLETED]: t('status.completed'),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 cursor-pointer active:scale-[0.98] transition-transform"
      onClick={() => onView(job.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-foreground text-lg leading-tight">
            {job.clientName}
          </h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
            <MapPin size={14} />
            <span>{job.address}</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusClasses[job.status]}`}>
          {statusLabels[job.status]}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock size={14} />
            <span>{job.time}</span>
          </div>
          {job.status === JobStatus.IN_PROGRESS && (
            <span className="mono text-primary font-medium">
              {formatTime(elapsed)}
            </span>
          )}
        </div>
        
        {job.status === JobStatus.SCHEDULED && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStart(job.id);
            }}
            className="liquid-btn w-10 h-10 text-primary"
          >
            <Play size={18} fill="currentColor" />
          </button>
        )}
        
        {job.status === JobStatus.COMPLETED && (
          <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
            <Check size={18} className="text-success" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
