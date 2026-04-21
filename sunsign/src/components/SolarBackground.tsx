import { motion } from 'framer-motion';

/**
 * SolarBackground
 * ===============
 * This component adds the soft, glowing yellow light that you see 
 * floating behind everything. It makes the app feel like it's 
 * floating in space.
 */

export default function SolarBackground({ highContrast }: { highContrast?: boolean }) {
  if (highContrast) {
    return (
      <div className="absolute inset-0 z-0 bg-black pointer-events-none" />
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-sun-void pointer-events-none flex items-center justify-center">
      
      {/* 1. Ambient Space Glow (base layer) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 4 }}
        style={{
          position: 'absolute',
          width: '100vw',
          height: '100vh',
          background: 'radial-gradient(ellipse at center, rgba(255,238,2,0.15) 0%, rgba(0,0,0,0) 80%)',
        }}
      />

      {/* 2. Rotating Solar Rays (Outer Corona) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 4, delay: 0.5 }}
        className="animate-rotate-slow"
        style={{
          position: 'absolute',
          width: '150vmax',
          height: '150vmax',
          // A repeating conic gradient creates the "rays" shooting out from the center
          background: 'repeating-conic-gradient(from 0deg, rgba(255,238,2,0) 0deg, rgba(255,238,2,0.1) 10deg, rgba(255,238,2,0) 20deg)',
          // The radial gradient mask gently fades the rays out towards the edges
          WebkitMaskImage: 'radial-gradient(circle at center, black 10%, transparent 60%)',
          maskImage: 'radial-gradient(circle at center, black 10%, transparent 60%)',
        }}
      />

      {/* 3. The Sun's Core (breathing / pulsing sphere) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 3 }}
        className="active-detect-pulse" // Reusing the pulse animation for a breathing effect
        style={{
          position: 'absolute',
          width: '50vmax',
          height: '50vmax',
          // Core is bright white in the center, hot yellow at the edge, fading to nothing
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.7) 0%, rgba(255,238,2,0.6) 20%, rgba(255,238,2,0) 60%)',
          borderRadius: '50%',
        }}
      />
      
      {/* 4. Secondary Inner Rotating Flares */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 5, delay: 1 }}
        className="animate-rotate-slow"
        style={{
          position: 'absolute',
          width: '80vmax',
          height: '80vmax',
          animationDirection: 'reverse', // Spins the opposite way to the main rays
          background: 'repeating-conic-gradient(from 15deg, rgba(255,255,255,0) 0deg, rgba(255,238,2,0.15) 15deg, rgba(255,255,255,0) 30deg)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 0%, transparent 50%)',
          maskImage: 'radial-gradient(circle at center, black 0%, transparent 50%)',
        }}
      />

    </div>
  );
}
