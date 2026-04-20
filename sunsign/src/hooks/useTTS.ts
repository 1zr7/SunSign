import { useCallback } from 'react';

/**
 * useTTS
 * ======
 * This hook makes the computer talk out loud! 
 * It's short for "Text-to-Speech."
 */

export function useTTS() {
  const speak = useCallback((text: string, lang: string = 'ar-SA') => {
    // Check if the computer has a voice
    if (!('speechSynthesis' in window)) return;
    
    // If the computer is already talking, shut it up so we can say the new thing
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; // Use Arabic by default
    utterance.rate = 1.0;  // Normal speed
    utterance.pitch = 1.0; // Normal voice depth
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    // Stop the computer from talking
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}
