import { Home, Calendar, Building2, Settings, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutEffect, useState, useRef, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavItem {
  path: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { path: '/dashboard', icon: Home },
  { path: '/agenda', icon: Calendar },
  { path: '/reports', icon: FileText },
  { path: '/properties', icon: Building2 },
  { path: '/settings', icon: Settings },
];

export const BottomNavRouter = () => {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

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
    updateIndicator();
    const ro = new ResizeObserver(() => updateIndicator());
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateIndicator]);

  return (
    <nav className="relative z-50 px-3 pb-3 pb-safe shrink-0">
      <motion.div
        ref={navRef}
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        className="flex justify-between items-end py-2 px-3 relative"
        style={{
          background: 'linear-gradient(165deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.92) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          const isHomeIcon = index === 0;

          if (isHomeIcon) {
            return (
              <NavLink
                key={item.path}
                ref={(el) => { itemRefs.current[index] = el; }}
                to={item.path}
                className="relative flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-2 px-3 rounded-xl -mt-6"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-br from-primary to-primary/80 shadow-primary/30' 
                    : 'bg-gradient-to-br from-primary/80 to-primary/60 shadow-primary/20'
                }`}>
                  <Icon size={24} className="text-white" strokeWidth={isActive ? 2.2 : 1.5} />
                </div>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              ref={(el) => { itemRefs.current[index] = el; }}
              to={item.path}
              className="relative flex flex-col items-center justify-center min-w-[48px] min-h-[44px] py-2 px-3 rounded-xl"
            >
              <Icon
                size={22}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
                strokeWidth={isActive ? 2.2 : 1.5}
              />
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"
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
