import { forwardRef } from 'react';
import { Clock, MapPin, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { Job, JobStatus } from '@/types';

interface CalendarJobItemProps {
  job: Job;
  compact?: boolean;
  onView: (jobId: string) => void;
  onDragStart?: (e: React.DragEvent, job: Job) => void;
  draggable?: boolean;
}

export const CalendarJobItem = forwardRef<HTMLDivElement, CalendarJobItemProps>(
  ({ job, compact = false, onView, onDragStart, draggable = true }, ref) => {
    const statusColors = {
      [JobStatus.SCHEDULED]: 'bg-warning/20 border-warning/40',
      [JobStatus.IN_PROGRESS]: 'bg-primary/20 border-primary/40',
      [JobStatus.COMPLETED]: 'bg-success/20 border-success/40',
    };

    const dotColors = {
      [JobStatus.SCHEDULED]: 'bg-warning',
      [JobStatus.IN_PROGRESS]: 'bg-primary',
      [JobStatus.COMPLETED]: 'bg-success',
    };

    if (compact) {
      return (
        <motion.div
          ref={ref}
          layout
          draggable={draggable && job.status === JobStatus.SCHEDULED}
          onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent, job)}
          onClick={() => onView(job.id)}
          className={`
            px-2 py-1 rounded-md text-xs cursor-pointer truncate border
            ${statusColors[job.status]}
            ${draggable && job.status === JobStatus.SCHEDULED ? 'cursor-grab active:cursor-grabbing' : ''}
          `}
        >
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${dotColors[job.status]}`} />
            <span className="truncate font-medium text-foreground">{job.time}</span>
            <span className="truncate text-muted-foreground">{job.clientName}</span>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        ref={ref}
        layout
        draggable={draggable && job.status === JobStatus.SCHEDULED}
        onDragStart={(e) => onDragStart?.(e as unknown as React.DragEvent, job)}
        onClick={() => onView(job.id)}
        className={`
          glass-panel p-3 cursor-pointer border-l-4 
          ${job.status === JobStatus.SCHEDULED ? 'border-l-warning' : ''}
          ${job.status === JobStatus.IN_PROGRESS ? 'border-l-primary' : ''}
          ${job.status === JobStatus.COMPLETED ? 'border-l-success' : ''}
          ${draggable && job.status === JobStatus.SCHEDULED ? 'cursor-grab active:cursor-grabbing' : ''}
          hover:scale-[1.02] transition-transform
        `}
      >
        <div className="flex items-start gap-2">
          {draggable && job.status === JobStatus.SCHEDULED && (
            <GripVertical size={16} className="text-muted-foreground mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground text-sm truncate">{job.clientName}</h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{job.time}</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <MapPin size={12} className="shrink-0" />
                <span className="truncate">{job.address}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

CalendarJobItem.displayName = 'CalendarJobItem';
