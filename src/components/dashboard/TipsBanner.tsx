import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Sparkles, Clock, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Import cleaning images
import cleaning1 from '@/assets/tips/cleaning-1.jpg';
import cleaning2 from '@/assets/tips/cleaning-2.jpg';
import cleaning3 from '@/assets/tips/cleaning-3.jpg';
import cleaning4 from '@/assets/tips/cleaning-4.jpg';

interface Tip {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  image: string;
}

export const TipsBanner = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const tips: Tip[] = [
    {
      id: '1',
      icon: <Lightbulb size={16} className="text-amber-500" />,
      title: t('tips.efficiency') || 'Dica de Eficiência',
      description: t('tips.efficiencyDesc') || 'Comece sempre pelos cômodos mais altos e desça - a poeira cai para baixo!',
      image: cleaning1,
    },
    {
      id: '2',
      icon: <Sparkles size={16} className="text-primary" />,
      title: t('tips.quality') || 'Qualidade Premium',
      description: t('tips.qualityDesc') || 'Lembre-se: detalhes fazem a diferença. Verifique os cantos e rodapés.',
      image: cleaning2,
    },
    {
      id: '3',
      icon: <Clock size={16} className="text-success" />,
      title: t('tips.time') || 'Gestão de Tempo',
      description: t('tips.timeDesc') || 'Chegue 5 minutos antes para verificar materiais e planejar o trabalho.',
      image: cleaning3,
    },
    {
      id: '4',
      icon: <Shield size={16} className="text-violet-500" />,
      title: t('tips.safety') || 'Segurança Primeiro',
      description: t('tips.safetyDesc') || 'Sempre fotografe o estado inicial da propriedade para documentação.',
      image: cleaning4,
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
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  const currentTip = tips[currentIndex];

  return (
    <div className="relative w-full overflow-hidden">
      <div className="glass-panel relative overflow-hidden">
        {/* Background Image with Overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip.id + '-bg'}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img 
              src={currentTip.image} 
              alt="" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/60" />
          </motion.div>
        </AnimatePresence>
        
        <div className="relative flex items-center gap-2 p-4">
          {/* Navigation Left */}
          <button
            onClick={() => navigate(-1)}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white/90 transition-colors shadow-sm"
            aria-label="Previous tip"
          >
            <ChevronLeft size={14} className="text-foreground/70" />
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
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                  {currentTip.icon}
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                    {currentTip.title}
                  </p>
                  <p className="text-xs text-foreground font-medium leading-snug line-clamp-2">
                    {currentTip.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Right */}
          <button
            onClick={() => navigate(1)}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center hover:bg-white/90 transition-colors shadow-sm"
            aria-label="Next tip"
          >
            <ChevronRight size={14} className="text-foreground/70" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="relative flex justify-center gap-1.5 pb-3 -mt-1">
          {tips.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentIndex ? 1 : -1);
                setCurrentIndex(index);
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-primary w-4' 
                  : 'bg-foreground/20 w-1 hover:bg-foreground/40'
              }`}
              aria-label={`Go to tip ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
