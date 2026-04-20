import { motion } from 'framer-motion';

/**
 * SolarBackground
 * ===============
 * This component adds the soft, glowing yellow light that you see 
 * floating behind everything. It makes the app feel like it's 
 * floating in space.
 */

export default function SolarBackground() {
  return (
    <div className="absolute inset-0 z-[-1] overflow-hidden bg-sun-void pointer-events-none flex items-center justify-center">
      {/* 1. Main Yellow Glow - slowly rotates in the background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        transition={{ duration: 3 }}
        className="animate-rotate-slow"
        style={{
          width: '120vw',
          height: '120vw',
          maxHeight: '1200px',
          maxWidth: '1200px',
          background: 'radial-gradient(circle, rgba(255,238,2,0.18) 0%, rgba(0,0,0,0) 60%)',
          filter: 'blur(80px)', // Makes the edges soft and fuzzy
          borderRadius: '50%',
        }}
      />
      
      {/* 2. Secondary White Glow - adds some depth */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 5, delay: 1 }}
        style={{
          position: 'absolute',
          width: '60vw',
          height: '60vw',
          maxHeight: '600px',
          maxWidth: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(60px)',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}
