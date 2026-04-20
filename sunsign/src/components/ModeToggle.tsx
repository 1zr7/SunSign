import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Sunset, Sunrise } from 'lucide-react';

/**
 * ModeToggle
 * ==========
 * This is the sliding switch at the bottom of the screen.
 * It lets you swap between "Mode 1" (individual signs) 
 * and "Mode 2" (continuous sentences).
 */

interface ModeToggleProps {
  mode: 1 | 2;
  setMode: (mode: 1 | 2) => void;
}

export default function ModeToggle({ mode, setMode }: ModeToggleProps) {
  const { t } = useTranslation();

  return (
    <div className="z-[100] sun-glass p-1 flex items-center shadow-[0_0_40px_rgba(255,184,0,0.1)] relative">
      {/* This is the yellow sliding highlight that moves between the two buttons */}
      <motion.div
        className="absolute h-full top-0 bg-sun-core rounded-[14px]"
        initial={false}
        animate={{
          left: mode === 1 ? '4px' : '50%',
          width: 'calc(50% - 4px)',
        }}
        // The spring makes the sliding feel bouncy and smooth
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        style={{ zIndex: 0 }}
      />
      
      <button 
        onClick={() => setMode(1)}
        className={`w-40 py-3 relative z-10 font-brand italic text-xl transition-colors duration-300 ${mode === 1 ? 'text-sun-void font-bold' : 'text-text-secondary hover:text-sun-warm'}`}
      >
        <span className="flex items-center justify-center gap-2">
          <Sunrise size={18} /> {t('mode_1')}
        </span>
      </button>
      
      <button 
        onClick={() => setMode(2)}
        className={`w-40 py-3 relative z-10 font-brand italic text-xl transition-colors duration-300 ${mode === 2 ? 'text-sun-void font-bold' : 'text-text-secondary hover:text-sun-warm'}`}
      >
        <span className="flex items-center justify-center gap-2">
          <Sunset size={18} /> {t('mode_2')}
        </span>
      </button>
    </div>
  );
}
