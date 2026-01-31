import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

type TransitionDirection = 'left' | 'right' | 'up' | 'down' | 'fade' | 'scale';

interface PageTransitionProps {
  children: ReactNode;
  direction?: TransitionDirection;
  className?: string;
}

const getVariants = (direction: TransitionDirection): Variants => {
  const distance = 30;
  const springConfig = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  };

  switch (direction) {
    case 'left':
      return {
        initial: { opacity: 0, x: -distance },
        animate: { 
          opacity: 1, 
          x: 0,
          transition: springConfig
        },
        exit: { 
          opacity: 0, 
          x: distance,
          transition: { duration: 0.2 }
        },
      };
    case 'right':
      return {
        initial: { opacity: 0, x: distance },
        animate: { 
          opacity: 1, 
          x: 0,
          transition: springConfig
        },
        exit: { 
          opacity: 0, 
          x: -distance,
          transition: { duration: 0.2 }
        },
      };
    case 'up':
      return {
        initial: { opacity: 0, y: -distance },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: springConfig
        },
        exit: { 
          opacity: 0, 
          y: distance,
          transition: { duration: 0.2 }
        },
      };
    case 'down':
      return {
        initial: { opacity: 0, y: distance },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: springConfig
        },
        exit: { 
          opacity: 0, 
          y: -distance,
          transition: { duration: 0.2 }
        },
      };
    case 'scale':
      return {
        initial: { opacity: 0, scale: 0.92 },
        animate: { 
          opacity: 1, 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
          }
        },
        exit: { 
          opacity: 0, 
          scale: 0.95,
          transition: { duration: 0.15 }
        },
      };
    case 'fade':
    default:
      return {
        initial: { opacity: 0 },
        animate: { 
          opacity: 1,
          transition: { duration: 0.25 }
        },
        exit: { 
          opacity: 0,
          transition: { duration: 0.15 }
        },
      };
  }
};

export const PageTransition = ({ 
  children, 
  direction = 'fade',
  className = ''
}: PageTransitionProps) => {
  const variants = getVariants(direction);

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Navigation order for determining slide direction
const viewOrder = ['DASHBOARD', 'AGENDA', 'PROPERTIES', 'SETTINGS'];

export const getTransitionDirection = (
  currentView: string, 
  previousView?: string
): TransitionDirection => {
  // Detail views slide from right
  if (['PROPERTY_DETAILS', 'JOB_DETAILS', 'FINANCE'].includes(currentView)) {
    return 'right';
  }
  
  // Execution view scales in
  if (currentView === 'EXECUTION') {
    return 'scale';
  }
  
  // Main navigation - determine based on order
  if (previousView) {
    const currentIndex = viewOrder.indexOf(currentView);
    const previousIndex = viewOrder.indexOf(previousView);
    
    if (currentIndex !== -1 && previousIndex !== -1) {
      return currentIndex > previousIndex ? 'right' : 'left';
    }
  }
  
  return 'fade';
};
