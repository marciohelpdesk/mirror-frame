import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface LiquidProgressBubbleProps {
  percentage: number;
  label?: string;
  size?: number;
  animated?: boolean;
  showPercentage?: boolean;
  showLabel?: boolean;
}

export const LiquidProgressBubble = ({ 
  percentage, 
  label,
  size = 180,
  animated = false,
  showPercentage = true,
  showLabel = true
}: LiquidProgressBubbleProps) => {
  const { t } = useLanguage();
  const displayLabel = label || t('dashboard.purification');
  
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const waveAmplitude = Math.max(3, 12 * (1 - clampedPercentage / 100));
  const fillHeight = (clampedPercentage / 100) * size;
  const isComplete = clampedPercentage >= 100;

  return (
    <div className="flex flex-col items-center gap-3">
      {showLabel && (
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          {displayLabel}
        </span>
      )}
      
      <motion.div 
        className="relative"
        style={{ width: size, height: size }}
        animate={animated ? { rotate: [0, 1, -1, 0.5, -0.5, 0] } : undefined}
        transition={animated ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
      >
        {/* Outer glow */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{
            background: isComplete 
              ? 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
            transform: 'scale(1.2)',
          }}
          animate={isComplete ? { scale: [1.2, 1.4, 1.2], opacity: [1, 0.7, 1] } : undefined}
          transition={isComplete ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined}
        />
        
        {/* Complete glow ring */}
        {isComplete && (
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid hsl(var(--primary))',
              boxShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        
        {/* Glass bubble */}
        <div 
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.3), 0 10px 40px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              initial={{ height: 0 }}
              animate={{ height: fillHeight, y: animated ? [0, -2, 1, -1, 2, 0] : 0 }}
              transition={{ 
                height: { duration: 0.8, ease: 'easeOut' },
                y: animated ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined
              }}
              style={{ background: 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(186 100% 40%) 100%)' }}
            >
              {/* Wave 1 - Primary */}
              <svg
                className={`absolute -top-3 left-0 w-[200%] ${animated ? 'animate-wave-fast' : 'animate-wave'}`}
                style={{ height: waveAmplitude * 3.5 }}
                viewBox="0 0 1200 80"
                preserveAspectRatio="none"
              >
                <path
                  d={`M0,${40 + waveAmplitude} 
                      Q150,${40 - waveAmplitude * 1.2} 300,${40 + waveAmplitude * 0.5} 
                      T600,${40 - waveAmplitude * 0.8}
                      Q750,${40 + waveAmplitude * 1.1} 900,${40 - waveAmplitude * 0.3}
                      T1200,${40 + waveAmplitude}
                      L1200,80 L0,80 Z`}
                  fill="hsl(var(--primary))"
                  opacity="0.85"
                />
              </svg>

              {/* Wave 2 - Mid tone */}
              <svg
                className={`absolute -top-2 left-0 w-[200%] ${animated ? 'animate-wave-reverse' : 'animate-wave'}`}
                style={{ height: waveAmplitude * 3, animationDuration: '4s' }}
                viewBox="0 0 1200 70"
                preserveAspectRatio="none"
              >
                <path
                  d={`M0,${35} 
                      C100,${35 - waveAmplitude * 0.9} 250,${35 + waveAmplitude * 1.1} 400,${35 - waveAmplitude * 0.4}
                      S650,${35 + waveAmplitude * 0.8} 800,${35 - waveAmplitude * 0.6}
                      S1050,${35 + waveAmplitude * 0.9} 1200,${35}
                      L1200,70 L0,70 Z`}
                  fill="hsl(186 100% 40%)"
                  opacity="0.55"
                />
              </svg>

              {/* Wave 3 - Slow organic */}
              {animated && (
                <svg
                  className="absolute -top-1 left-0 w-[200%]"
                  style={{ 
                    height: waveAmplitude * 2.5, 
                    animation: 'wave 6s linear infinite',
                  }}
                  viewBox="0 0 1200 60"
                  preserveAspectRatio="none"
                >
                  <path
                    d={`M0,${30 + waveAmplitude * 0.3}
                        C80,${30 - waveAmplitude * 0.6} 180,${30 + waveAmplitude * 0.7} 300,${30 - waveAmplitude * 0.2}
                        C420,${30 + waveAmplitude * 0.5} 540,${30 - waveAmplitude * 0.8} 660,${30 + waveAmplitude * 0.3}
                        C780,${30 - waveAmplitude * 0.4} 900,${30 + waveAmplitude * 0.6} 1020,${30 - waveAmplitude * 0.5}
                        C1140,${30 + waveAmplitude * 0.7} 1200,${30} 1200,${30}
                        L1200,60 L0,60 Z`}
                    fill="hsl(var(--primary))"
                    opacity="0.35"
                  />
                </svg>
              )}
              
              {/* Bubble particles */}
              {animated && (
                <div className="absolute inset-0 overflow-hidden">
                  {[
                    { left: '15%', bottom: '8%', w: 'w-2.5', h: 'h-2.5', opacity: 0.5, dur: 2.2, delay: 0 },
                    { left: '45%', bottom: '12%', w: 'w-1.5', h: 'h-1.5', opacity: 0.4, dur: 1.8, delay: 0.4 },
                    { left: '72%', bottom: '5%', w: 'w-1', h: 'h-1', opacity: 0.6, dur: 2.5, delay: 0.8 },
                    { left: '30%', bottom: '18%', w: 'w-2', h: 'h-2', opacity: 0.35, dur: 1.6, delay: 1.2 },
                    { left: '58%', bottom: '10%', w: 'w-1', h: 'h-1', opacity: 0.5, dur: 2.0, delay: 0.6 },
                    { left: '85%', bottom: '15%', w: 'w-1.5', h: 'h-1.5', opacity: 0.45, dur: 2.8, delay: 1.5 },
                  ].map((b, i) => (
                    <motion.div
                      key={i}
                      className={`absolute ${b.w} ${b.h} rounded-full bg-white`}
                      style={{ left: b.left, bottom: b.bottom, opacity: 0 }}
                      animate={{ y: [-fillHeight * 0.7, 0], opacity: [b.opacity, 0] }}
                      transition={{ duration: b.dur, repeat: Infinity, delay: b.delay }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
          
          {/* Glass highlight */}
          <div 
            className="absolute top-2 left-4 w-8 h-8 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)' }}
          />
        </div>
        
        {/* Percentage text */}
        {showPercentage && (
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
        )}
      </motion.div>
    </div>
  );
};
