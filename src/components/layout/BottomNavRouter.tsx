import { Home, Calendar, Building2, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutEffect, useState, useRef, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface NavItem {
  path: string;
  icon: typeof Home;
  labelKey: string;
}

export const BottomNavRouter = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; path: string }[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  
  const navItems: NavItem[] = [
    { path: '/dashboard', icon: Home, labelKey: 'nav.dashboard' },
    { path: '/agenda', icon: Calendar, labelKey: 'nav.agenda' },
    { path: '/properties', icon: Building2, labelKey: 'nav.properties' },
    { path: '/settings', icon: Settings, labelKey: 'nav.settings' },
  ];

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    const link = e.currentTarget;
    const rect = link.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    triggerHaptic();
    
    const rippleId = Date.now();
    setRipples(prev => [...prev, { id: rippleId, x, y, path }]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== rippleId));
    }, 600);
  };

  const activeIndex = navItems.findIndex(item => 
    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  );

  const updateIndicator = useCallback(() => {
    const activeItem = itemRefs.current[activeIndex];
    const container = navRef.current;
    
    if (activeItem && container && activeIndex >= 0) {
      const itemRect = activeItem.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      setIndicatorStyle({
        left: itemRect.left - containerRect.left,
        width: itemRect.width,
      });
    }
  }, [activeIndex]);

  useLayoutEffect(() => {
    const el = navRef.current;
    if (!el) return;

    // Initial measurement
    updateIndicator();

    // Re-measure on resize
    const ro = new ResizeObserver(() => {
      updateIndicator();
    });
    ro.observe(el);
    
    return () => ro.disconnect();
  }, [updateIndicator]);

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
          className="absolute h-[calc(100%-16px)] bg-primary/15 rounded-xl pointer-events-none top-2"
          initial={false}
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
            opacity: activeIndex >= 0 ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
        />

        {/* Glow effect under active item */}
        <motion.div
          className="absolute -bottom-1 h-4 bg-primary/30 rounded-full blur-xl pointer-events-none"
          initial={false}
          animate={{
            left: indicatorStyle.left + (indicatorStyle.width / 2) - 20,
            width: indicatorStyle.width > 0 ? 40 : 0,
            opacity: activeIndex >= 0 ? 0.8 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 35,
          }}
        />

        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const isHovered = hoveredItem === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              ref={(el) => { itemRefs.current[index] = el; }}
              to={item.path}
              onClick={(e) => handleClick(e, item.path)}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative flex flex-col items-center justify-center gap-1.5 min-w-[72px] min-h-[56px] py-2 px-3 rounded-xl transition-colors overflow-hidden"
            >
              {/* Ripple effects */}
              <AnimatePresence>
                {ripples
                  .filter(r => r.path === item.path)
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
                {t(item.labelKey)}
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
            </NavLink>
          );
        })}
      </motion.div>
    </nav>
  );
};
