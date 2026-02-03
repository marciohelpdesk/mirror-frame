import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Check, Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import purLogo from '@/assets/pur-logo.png';

export default function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if we have a recovery token
    const hash = window.location.hash;
    if (!hash.includes('type=recovery')) {
      // No recovery token, redirect to login
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast.error(error.message);
      } else {
        setIsSuccess(true);
        toast.success('Senha alterada com sucesso!');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden relative z-20 flex flex-col items-center justify-center p-6 min-h-[600px]">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <img 
            src={purLogo}
            alt="Pur Logo" 
            className="w-24 h-24 object-contain" 
          />
        </motion.div>
        
        {/* Reset Password Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel w-full max-w-[320px] p-8"
        >
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"
              >
                <Check className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Senha Alterada!
              </h2>
              <p className="text-muted-foreground text-sm">
                Redirecionando...
              </p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Nova Senha
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Digite sua nova senha
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="field-label">Nova Senha</label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 bg-white/50 border border-border rounded-xl text-foreground font-medium focus:border-primary outline-none transition-colors"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="field-label">Confirmar Senha</label>
                  <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-4 bg-white/50 border border-border rounded-xl text-foreground font-medium focus:border-primary outline-none transition-colors"
                    required
                    minLength={6}
                  />
                </div>
                
                <motion.button 
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Nova Senha'
                  )}
                </motion.button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AuthLayout>
  );
}
