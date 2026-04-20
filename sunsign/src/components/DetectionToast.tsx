import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * DetectionToast
 * ==============
 * This is a small popup notification that appears at the bottom 
 * of the screen whenever the AI finds a new sign.
 * It automatically disappears after 3 seconds.
 */

interface DetectionToastProps {
  message: string | null;
  onDismiss: () => void;
}

export default function DetectionToast({ message, onDismiss }: DetectionToastProps) {
  // Setup a 3-second timer to close the notification
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onDismiss, 3000);
      return () => clearTimeout(timer); // Clean up if the popup changes before 3s
    }
  }, [message, onDismiss]);

  return (
    <AnimatePresence>
      {/* If there is a message to show, pop it in! */}
      {message && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-8 right-8 z-[100] sun-glass px-6 py-4 flex items-center gap-4 border border-sun-core"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-sun-core" />
            {/* A small "sun burst" animation behind the icon */}
            <div className="absolute inset-0 animate-ray-burst rounded-full bg-sun-core pointer-events-none"></div>
          </div>
          <span className="font-arabic text-lg text-text-primary mt-1" dir="rtl">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
