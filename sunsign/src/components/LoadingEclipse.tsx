import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LoadingEclipse
 * ==============
 * This is the intro screen that looks like a solar eclipse.
 * It stays visible while the heavy AI models are loading in 
 * the background.
 */

interface LoadingEclipseProps {
  progress: number; // 0 to 100
  onComplete: () => void;
}

export default function LoadingEclipse({ progress, onComplete }: LoadingEclipseProps) {
  // Stage tracking: first we eclipsed, then we load, then we "shatter" (reveal the app)
  const [stage, setStage] = useState<'eclipsing' | 'loading' | 'shattering'>('eclipsing');

  useEffect(() => {
    // Stage 1: The initial moon-moving animation
    const timer = setTimeout(() => {
      setStage('loading');
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Stage 2 & 3: Once the AI models are 100% ready, reveal the app
    if (progress >= 100 && stage === 'loading') {
      setTimeout(() => {
        setStage('shattering');
        setTimeout(onComplete, 1200); // Give the "shatter" animation time to finish
      }, 500);
    }
  }, [progress, stage, onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'shattering' && (
        <motion.div
          exit={{ opacity: 0, scale: 1.5, filter: 'brightness(3)' }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-sun-void overflow-hidden"
        >
          {/* -- The Eclipse Visual -- */}
          <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
            {/* The Sun (big yellow glow) */}
            <div className="absolute w-40 h-40 rounded-full bg-sun-core" style={{ boxShadow: '0 0 60px var(--sun-corona)' }}></div>
            
            {/* The Progress Ring around the sun */}
            <svg className="absolute w-52 h-52 -rotate-90 pointer-events-none">
              <circle
                cx="104" cy="104" r={98}
                fill="none" stroke="var(--sun-glass)" strokeWidth="2"
              />
              <motion.circle
                cx="104" cy="104" r={98}
                fill="none" stroke="var(--sun-ray)" strokeWidth="4" strokeLinecap="round"
                strokeDasharray="615"
                // Moves the ring based on progress (0% to 100%)
                animate={{ strokeDashoffset: 615 - (615 * progress) / 100 }}
                transition={{ ease: "easeInOut", duration: 0.5 }}
              />
            </svg>

            {/* The Moon (black circle that covers the sun) */}
            <motion.div 
              initial={{ x: -100 }}
              animate={{ x: stage === 'eclipsing' ? -20 : 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute w-40 h-40 rounded-full bg-sun-void"
            />
          </div>

          {/* Titles */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-center"
          >
            <h1 className="font-brand text-4xl text-text-primary uppercase tracking-[0.3em] font-light mb-4">
              SunSign
            </h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
              className="font-arabic text-xl text-text-arabic"
            >
              نور يتكلم بكل يد
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
