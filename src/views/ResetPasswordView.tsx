import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import purLogo from '@/assets/pur-logo.png';

interface ResetPasswordViewProps {
  onPasswordReset: () => void;
}

export const ResetPasswordView = ({ onPasswordReset }: ResetPasswordViewProps) => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL hash for recovery token (Supabase sends it as a hash fragment)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        // Set the session from the recovery token
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });
        
        if (!error) {
          setIsValidSession(true);
        }
      } else if (session) {
        setIsValidSession(true);
      }
      
      setCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('login.passwordMismatch') || 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError(t('login.passwordTooShort') || 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect after success
        setTimeout(() => {
          onPasswordReset();
        }, 2000);
      }
    } catch (err) {
      setError('Erro ao atualizar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="mobile-frame relative flex flex-col">
        <BackgroundEffects />
        <div className="flex-1 w-full flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="mobile-frame relative flex flex-col">
        <BackgroundEffects />
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative z-20 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel w-full max-w-[320px] p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {t('login.invalidLink') || 'Link Inválido'}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t('login.invalidLinkDescription') || 'Este link de recuperação é inválido ou expirou. Por favor, solicite um novo link.'}
            </p>
            <button
              onClick={onPasswordReset}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:opacity-90"
            >
              {t('login.backToLogin') || 'Voltar ao Login'}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

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
          <div className="relative w-32 h-32 flex items-center justify-center">
            <img 
              src={purLogo}
              alt="Pur Logo" 
              className="w-full h-full object-contain drop-shadow-2xl" 
            />
          </div>
        </motion.div>
        
        {/* Reset Password Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel w-full max-w-[320px] p-8"
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('login.passwordUpdated') || 'Senha Atualizada!'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('login.redirecting') || 'Redirecionando...'}
              </p>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-light text-foreground mb-2 text-center tracking-tight">
                {t('login.newPassword') || 'Nova Senha'}
              </h2>
              <p className="text-center text-muted-foreground text-xs mb-6 uppercase tracking-widest font-bold">
                {t('login.createNewPassword') || 'Crie uma nova senha'}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="field-label">{t('login.password') || 'Senha'}</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-4 bg-white/50 border border-border rounded-xl text-foreground font-medium focus:border-primary outline-none transition-colors placeholder:text-muted-foreground pr-12"
                      required
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

                <div>
                  <label className="field-label">{t('login.confirmPassword') || 'Confirmar Senha'}</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-4 bg-white/50 border border-border rounded-xl text-foreground font-medium focus:border-primary outline-none transition-colors placeholder:text-muted-foreground pr-12"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  {isLoading 
                    ? (t('login.loading') || 'Atualizando...') 
                    : (t('login.updatePassword') || 'Atualizar Senha')
                  }
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
