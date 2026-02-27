import { motion } from 'framer-motion';

export const BackgroundEffects = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {/* Hero 3D Glass Drop - centered at top */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          left: '50%',
          top: '20px',
          transform: 'translateX(-50%)',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 100%)',
          border: '1.5px solid rgba(255,255,255,0.5)',
          boxShadow: `
            inset 0 -20px 40px rgba(0,0,0,0.08),
            inset 0 10px 30px rgba(255,255,255,0.6),
            0 20px 60px rgba(0,0,0,0.1),
            0 5px 20px rgba(0,0,0,0.06)
          `,
          animation: 'float 8s infinite ease-in-out',
        }}
      >
        {/* Light reflection spot */}
        <div
          style={{
            position: 'absolute',
            top: '18%',
            left: '28%',
            width: '35%',
            height: '25%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        {/* Secondary small reflection */}
        <div
          style={{
            position: 'absolute',
            bottom: '22%',
            right: '25%',
            width: '15%',
            height: '10%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
      </motion.div>

      {/* Large decorative corner drops with reduced opacity */}
      <motion.div
        className="mercury-drop"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.25, scale: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        style={{
          width: '300px',
          height: '300px',
          top: '-120px',
          right: '-100px',
          animation: 'float 12s infinite ease-in-out',
        }}
      />
      <motion.div
        className="mercury-drop"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 2, delay: 0.8 }}
        style={{
          width: '240px',
          height: '240px',
          bottom: '-80px',
          left: '-80px',
          animation: 'float 10s infinite ease-in-out reverse',
        }}
      />
    </div>
  );
};
