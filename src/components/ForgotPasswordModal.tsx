import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal = forwardRef<HTMLDivElement, ForgotPasswordModalProps>(({ isOpen, onClose }, ref) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Erro ao enviar email. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="glass-panel w-full max-w-[360px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handleClose}
                className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-foreground">
                {t('login.forgotPassword') || 'Recuperar Senha'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('login.emailSent') || 'Email Enviado!'}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t('login.checkInbox') || 'Verifique sua caixa de entrada e clique no link para redefinir sua senha.'}
                </p>
                <button
                  onClick={handleClose}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-sm transition-all hover:opacity-90"
                >
                  {t('common.close') || 'Fechar'}
                </button>
              </motion.div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  {t('login.forgotPasswordDescription') || 'Digite seu email e enviaremos um link para redefinir sua senha.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="field-label">{t('login.email')}</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full p-4 pl-12 bg-white/50 border border-border rounded-xl text-foreground font-medium focus:border-primary outline-none transition-colors placeholder:text-muted-foreground"
                        required
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                      ? (t('login.loading') || 'Enviando...') 
                      : (t('login.sendResetLink') || 'Enviar Link')
                    }
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

ForgotPasswordModal.displayName = 'ForgotPasswordModal';
