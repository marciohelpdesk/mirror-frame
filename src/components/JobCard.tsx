import { Clock, MapPin, Play, Check, FileText, ExternalLink } from 'lucide-react';
import { openAddressInMaps } from '@/lib/utils';
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
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        mass: 0.8
      }}
      className="glass-panel p-5 cursor-pointer group"
      onClick={() => onView(job.id)}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-foreground text-lg leading-tight group-hover:text-primary transition-colors duration-200">
            {job.clientName}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); openAddressInMaps(job.address); }}
            className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1 underline decoration-dotted hover:text-primary transition-colors"
          >
            <MapPin size={14} />
            <span>{job.address}</span>
            <ExternalLink size={10} className="opacity-50" />
          </button>
        </div>
        <motion.span 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusClasses[job.status]}`}
        >
          {statusLabels[job.status]}
        </motion.span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="group-hover:text-primary/60 transition-colors" />
            <span>
              {job.checkoutTime || job.time}
              {job.checkinDeadline && ` → ${job.checkinDeadline}`}
            </span>
          </div>
          {job.status === JobStatus.IN_PROGRESS && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mono text-primary font-medium"
            >
              {formatTime(elapsed)}
            </motion.span>
          )}
        </div>
        
        {job.status === JobStatus.SCHEDULED && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onStart(job.id);
            }}
            className="liquid-btn w-10 h-10 text-primary"
          >
            <Play size={18} fill="currentColor" />
          </motion.button>
        )}
        
        {job.status === JobStatus.COMPLETED && (
          <div className="flex items-center gap-2">
            {job.reportPdfUrl && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500 }}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center" 
                title="Relatório disponível"
              >
                <FileText size={14} className="text-primary" />
              </motion.div>
            )}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.05 }}
              className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center"
            >
              <Check size={18} className="text-success" />
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
