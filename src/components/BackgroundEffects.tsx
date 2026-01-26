import { useMemo } from 'react';
import { motion } from 'framer-motion';

export const BackgroundEffects = () => {
  const drops = useMemo(() => Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 150 + 50,
    delay: -(Math.random() * 10), 
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {drops.map(drop => (
        <motion.div 
          key={drop.id}
          className="mercury-drop"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 1, delay: drop.delay * -0.1 }}
          style={{
            left: drop.left,
            top: drop.top,
            width: `${drop.size}px`,
            height: `${drop.size}px`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}
      
      {/* Large decorative drops */}
      <div className="mercury-drop" style={{ width: '300px', height: '300px', top: '-100px', right: '-100px', opacity: 0.4 }} />
      <div className="mercury-drop" style={{ width: '250px', height: '250px', bottom: '-80px', left: '-80px', opacity: 0.5 }} />
    </div>
  );
};
