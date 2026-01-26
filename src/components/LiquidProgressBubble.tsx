import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface LiquidProgressBubbleProps {
  percentage: number;
  label?: string;
  size?: number;
}

export const LiquidProgressBubble = ({ 
  percentage, 
  label,
  size = 180 
}: LiquidProgressBubbleProps) => {
  const { t } = useLanguage();
  const displayLabel = label || t('dashboard.purification');
  
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Calculate wave amplitude - reduces as we approach 100%
  const waveAmplitude = Math.max(2, 8 * (1 - clampedPercentage / 100));
  
  // Calculate fill height (from bottom)
  const fillHeight = (clampedPercentage / 100) * size;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Label */}
      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
        {displayLabel}
      </span>
      
      {/* Bubble Container */}
      <div 
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Outer glow */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
            transform: 'scale(1.2)',
          }}
        />
        
        {/* Glass bubble */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: `
              inset 0 0 30px rgba(255, 255, 255, 0.3),
              0 10px 40px rgba(0, 0, 0, 0.1)
            `,
          }}
        >
          {/* Liquid fill container */}
          <div 
            className="absolute inset-0 overflow-hidden rounded-full"
          >
            {/* Animated liquid */}
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              initial={{ height: 0 }}
              animate={{ height: fillHeight }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(186 100% 40%) 100%)',
              }}
            >
              {/* Wave SVG */}
              <svg
                className="absolute -top-2 left-0 w-[200%] animate-wave"
                style={{ height: waveAmplitude * 3 }}
                viewBox="0 0 1200 60"
                preserveAspectRatio="none"
              >
                <path
                  d={`M0,${30 + waveAmplitude} 
                      C150,${30 - waveAmplitude} 300,${30 + waveAmplitude} 450,${30} 
                      C600,${30 - waveAmplitude} 750,${30 + waveAmplitude} 900,${30}
                      C1050,${30 - waveAmplitude} 1200,${30 + waveAmplitude} 1200,${30}
                      L1200,60 L0,60 Z`}
                  fill="hsl(var(--primary))"
                  opacity="0.8"
                />
                <path
                  d={`M0,${30} 
                      C200,${30 + waveAmplitude} 400,${30 - waveAmplitude} 600,${30} 
                      C800,${30 + waveAmplitude} 1000,${30 - waveAmplitude} 1200,${30}
                      L1200,60 L0,60 Z`}
                  fill="hsl(186 100% 40%)"
                  opacity="0.6"
                />
              </svg>
            </motion.div>
          </div>
          
          {/* Glass highlight */}
          <div 
            className="absolute top-2 left-4 w-8 h-8 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
            }}
          />
        </div>
        
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            key={clampedPercentage}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-extralight text-foreground drop-shadow-sm"
          >
            {Math.round(clampedPercentage)}
            <span className="text-xl">%</span>
          </motion.span>
        </div>
      </div>
    </div>
  );
};
