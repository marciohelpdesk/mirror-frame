import { motion } from 'framer-motion';
import { Check, Clock, Camera, ClipboardCheck, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Job, ChecklistSection } from '@/types';
import { useState } from 'react';

interface SummaryStepProps {
  job: Job;
  onComplete: (note?: string) => void;
  onBack: () => void;
}

export const SummaryStep = ({ job, onComplete, onBack }: SummaryStepProps) => {
  const [note, setNote] = useState(job.reportNote || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate stats
  const totalTasks = job.checklist.reduce((acc, s) => acc + s.items.length, 0);
  const completedTasks = job.checklist.reduce(
    (acc, s) => acc + s.items.filter(i => i.completed).length,
    0
  );

  const duration = job.startTime
    ? Math.floor((Date.now() - job.startTime) / 60000)
    : 0;

  const formatDuration = (minutes: number) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} min`;
  };

  const handleComplete = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(note);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-4 py-3 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary flex items-center justify-center cyan-glow"
        >
          <Check className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-xl font-semibold text-foreground">Great Work!</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your cleaning summary
        </p>
      </div>

      {/* Stats */}
      <div className="px-4 flex-1 overflow-y-auto hide-scrollbar">
        <div className="glass-panel p-4 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">{job.clientName}</h3>
          <p className="text-xs text-muted-foreground mb-4">{job.address}</p>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Clock}
              label="Duration"
              value={formatDuration(duration)}
              color="primary"
            />
            <StatCard
              icon={ClipboardCheck}
              label="Tasks"
              value={`${completedTasks}/${totalTasks}`}
              color="success"
            />
            <StatCard
              icon={Camera}
              label="Before"
              value={`${job.photosBefore.length} photos`}
              color="amber"
            />
            <StatCard
              icon={Camera}
              label="After"
              value={`${job.photosAfter.length} photos`}
              color="emerald"
            />
          </div>
        </div>

        {/* Photo Preview */}
        {(job.photosBefore.length > 0 || job.photosAfter.length > 0) && (
          <div className="glass-panel p-4 mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Photo Documentation</h3>
            
            {job.photosBefore.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Before ({job.photosBefore.length})</p>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {job.photosBefore.slice(0, 4).map((photo, i) => (
                    <div key={i} className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {job.photosAfter.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">After ({job.photosAfter.length})</p>
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  {job.photosAfter.slice(0, 4).map((photo, i) => (
                    <div key={i} className="w-16 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Note */}
        <div className="glass-panel p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Add a Note (optional)</h3>
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any issues, special notes, or feedback..."
            className="min-h-[80px] resize-none bg-card/50 border-muted"
          />
        </div>

        {/* Earnings Preview */}
        {job.price && (
          <div className="glass-panel p-4 mb-4 border-l-4 border-l-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Job Earnings</p>
                <p className="text-2xl font-bold text-foreground">${job.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5 fill-current" />
                <Star className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-xl"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground gap-2"
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Check className="w-5 h-5" />
            </motion.div>
          ) : (
            <>
              Complete Job
              <Check className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'primary' | 'success' | 'amber' | 'emerald';
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    amber: 'bg-warning/10 text-warning',
    emerald: 'bg-success/10 text-success',
  };

  return (
    <div className="bg-card/50 rounded-xl p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
};
