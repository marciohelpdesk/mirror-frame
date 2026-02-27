import { useMemo } from 'react';
import { motion } from 'framer-motion';

export const BackgroundEffects = () => {
  const drops = useMemo(() => Array.from({ length: 5 }).map((_, i) => ({
    id: i,
    left: `${15 + Math.random() * 70}%`,
    top: `${10 + Math.random() * 60}%`,
    size: Math.random() * 120 + 60,
    delay: i * 0.15,
    duration: 6 + Math.random() * 4,
  })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {drops.map(drop => (
        <motion.div 
          key={drop.id}
          className="mercury-drop"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ 
            opacity: [0, 0.5, 0.4],
            scale: [0.6, 1, 0.95],
            y: [20, -10, 0],
          }}
          transition={{ 
            duration: 1.5, 
            delay: drop.delay,
            ease: "easeOut"
          }}
          style={{
            left: drop.left,
            top: drop.top,
            width: `${drop.size}px`,
            height: `${drop.size}px`,
            animation: `float ${drop.duration}s infinite ease-in-out`,
            animationDelay: `${-drop.delay * 2}s`,
          }}
        />
      ))}
      
      {/* Large decorative accent drops with subtle animation */}
      <motion.div 
        className="mercury-drop"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        style={{ 
          width: '340px', 
          height: '340px', 
          top: '-100px', 
          right: '-80px',
          animation: 'float 12s infinite ease-in-out',
        }} 
      />
      <motion.div 
        className="mercury-drop"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 2, delay: 0.8 }}
        style={{ 
          width: '280px', 
          height: '280px', 
          bottom: '-80px', 
          left: '-70px',
          animation: 'float 10s infinite ease-in-out reverse',
        }} 
      />
    </div>
  );
};
