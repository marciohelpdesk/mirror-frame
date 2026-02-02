import { motion, Easing } from 'framer-motion';

const shimmerEase: Easing = "linear";

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: shimmerEase,
  },
};

interface SkeletonPulseProps {
  className?: string;
  style?: React.CSSProperties;
}

const SkeletonPulse = ({ className, style }: SkeletonPulseProps) => (
  <motion.div
    className={`bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%] rounded-xl ${className}`}
    animate={shimmer.animate}
    transition={shimmer.transition}
    style={style}
  />
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
};

export const DashboardSkeleton = () => {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full relative z-10 overflow-hidden pb-32 px-6 pt-6"
    >
      {/* Header Skeleton */}
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
        <div className="space-y-2">
          <SkeletonPulse className="h-8 w-40" />
          <SkeletonPulse className="h-4 w-32" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonPulse className="w-10 h-10 rounded-full" />
          <SkeletonPulse className="w-12 h-12 rounded-full" />
        </div>
      </motion.div>

      {/* Stats Grid Skeleton */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel p-4 space-y-3">
            <div className="flex items-center gap-2">
              <SkeletonPulse className="w-8 h-8 rounded-lg" />
              <SkeletonPulse className="h-3 w-16" />
            </div>
            <SkeletonPulse className="h-8 w-12" />
          </div>
        ))}
      </motion.div>

      {/* Progress Circle Skeleton */}
      <motion.div variants={itemVariants} className="flex justify-center mb-6">
        <SkeletonPulse className="w-32 h-32 rounded-full" />
      </motion.div>

      {/* Next Job Section Skeleton */}
      <motion.div variants={itemVariants} className="space-y-3 mb-6">
        <SkeletonPulse className="h-3 w-28" />
        <div className="glass-panel p-4 space-y-3">
          <div className="flex items-center gap-3">
            <SkeletonPulse className="w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <SkeletonPulse className="h-5 w-3/4" />
              <SkeletonPulse className="h-4 w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonPulse className="h-10 flex-1 rounded-xl" />
            <SkeletonPulse className="h-10 flex-1 rounded-xl" />
          </div>
        </div>
      </motion.div>

      {/* Weekly Progress Skeleton */}
      <motion.div variants={itemVariants} className="glass-panel p-4 space-y-3">
        <SkeletonPulse className="h-3 w-32" />
        <div className="flex justify-between items-end h-16">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <SkeletonPulse 
              key={i} 
              className="w-8 rounded-t-lg" 
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const JobCardSkeleton = () => (
  <motion.div
    variants={itemVariants}
    className="glass-panel p-4 space-y-3"
  >
    <div className="flex items-start gap-3">
      <SkeletonPulse className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonPulse className="h-5 w-3/4" />
        <SkeletonPulse className="h-4 w-1/2" />
      </div>
      <SkeletonPulse className="w-16 h-6 rounded-full" />
    </div>
  </motion.div>
);

export const PropertyCardSkeleton = () => (
  <motion.div
    variants={itemVariants}
    className="glass-panel overflow-hidden"
  >
    <SkeletonPulse className="w-full h-32" />
    <div className="p-4 space-y-2">
      <SkeletonPulse className="h-5 w-3/4" />
      <SkeletonPulse className="h-4 w-1/2" />
      <div className="flex gap-2 mt-3">
        <SkeletonPulse className="h-6 w-16 rounded-full" />
        <SkeletonPulse className="h-6 w-20 rounded-full" />
      </div>
    </div>
  </motion.div>
);

export const AgendaSkeleton = () => (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="flex flex-col h-full relative z-10 overflow-hidden pb-32 px-6 pt-6"
  >
    {/* Header */}
    <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
      <div className="space-y-2">
        <SkeletonPulse className="h-8 w-32" />
        <SkeletonPulse className="h-4 w-24" />
      </div>
      <SkeletonPulse className="w-10 h-10 rounded-xl" />
    </motion.div>

    {/* Calendar Navigation */}
    <motion.div variants={itemVariants} className="flex justify-between items-center mb-4">
      <SkeletonPulse className="w-8 h-8 rounded-lg" />
      <SkeletonPulse className="h-6 w-32" />
      <SkeletonPulse className="w-8 h-8 rounded-lg" />
    </motion.div>

    {/* Week Days */}
    <motion.div variants={itemVariants} className="grid grid-cols-7 gap-1 mb-6">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <SkeletonPulse className="h-3 w-6" />
          <SkeletonPulse className="w-10 h-10 rounded-full" />
        </div>
      ))}
    </motion.div>

    {/* Jobs List */}
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  </motion.div>
);

export const PropertiesSkeleton = () => (
  <motion.div 
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="flex flex-col h-full relative z-10 overflow-hidden pb-32 px-6 pt-6"
  >
    {/* Header */}
    <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
      <div className="space-y-2">
        <SkeletonPulse className="h-8 w-32" />
        <SkeletonPulse className="h-4 w-24" />
      </div>
      <SkeletonPulse className="w-10 h-10 rounded-xl" />
    </motion.div>

    {/* Search Bar */}
    <motion.div variants={itemVariants} className="mb-4">
      <SkeletonPulse className="h-12 w-full rounded-xl" />
    </motion.div>

    {/* Properties Grid */}
    <div className="grid grid-cols-1 gap-4">
      {[1, 2, 3].map((i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  </motion.div>
);
