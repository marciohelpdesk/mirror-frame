import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, Clock, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Tip {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}

export const TipsBanner = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const tips: Tip[] = [
    {
      id: '1',
      icon: <Lightbulb size={20} className="text-amber-500" />,
      title: t('tips.efficiency') || 'Dica de Eficiência',
      description: t('tips.efficiencyDesc') || 'Comece sempre pelos cômodos mais altos e desça - a poeira cai para baixo!',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    },
    {
      id: '2',
      icon: <Sparkles size={20} className="text-primary" />,
      title: t('tips.quality') || 'Qualidade Premium',
      description: t('tips.qualityDesc') || 'Lembre-se: detalhes fazem a diferença. Verifique os cantos e rodapés.',
      gradient: 'from-primary/20 via-cyan-500/10 to-transparent',
    },
    {
      id: '3',
      icon: <Clock size={20} className="text-success" />,
      title: t('tips.time') || 'Gestão de Tempo',
      description: t('tips.timeDesc') || 'Chegue 5 minutos antes para verificar materiais e planejar o trabalho.',
      gradient: 'from-success/20 via-emerald-500/10 to-transparent',
    },
    {
      id: '4',
      icon: <Shield size={20} className="text-violet-500" />,
      title: t('tips.safety') || 'Segurança Primeiro',
      description: t('tips.safetyDesc') || 'Sempre fotografe o estado inicial da propriedade para documentação.',
      gradient: 'from-violet-500/20 via-purple-500/10 to-transparent',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % tips.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [tips.length]);

  const navigate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      if (newDirection === 1) {
        return (prev + 1) % tips.length;
      }
      return prev === 0 ? tips.length - 1 : prev - 1;
    });
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const currentTip = tips[currentIndex];

  return (
    <div className="relative w-full overflow-hidden">
      <div className="glass-panel p-4 relative">
        {/* Gradient Background */}
        <div 
          className={`absolute inset-0 bg-gradient-to-r ${currentTip.gradient} rounded-3xl transition-all duration-500`}
        />
        
        <div className="relative flex items-center gap-3">
          {/* Navigation Left */}
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors"
            aria-label="Previous tip"
          >
            <ChevronLeft size={16} className="text-foreground/70" />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentTip.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="flex items-center gap-3"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  {currentTip.icon}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    {currentTip.title}
                  </p>
                  <p className="text-sm text-foreground font-medium leading-snug truncate">
                    {currentTip.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Right */}
          <button
            onClick={() => navigate(1)}
            className="flex-shrink-0 w-8 h-8 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center hover:bg-white/70 transition-colors"
            aria-label="Next tip"
          >
            <ChevronRight size={16} className="text-foreground/70" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-1.5 mt-3">
          {tips.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-4' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to tip ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
