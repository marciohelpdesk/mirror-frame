import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, Children, isValidElement, cloneElement } from 'react';
import { staggerContainer, staggerItem, fastStaggerContainer } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  fast?: boolean;
}

export const AnimatedList = ({ children, className, fast = false }: AnimatedListProps) => {
  return (
    <motion.div
      variants={fast ? fastStaggerContainer : staggerContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn('space-y-3', className)}
    >
      <AnimatePresence mode="popLayout">
        {Children.map(children, (child, index) => {
          if (!isValidElement(child)) return child;
          
          return (
            <motion.div
              key={child.key || index}
              variants={staggerItem}
              layout
            >
              {child}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};

// For individual items when you need more control
interface AnimatedListItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export const AnimatedListItem = ({ children, className, index = 0 }: AnimatedListItemProps) => {
  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      exit="exit"
      custom={index}
      layout
      className={className}
    >
      {children}
    </motion.div>
  );
};
