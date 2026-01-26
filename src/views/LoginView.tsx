import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { useLanguage } from '@/contexts/LanguageContext';
import purLogo from '@/assets/pur-logo.png';

interface LoginViewProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export const LoginView = ({ onSignIn, onSignUp, isLoading, error }: LoginViewProps) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'SIGN_IN') {
      await onSignIn(email, password);
    } else {
      await onSignUp(email, password);
    }
  };

  return (
    <div className="mobile-frame relative flex flex-col">
      <BackgroundEffects />
      
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative z-20 flex flex-col items-center justify-center p-6 min-h-[600px]">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="mb-8 mt-4"
        >
          <div className="relative w-40 h-40 flex items-center justify-center">
            <img 
              src={purLogo}
              alt="Pur Logo" 
              className="w-full h-full object-contain drop-shadow-2xl" 
            />
          </div>
        </motion.div>
        
        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel w-full max-w-[320px] p-8"
        >
          <h2 className="text-3xl font-light text-foreground mb-2 text-center tracking-tight">
            {authMode === 'SIGN_IN' ? t('login.welcome') : t('login.join')}
          </h2>
          <p className="text-center text-muted-foreground text-xs mb-8 uppercase tracking-widest font-bold">
            {authMode === 'SIGN_IN' ? t('login.signIn') : t('login.createWorkspace')}
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label">{t('login.email')}</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-4 bg-white/50 border border-border rounded-xl text-foreground font-medium focus:border-primary outline-none transition-colors placeholder:text-muted-foreground"
                required
              />
            </div>
            
            <div>
              <label className="field-label">{t('login.password')}</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 bg-white/50 border border-border rounded-xl text-foreground font-medium focus:border-primary outline-none transition-colors placeholder:text-muted-foreground pr-12"
                  required
                  minLength={6}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {error && (
              <p className="text-destructive text-sm text-center">{error}</p>
            )}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? t('login.loading') : authMode === 'SIGN_IN' ? t('login.submit') : t('login.createAccount')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              onClick={() => setAuthMode(authMode === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {authMode === 'SIGN_IN' ? t('login.noAccount') : t('login.hasAccount')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
