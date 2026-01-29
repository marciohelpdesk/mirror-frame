import { forwardRef } from 'react';
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

export const LiquidProgressBubble = forwardRef<HTMLDivElement, LiquidProgressBubbleProps>(({ 
  percentage, 
  label,
  size = 180,
  animated = false,
  showPercentage = true,
  showLabel = true
}, ref) => {
  const { t } = useLanguage();
  const displayLabel = label || t('dashboard.purification');
  
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  
  // Calculate wave amplitude - reduces as we approach 100%
  const waveAmplitude = Math.max(2, 8 * (1 - clampedPercentage / 100));
  
  // Calculate fill height (from bottom)
  const fillHeight = (clampedPercentage / 100) * size;
  
  // Check if complete
  const isComplete = clampedPercentage >= 100;

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      {/* Label */}
      {showLabel && (
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          {displayLabel}
        </span>
      )}
      
      {/* Bubble Container */}
      <motion.div 
        className="relative"
        style={{ width: size, height: size }}
        animate={animated ? {
          rotate: [0, 1, -1, 0.5, -0.5, 0],
        } : undefined}
        transition={animated ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        } : undefined}
      >
        {/* Outer glow - pulsing when complete */}
        <motion.div 
          className="absolute inset-0 rounded-full"
          style={{
            background: isComplete 
              ? 'radial-gradient(circle, rgba(34, 211, 238, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
            transform: 'scale(1.2)',
          }}
          animate={isComplete ? {
            scale: [1.2, 1.4, 1.2],
            opacity: [1, 0.7, 1],
          } : undefined}
          transition={isComplete ? {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          } : undefined}
        />
        
        {/* Secondary glow ring for complete state */}
        {isComplete && (
          <motion.div 
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid hsl(var(--primary))',
              boxShadow: '0 0 20px hsl(var(--primary)), 0 0 40px hsl(var(--primary) / 0.5)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 0.4, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
        
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
              initial={false}
              animate={{ 
                height: fillHeight,
                y: animated ? [0, -2, 1, -1, 2, 0] : 0
              }}
              transition={{ 
                height: { duration: 0.8, ease: 'easeOut' },
                y: animated ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined
              }}
              style={{
                background: 'linear-gradient(180deg, hsl(var(--primary)) 0%, hsl(186 100% 40%) 100%)',
              }}
            >
              {/* Wave SVG - Multiple layers for more dynamic effect */}
              <svg
                className={`absolute -top-2 left-0 w-[200%] ${animated ? 'animate-wave-fast' : 'animate-wave'}`}
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
              
              {/* Secondary wave for more organic movement (only when animated) */}
              {animated && (
                <svg
                  className="absolute -top-1 left-0 w-[200%] animate-wave-reverse"
                  style={{ height: waveAmplitude * 2 }}
                  viewBox="0 0 1200 40"
                  preserveAspectRatio="none"
                >
                  <path
                    d={`M0,${20} 
                        C100,${20 - waveAmplitude * 0.5} 200,${20 + waveAmplitude * 0.5} 300,${20}
                        C400,${20 - waveAmplitude * 0.5} 500,${20 + waveAmplitude * 0.5} 600,${20}
                        C700,${20 - waveAmplitude * 0.5} 800,${20 + waveAmplitude * 0.5} 900,${20}
                        C1000,${20 - waveAmplitude * 0.5} 1100,${20 + waveAmplitude * 0.5} 1200,${20}
                        L1200,40 L0,40 Z`}
                    fill="hsl(var(--primary))"
                    opacity="0.4"
                  />
                </svg>
              )}
              
              {/* Bubble particles effect (only when animated) */}
              {animated && (
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute w-2 h-2 rounded-full bg-white/40"
                    style={{ left: '20%', bottom: '10%' }}
                    animate={{ y: [-fillHeight * 0.8, 0], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/30"
                    style={{ left: '50%', bottom: '15%' }}
                    animate={{ y: [-fillHeight * 0.6, 0], opacity: [0.5, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.5 }}
                  />
                  <motion.div
                    className="absolute w-1 h-1 rounded-full bg-white/50"
                    style={{ left: '70%', bottom: '5%' }}
                    animate={{ y: [-fillHeight * 0.7, 0], opacity: [0.7, 0] }}
                    transition={{ duration: 2.2, repeat: Infinity, delay: 1 }}
                  />
                  <motion.div
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/35"
                    style={{ left: '35%', bottom: '20%' }}
                    animate={{ y: [-fillHeight * 0.5, 0], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: 0.8 }}
                  />
                </div>
              )}
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
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-extralight text-foreground drop-shadow-sm">
              {Math.round(clampedPercentage)}
              <span className="text-xl">%</span>
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
});

LiquidProgressBubble.displayName = 'LiquidProgressBubble';
