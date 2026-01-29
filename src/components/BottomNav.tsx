import { Home, Calendar, Building2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { ViewState } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { smoothSpring, rippleEffect } from '@/lib/animations';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const BottomNav = ({ currentView, onNavigate }: BottomNavProps) => {
  const { t } = useLanguage();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; itemId: ViewState }[]>([]);
  
  const navItems = [
    { id: 'DASHBOARD' as ViewState, icon: Home, label: t('nav.dashboard') },
    { id: 'AGENDA' as ViewState, icon: Calendar, label: t('nav.agenda') },
    { id: 'PROPERTIES' as ViewState, icon: Building2, label: t('nav.properties') },
    { id: 'SETTINGS' as ViewState, icon: Settings, label: t('nav.settings') },
  ];

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, itemId: ViewState) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    triggerHaptic();
    
    const rippleId = Date.now();
    setRipples(prev => [...prev, { id: rippleId, x, y, itemId }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 600);
    
    onNavigate(itemId);
  };

  return (
    <motion.nav 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...smoothSpring, delay: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 md:left-1/2 md:-translate-x-1/2 md:w-[375px]"
    >
      <div className="glass-panel flex justify-between items-center py-2 px-3">
        {navItems.map((item, index) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              onClick={(e) => handleClick(e, item.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileTap={{ scale: 0.9 }}
              className="relative flex flex-col items-center justify-center gap-1.5 min-w-[72px] min-h-[56px] py-2 px-3 rounded-xl transition-all overflow-hidden"
            >
              <AnimatePresence>
                {ripples
                  .filter(r => r.itemId === item.id)
                  .map(ripple => (
                    <motion.span
                      key={ripple.id}
                      variants={rippleEffect}
                      initial="initial"
                      animate="animate"
                      exit={{ opacity: 0 }}
                      className="absolute rounded-full bg-primary/30 pointer-events-none"
                      style={{
                        left: ripple.x - 10,
                        top: ripple.y - 10,
                        width: 20,
                        height: 20,
                      }}
                    />
                  ))}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
              <motion.div
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0 
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Icon 
                  size={22} 
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
              </motion.div>
              <motion.span 
                animate={{ 
                  opacity: isActive ? 1 : 0.7,
                  scale: isActive ? 1 : 0.95
                }}
                className={`relative z-10 text-[10px] font-semibold uppercase tracking-wider text-center ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
};
