import { useState } from 'react';
import { motion, AnimatePresence, Easing } from 'framer-motion';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { useLanguage } from '@/contexts/LanguageContext';
import { ForgotPasswordModal } from '@/components/ForgotPasswordModal';
import purLogo from '@/assets/pur-logo.png';

interface LoginViewProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

// Custom easing as tuple for proper typing
const smoothEase: Easing = [0.25, 0.46, 0.45, 0.94];
const bounceEase: Easing = [0.34, 1.56, 0.64, 1];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: smoothEase,
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.5, rotate: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.8,
      ease: bounceEase,
    },
  },
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

const inputFocusVariants = {
  idle: { 
    boxShadow: "0 0 0 0px hsl(var(--primary) / 0)" 
  },
  focus: { 
    boxShadow: "0 0 0 3px hsl(var(--primary) / 0.15)",
    transition: { duration: 0.2 }
  },
};

export const LoginView = ({ onSignIn, onSignUp, isLoading, error }: LoginViewProps) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'SIGN_UP'>('SIGN_IN');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
        {/* Animated Logo with Glow */}
        <motion.div 
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-8 mt-4 relative"
        >
          {/* Glow effect behind logo */}
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-primary/20 rounded-full blur-3xl scale-150"
          />
          
          <motion.div 
            variants={logoVariants}
            initial="hidden"
            animate="visible"
            className="relative w-40 h-40 flex items-center justify-center"
          >
            <img 
              src={purLogo}
              alt="Pur Logo" 
              className="w-full h-full object-contain drop-shadow-2xl" 
            />
            
            {/* Sparkle decorations */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-primary/60" />
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Login Card with Staggered Children */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="glass-panel w-full max-w-[320px] p-8 relative overflow-hidden"
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          
          <motion.h2 
            variants={itemVariants}
            className="text-3xl font-light text-foreground mb-2 text-center tracking-tight relative z-10"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={authMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {authMode === 'SIGN_IN' ? t('login.welcome') : t('login.join')}
              </motion.span>
            </AnimatePresence>
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="text-center text-muted-foreground text-xs mb-8 uppercase tracking-widest font-bold relative z-10"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={authMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {authMode === 'SIGN_IN' ? t('login.signIn') : t('login.createWorkspace')}
              </motion.span>
            </AnimatePresence>
          </motion.p>
          
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <motion.div variants={itemVariants}>
              <label className="field-label">{t('login.email')}</label>
              <motion.div
                variants={inputFocusVariants}
                animate={focusedField === 'email' ? 'focus' : 'idle'}
                className="rounded-xl"
              >
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className="w-full p-4 bg-white/50 border border-border rounded-xl text-foreground font-medium focus:border-primary outline-none transition-colors placeholder:text-muted-foreground"
                  required
                />
              </motion.div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <label className="field-label">{t('login.password')}</label>
              <motion.div
                variants={inputFocusVariants}
                animate={focusedField === 'password' ? 'focus' : 'idle'}
                className="relative rounded-xl"
              >
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="w-full p-4 bg-white/50 border border-border rounded-xl text-foreground font-medium focus:border-primary outline-none transition-colors placeholder:text-muted-foreground pr-12"
                  required
                />
                <motion.button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={showPassword ? 'hide' : 'show'}
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.15 }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </motion.div>
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </motion.div>

            <AnimatePresence>
              {authMode === 'SIGN_IN' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-right overflow-hidden"
                >
                  <motion.button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    whileHover={{ x: 3 }}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    {t('login.forgotPassword') || 'Esqueci minha senha'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            
            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="text-destructive text-sm text-center overflow-hidden"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
            
            <motion.div variants={itemVariants}>
              <motion.button 
                type="submit"
                disabled={isLoading}
                variants={buttonVariants}
                initial="idle"
                whileHover={!isLoading ? "hover" : "idle"}
                whileTap={!isLoading ? "tap" : "idle"}
                className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 relative overflow-hidden group"
              >
                {/* Button shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                  animate={!isLoading ? { translateX: ['100%', '-100%'] } : {}}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    repeatDelay: 3,
                    ease: "linear"
                  }}
                />
                
                <AnimatePresence mode="wait">
                  <motion.span
                    key={isLoading ? 'loading' : authMode}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="relative z-10"
                  >
                    {isLoading ? t('login.loading') : authMode === 'SIGN_IN' ? t('login.submit') : t('login.createAccount')}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </form>
          
          <motion.div 
            variants={itemVariants}
            className="mt-6 text-center relative z-10"
          >
            <motion.button 
              onClick={() => setAuthMode(authMode === 'SIGN_IN' ? 'SIGN_UP' : 'SIGN_IN')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={authMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {authMode === 'SIGN_IN' ? t('login.noAccount') : t('login.hasAccount')}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      <ForgotPasswordModal 
        isOpen={showForgotPassword} 
        onClose={() => setShowForgotPassword(false)} 
      />
    </div>
  );
};
