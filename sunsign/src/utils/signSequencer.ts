import { useEffect, useState, useRef } from 'react';

/**
 * useSignSequencer
 * ================
 * This hook is like a "playlist" for signs. 
 * If you have a sentence like "أنا أحبك" (I love you), this tool 
 * tells the avatar to play "أنا" (I), wait a bit, then play "أحبك" (love you).
 */

export function useSignSequencer(words: string[], speed: number) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const timeoutRef = useRef<any>(undefined);

  // When a new list of words arrives, start from the first one
  useEffect(() => {
    if (words.length > 0) {
      setIsPlaying(true);
      setCurrentIndex(0);
    }
  }, [words]);

  // This loop moves from one word to the next
  useEffect(() => {
    if (isPlaying && currentIndex >= 0 && currentIndex < words.length) {
      // Each sign takes about 1.5 seconds, but we change it based on the speed slider
      const baseDurationMs = 1500;
      const duration = baseDurationMs / speed;

      timeoutRef.current = setTimeout(() => {
        if (currentIndex === words.length - 1) {
          // If we're at the end of the sentence, stop
          setIsPlaying(false);
          setCurrentIndex(-1);
        } else {
          // Move to the next word
          setCurrentIndex(prev => prev + 1);
        }
      }, duration);
    }

    return () => {
      // If we stop early, cancel the timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPlaying, words, speed]);

  return { currentIndex, isPlaying };
}
