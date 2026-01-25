import { motion } from 'framer-motion';
import { ChevronRight, LogOut, Wallet, Bell, Shield, HelpCircle } from 'lucide-react';
import { UserProfile, Employee } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { TeamManagement } from '@/components/TeamManagement';

interface SettingsViewProps {
  userProfile: UserProfile;
  employees: Employee[];
  onLogout: () => void;
  onViewFinance: () => void;
  onAddEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}

const settingsItems = [
  { icon: Bell, label: 'Notifications', description: 'Manage alerts' },
  { icon: Shield, label: 'Privacy & Security', description: 'Account protection' },
  { icon: HelpCircle, label: 'Help & Support', description: 'Get assistance' },
];

export const SettingsView = ({ userProfile, employees, onLogout, onViewFinance, onAddEmployee, onDeleteEmployee }: SettingsViewProps) => {
  return (
    <div className="flex flex-col h-full relative z-10 overflow-y-auto hide-scrollbar pb-32">
      <BackgroundEffects />
      
      <PageHeader 
        title="Settings"
        subtitle="Account"
      />
      
      <div className="px-6 pt-2 relative z-10">
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-8 flex flex-col items-center justify-center mb-6"
        >
          <div className="w-28 h-28 rounded-full mb-4 border-4 border-white shadow-lg overflow-hidden">
            <img 
              src={userProfile.avatar} 
              className="w-full h-full object-cover" 
              alt="Profile" 
            />
          </div>
          <h2 className="text-2xl font-light text-foreground mb-1">{userProfile.name}</h2>
          <p className="text-sm text-muted-foreground">{userProfile.email}</p>
          <span className="mt-3 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
            {userProfile.role}
          </span>
        </motion.div>

        {/* Earnings Button */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={onViewFinance}
          className="glass-panel w-full p-5 flex items-center justify-between text-foreground active:scale-95 transition-transform mb-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Wallet size={20} className="text-success" />
            </div>
            <div className="text-left">
              <p className="font-medium">Earnings History</p>
              <p className="text-xs text-muted-foreground">View your income</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-muted-foreground" />
        </motion.button>
        
        {/* Team Management Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-4 mb-4"
        >
          <TeamManagement
            employees={employees}
            onAddEmployee={onAddEmployee}
            onDeleteEmployee={onDeleteEmployee}
          />
        </motion.div>
        
        {/* Settings Items */}
        <div className="space-y-2 mb-6">
          {settingsItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="glass-panel w-full p-4 flex items-center justify-between text-foreground active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <item.icon size={20} className="text-muted-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted-foreground" />
            </motion.button>
          ))}
        </div>
        
        {/* Logout Button */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={onLogout}
          className="w-full py-4 text-destructive font-bold text-xs uppercase tracking-widest hover:text-destructive/80 transition-colors flex items-center justify-center gap-2"
        >
          Log Out <LogOut size={16}/>
        </motion.button>
      </div>
    </div>
  );
};
