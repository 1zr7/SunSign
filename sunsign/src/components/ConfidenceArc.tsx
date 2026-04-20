import { motion } from 'framer-motion';

/**
 * ConfidenceArc
 * =============
 * This is the little circular progress bar that shows how sure 
 * the AI is about the sign it's seeing (0% to 100%).
 */

interface ConfidenceArcProps {
  confidence: number; // 0 to 1
  label: string;
}

export default function ConfidenceArc({ confidence, label }: ConfidenceArcProps) {
  const percentage = Math.round(confidence * 100);
  
  // If the AI is very sure (>80%), use the bright yellow color. 
  // Otherwise, use a dimmer color.
  const color = confidence > 0.8 ? 'var(--sun-core)' : 'var(--sun-ray)';
  
  return (
    <div className="flex items-center gap-4 py-2 px-4 sun-glass w-fit">
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          {/* The grey background circle */}
          <circle
            cx="18" cy="18" r="16"
            fill="none" stroke="var(--sun-glass)" strokeWidth="3"
          />
          {/* The colored progress circle that grows as we get more confident */}
          <motion.circle
            cx="18" cy="18" r="16"
            fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
            strokeDasharray="100"
            // This calculation moves the line around the edge of the circle
            animate={{ strokeDashoffset: 100 - (confidence * 100) }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-ui text-[0.65rem] text-text-primary">
          {percentage}%
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-ui text-[0.6rem] text-text-secondary uppercase tracking-widest leading-tight">Live Det</span>
        <span className="font-arabic text-xl font-bold text-text-primary mt-[2px]">{label || '---'}</span>
      </div>
    </div>
  );
}
