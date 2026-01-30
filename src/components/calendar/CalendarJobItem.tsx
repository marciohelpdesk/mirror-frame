import { forwardRef } from 'react';
import { Clock, MapPin, GripVertical, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Job, JobStatus } from '@/types';

interface CalendarJobItemProps {
  job: Job;
  compact?: boolean;
  onView: (jobId: string) => void;
  onDragStart?: (e: React.DragEvent, job: Job) => void;
  draggable?: boolean;
}

const getStatusConfig = (status: JobStatus) => {
  switch (status) {
    case JobStatus.SCHEDULED:
      return {
        bg: 'bg-status-scheduled/10',
        border: 'border-status-scheduled/40',
        dot: 'bg-status-scheduled',
        borderLeft: 'border-l-status-scheduled',
        badge: 'bg-status-scheduled/20 text-status-scheduled',
        label: 'Agendado',
      };
    case JobStatus.IN_PROGRESS:
      return {
        bg: 'bg-status-active/10',
        border: 'border-status-active/40',
        dot: 'bg-status-active',
        borderLeft: 'border-l-status-active',
        badge: 'bg-status-active/20 text-status-active',
        label: 'Em andamento',
      };
    case JobStatus.COMPLETED:
      return {
        bg: 'bg-status-done/10',
        border: 'border-status-done/40',
        dot: 'bg-status-done',
        borderLeft: 'border-l-status-done',
        badge: 'bg-status-done/20 text-status-done',
        label: 'Concluído',
      };
    default:
      return {
        bg: 'bg-muted/10',
        border: 'border-muted/40',
        dot: 'bg-muted',
        borderLeft: 'border-l-muted',
        badge: 'bg-muted/20 text-muted-foreground',
        label: '',
      };
  }
};

export const CalendarJobItem = forwardRef<HTMLDivElement, CalendarJobItemProps>(
  ({ job, compact = false, onView, onDragStart, draggable = true }, ref) => {
    const config = getStatusConfig(job.status);
    const isDraggable = draggable && job.status === JobStatus.SCHEDULED;

    if (compact) {
      return (
        <motion.div
          ref={ref}
          layout
          draggable={isDraggable}
          onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent, job)}
          onClick={() => onView(job.id)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            px-2 py-1.5 rounded-lg text-xs cursor-pointer border
            ${config.bg} ${config.border}
            ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
            transition-all duration-200
          `}
        >
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${config.dot} shrink-0`} />
            <span className="font-semibold text-foreground">
              {job.checkoutTime || job.time}
            </span>
            <span className="truncate text-muted-foreground">{job.clientName}</span>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        layout
        draggable={isDraggable}
        onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent, job)}
        onClick={() => onView(job.id)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`
          glass-panel p-4 cursor-pointer border-l-4 
          ${config.borderLeft}
          ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}
        `}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {isDraggable && (
              <GripVertical size={16} className="text-muted-foreground mt-1 shrink-0 opacity-50" />
            )}
            <div className="flex-1 min-w-0">
              {/* Time and Status */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
                <span className="font-bold text-foreground">
                  {job.checkoutTime || job.time}
                  {job.checkinDeadline && ` → ${job.checkinDeadline}`}
                </span>
              </div>
              
              {/* Property name */}
              <h4 className="font-semibold text-foreground text-base truncate mb-2">
                {job.clientName}
              </h4>
              
              {/* Details */}
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">{job.address}</span>
                </div>
                {job.assignedTo && (
                  <div className="flex items-center gap-1.5">
                    <Users size={12} className="shrink-0" />
                    <span>{job.assignedTo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Status badge */}
          <span className={`
            px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0
            ${config.badge}
          `}>
            {config.label}
          </span>
        </div>
      </motion.div>
    );
  }
);

CalendarJobItem.displayName = 'CalendarJobItem';
