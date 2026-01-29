import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title?: string;
  subtitle?: string;
  rightElement?: ReactNode;
  leftElement?: ReactNode;
}

export const PageHeader = ({ title, subtitle, rightElement, leftElement }: PageHeaderProps) => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex justify-between items-start p-6 pb-4 pt-safe"
    >
      <div className="flex items-center gap-3">
        {leftElement}
        <div>
          {subtitle && (
            <motion.p 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
            >
              {subtitle}
            </motion.p>
          )}
          {title && (
            <motion.h1 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="text-2xl font-light text-foreground tracking-tight"
            >
              {title}
            </motion.h1>
          )}
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
      >
        {rightElement}
      </motion.div>
    </motion.header>
  );
};
