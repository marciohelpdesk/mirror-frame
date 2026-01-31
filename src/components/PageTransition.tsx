import { motion, Variants, Transition } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';

type TransitionDirection = 'left' | 'right' | 'up' | 'down' | 'fade' | 'scale';

interface PageTransitionProps {
  children: ReactNode;
  direction?: TransitionDirection;
  className?: string;
}

const getVariants = (direction: TransitionDirection): Variants => {
  const distance = 20;
  
  // Smoother transition config using named easing
  const enterTransition: Transition = {
    duration: 0.25,
    ease: "easeOut",
  };
  
  const exitTransition: Transition = {
    duration: 0.15,
    ease: "easeIn",
  };

  switch (direction) {
    case 'left':
      return {
        initial: { opacity: 0, x: -distance },
        animate: { 
          opacity: 1, 
          x: 0,
          transition: enterTransition
        },
        exit: { 
          opacity: 0, 
          x: distance,
          transition: exitTransition
        },
      };
    case 'right':
      return {
        initial: { opacity: 0, x: distance },
        animate: { 
          opacity: 1, 
          x: 0,
          transition: enterTransition
        },
        exit: { 
          opacity: 0, 
          x: -distance,
          transition: exitTransition
        },
      };
    case 'up':
      return {
        initial: { opacity: 0, y: -distance },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: enterTransition
        },
        exit: { 
          opacity: 0, 
          y: distance,
          transition: exitTransition
        },
      };
    case 'down':
      return {
        initial: { opacity: 0, y: distance },
        animate: { 
          opacity: 1, 
          y: 0,
          transition: enterTransition
        },
        exit: { 
          opacity: 0, 
          y: -distance,
          transition: exitTransition
        },
      };
    case 'scale':
      return {
        initial: { opacity: 0, scale: 0.95 },
        animate: { 
          opacity: 1, 
          scale: 1,
          transition: enterTransition
        },
        exit: { 
          opacity: 0, 
          scale: 0.98,
          transition: exitTransition
        },
      };
    case 'fade':
    default:
      return {
        initial: { opacity: 0 },
        animate: { 
          opacity: 1,
          transition: { duration: 0.2 }
        },
        exit: { 
          opacity: 0,
          transition: { duration: 0.12 }
        },
      };
  }
};

// Using forwardRef to properly handle AnimatePresence refs
export const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, direction = 'fade', className = '' }, ref) => {
    const variants = getVariants(direction);

    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
        style={{ 
          willChange: 'opacity, transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {children}
      </motion.div>
    );
  }
);

PageTransition.displayName = 'PageTransition';

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
