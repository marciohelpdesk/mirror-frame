import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';
import { cardHover } from '@/lib/animations';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  className?: string;
  enableHover?: boolean;
  enableTap?: boolean;
  glassEffect?: boolean;
}

export const AnimatedCard = forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, enableHover = true, enableTap = true, glassEffect = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={cardHover}
        initial="initial"
        whileHover={enableHover ? "hover" : undefined}
        whileTap={enableTap ? "tap" : undefined}
        className={cn(
          glassEffect && 'glass-panel',
          'cursor-pointer transition-shadow',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';
