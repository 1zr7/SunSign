import { motion } from 'framer-motion';

/**
 * SunSignLogo
 * ===========
 * This component just draws the official yellow sun logo.
 * It also adds a nice little "spin-in" animation when it first appears.
 */

interface SunSignLogoProps {
  className?: string;
  size?: number;
}

export default function SunSignLogo({ className = '', size = 64 }: SunSignLogoProps) {
  return (
    <motion.img
      src="/sunsign-logo.svg"
      alt="SunSign Logo"
      width={size}
      height={size}
      className={`${className}`}
      style={{ width: size, height: size, objectFit: 'contain' }}
      // This makes the logo fade in and spin slightly when the app starts
      initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
      animate={{ opacity: 1, rotate: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  );
}
