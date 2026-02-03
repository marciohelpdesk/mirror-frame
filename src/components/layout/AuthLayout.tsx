import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BackgroundEffects } from '@/components/BackgroundEffects';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <>
      {/* Fixed Florida Sky Background */}
      <div className="bg-florida-sky-fixed" />
      
      {/* Main Content Container */}
      <div className="min-h-screen relative z-10 md:flex md:items-center md:justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mobile-frame relative flex flex-col"
        >
          <BackgroundEffects />
          {children}
        </motion.div>
      </div>
    </>
  );
};
