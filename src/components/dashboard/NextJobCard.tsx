import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Play, ArrowRight, ExternalLink } from 'lucide-react';
import { openAddressInMaps } from '@/lib/utils';
import { Job, Property } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface NextJobCardProps {
  job: Job;
  property?: Property;
  onStart: (jobId: string) => void;
  onView: (jobId: string) => void;
}

export const NextJobCard = ({ job, property, onStart, onView }: NextJobCardProps) => {
  const { t } = useLanguage();
  
  // Calculate time until job
  const getTimeUntil = () => {
    const now = new Date();
    const [hours, minutes] = job.time.split(':').map(Number);
    const jobDate = new Date(job.date);
    jobDate.setHours(hours, minutes, 0, 0);
    
    const diff = jobDate.getTime() - now.getTime();
    if (diff < 0) return t('dashboard.now') || 'Now';
    
    const hoursUntil = Math.floor(diff / (1000 * 60 * 60));
    const minutesUntil = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hoursUntil > 0) {
      return `${hoursUntil}h ${minutesUntil}min`;
    }
    return `${minutesUntil}min`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Background gradient with property image */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-sky-cyan" />
      
      {property?.photo && (
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30"
          style={{ backgroundImage: `url(${property.photo})` }}
        />
      )}
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      
      {/* Content */}
      <div className="relative p-5">
        {/* Header with time badge */}
        <div className="flex justify-between items-start mb-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30"
          >
            <span className="text-white text-sm font-semibold flex items-center gap-1.5">
              <Clock size={14} />
              {job.time}
            </span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30"
          >
            <span className="text-white text-xs font-medium">
              ⏱️ {t('dashboard.in') || 'Em'} {getTimeUntil()}
            </span>
          </motion.div>
        </div>

        {/* Property name and address */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h3 className="text-2xl font-bold text-white mb-1">
            {job.clientName}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); openAddressInMaps(job.address); }}
            className="text-white/80 text-sm flex items-center gap-1.5 underline decoration-dotted hover:text-white transition-colors"
          >
            <MapPin size={14} />
            {job.address}
            <ExternalLink size={10} className="opacity-60" />
          </button>
        </motion.div>

        {/* Job details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex gap-4 mb-5"
        >
          {job.assignedTo && (
            <div className="flex items-center gap-1.5 text-white/70 text-sm">
              <Users size={14} />
              <span>{job.assignedTo}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-white/70 text-sm">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
              {job.type}
            </span>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex gap-3"
        >
          <button
            onClick={() => onStart(job.id)}
            className="flex-1 bg-white text-primary py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-black/20 active:scale-95 transition-transform"
          >
            <Play size={18} className="fill-current" />
            {t('jobs.startChecklist') || 'Iniciar Checklist'}
          </button>
          
          <button
            onClick={() => onView(job.id)}
            className="w-14 bg-white/20 backdrop-blur-sm text-white py-3.5 rounded-2xl flex items-center justify-center border border-white/30 active:scale-95 transition-transform"
          >
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};
