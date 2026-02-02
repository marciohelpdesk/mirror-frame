import { Home, Calendar, Building2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import type { ViewState } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const BottomNav = ({ currentView, onNavigate }: BottomNavProps) => {
  const { t } = useLanguage();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; itemId: ViewState }[]>([]);
  const [hoveredItem, setHoveredItem] = useState<ViewState | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  
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

  const activeIndex = navItems.findIndex(item => item.id === currentView);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pb-safe md:left-1/2 md:-translate-x-1/2 md:w-[375px]">
      <motion.div 
        ref={navRef}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          delay: 0.2 
        }}
        className="glass-panel-elevated flex justify-between items-center py-2 px-3 relative"
      >
        {/* Animated background indicator */}
        <motion.div
          className="absolute h-[calc(100%-16px)] bg-primary/15 rounded-xl pointer-events-none"
          initial={false}
          animate={{
            x: activeIndex * (navRef.current ? navRef.current.offsetWidth / 4 : 82) + 6,
            width: navRef.current ? (navRef.current.offsetWidth / 4) - 12 : 70,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
          style={{ top: 8 }}
        />

        {/* Glow effect under active item */}
        <motion.div
          className="absolute -bottom-1 h-4 bg-primary/30 rounded-full blur-xl pointer-events-none"
          initial={false}
          animate={{
            x: activeIndex * (navRef.current ? navRef.current.offsetWidth / 4 : 82) + 20,
            width: 40,
            opacity: 0.8,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
        />

        {navItems.map((item, index) => {
          const isActive = currentView === item.id;
          const isHovered = hoveredItem === item.id;
          const Icon = item.icon;
          
          return (
            <motion.button
              key={item.id}
              onClick={(e) => handleClick(e, item.id)}
              onHoverStart={() => setHoveredItem(item.id)}
              onHoverEnd={() => setHoveredItem(null)}
              className="relative flex flex-col items-center justify-center gap-1.5 min-w-[72px] min-h-[56px] py-2 px-3 rounded-xl transition-colors overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Ripple effects */}
              <AnimatePresence>
                {ripples
                  .filter(r => r.itemId === item.id)
                  .map(ripple => (
                    <motion.span
                      key={ripple.id}
                      initial={{ scale: 0, opacity: 0.5 }}
                      animate={{ scale: 4, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
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

              {/* Icon with animation */}
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : isHovered ? 1.05 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Icon 
                  size={22} 
                  className={`relative z-10 transition-colors duration-200 ${
                    isActive 
                      ? 'text-primary' 
                      : isHovered 
                        ? 'text-primary/70' 
                        : 'text-muted-foreground'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>

              {/* Label with animation */}
              <motion.span 
                animate={{
                  scale: isActive ? 1.05 : 1,
                  opacity: isActive ? 1 : 0.7,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`relative z-10 text-[10px] font-semibold uppercase tracking-wider text-center transition-colors duration-200 ${
                  isActive 
                    ? 'text-primary' 
                    : isHovered 
                      ? 'text-primary/70' 
                      : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </motion.span>

              {/* Active dot indicator */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute -bottom-0.5 w-1 h-1 bg-primary rounded-full"
                  />
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </motion.div>
    </nav>
  );
};
