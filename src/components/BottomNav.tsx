import { Home, Calendar, Building2, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ViewState } from '@/types';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const navItems = [
  { id: 'DASHBOARD' as ViewState, icon: Home, label: 'Home' },
  { id: 'AGENDA' as ViewState, icon: Calendar, label: 'Agenda' },
  { id: 'PROPERTIES' as ViewState, icon: Building2, label: 'Properties' },
  { id: 'SETTINGS' as ViewState, icon: Settings, label: 'Settings' },
];

export const BottomNav = ({ currentView, onNavigate }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 md:left-1/2 md:-translate-x-1/2 md:w-[375px]">
      <div className="glass-panel flex justify-between items-center py-2 px-3">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center justify-center gap-1.5 min-w-[72px] min-h-[56px] py-2 px-3 rounded-xl transition-all active:scale-95"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon 
                size={22} 
                className={`relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span className={`relative z-10 text-[10px] font-semibold uppercase tracking-wider text-center ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
