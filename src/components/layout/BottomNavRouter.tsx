import { Home, Calendar, Building2, Settings, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
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

  return (
    <nav className="relative z-50 px-3 pb-3 pb-safe shrink-0">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
        className="flex justify-between items-center py-2 px-4 relative"
        style={{
          background: 'linear-gradient(165deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.92) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          borderRadius: '1.25rem',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1)',
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center py-2 px-3"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground'
              }`}>
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.5} />
              </div>
            </NavLink>
          );
        })}
      </motion.div>
    </nav>
  );
};
