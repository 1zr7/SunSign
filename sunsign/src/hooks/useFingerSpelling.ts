/**
 * useFingerSpelling
 * =================
 * This hook turns a stream of letter guesses into a full sentence.
 * It's like a keyboard, but for hand signs!
 *
 * How it works:
 *  - If you hold the SAME letter for 1.5 seconds, it adds that letter 
 *    to your current word.
 *  - If you take your hand away for 2 seconds, it adds a space and 
 *    finishes the word.
 *  - You can also manually add a space, backspace, or clear everything.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { GesturePrediction } from './useGestureModel';
import { arabicDictionary } from '../utils/arabicDictionary';
import { useAudio } from './useAudio';

// -- Timing Settings --
const HOLD_MS      = 1500;   // How long to hold a letter (1.5 seconds)
const WORD_GAP_MS  = 2000;   // How long to wait for a space (2 seconds)

// -- Data we share with the UI --
export interface FingerSpellingState {
  /** The letter you are currently holding */
  currentLetter: string | null;
  /** 0 to 100: How close the letter is to being 'typed' */
  holdProgress: number;
  /** The word you are currently spelling */
  currentWord: string;
  /** The full sentence (everything typed so far) */
  sentence: string;
  /** A list of all finished words */
  words: string[];
}

// -- Buttons the UI can click --
export interface FingerSpellingControls {
  /** Manually add a space and start a new word */
  commitWord: () => void;
  /** Delete the last letter you typed */
  backspace: () => void;
  /** Reset everything and start over */
  clearAll: () => void;
  /** Manually change the whole sentence (if the user types in the box) */
  setSentenceDirectly: (text: string) => void;
}

// -- The Hook --
export function useFingerSpelling(
  prediction: GesturePrediction | null,
  isHandPresent: boolean = false,
  soundChimes: boolean = true,
): FingerSpellingState & FingerSpellingControls {
  const { playChime } = useAudio();
  // -- React State (things that trigger a redraw) --
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [holdProgress,  setHoldProgress]  = useState(0);
  const [currentWord,   setCurrentWord]   = useState('');
  const [words,         setWords]         = useState<string[]>([]);

  // -- Background Refs (things that don't need to trigger a redraw immediately) --
  const heldLetter      = useRef<string | null>(null);
  const holdStart       = useRef(0);
  const currentWordRef  = useRef('');         // Keeps track of the current word
  const wordsRef        = useRef<string[]>([]); // Keeps track of all words
  const rafId           = useRef(0);          // Used for the progress animation
  const noHandTimer     = useRef<any>(undefined); // Used for the auto-space timer

  // Sync our background refs with our React state
  useEffect(() => { currentWordRef.current = currentWord; }, [currentWord]);
  useEffect(() => { wordsRef.current = words; },           [words]);

  // -- Helper Tools --

  const stopAnimation = useCallback(() => {
    cancelAnimationFrame(rafId.current);
    rafId.current = 0;
  }, []);

  const stopWordTimer = useCallback(() => {
    clearTimeout(noHandTimer.current);
  }, []);

  /** Adds a single character to our current word */
  const appendLetter = useCallback((letter: string) => {
    setCurrentWord(prev => {
      const next = prev + letter;
      currentWordRef.current = next;
      return next;
    });
  }, []);

  /** Adds a space and moves the current word into the finished list */
  const commitWord = useCallback(() => {
    stopWordTimer();
    const word = currentWordRef.current;
    if (!word) return;
    setWords(prev => {
      const next = [...prev, word];
      wordsRef.current = next;
      return next;
    });
    setCurrentWord('');
    currentWordRef.current = '';
    heldLetter.current = null;
    setCurrentLetter(null);
    setHoldProgress(0);
  }, [stopWordTimer]);

  /** Deletes the last character or word */
  const backspace = useCallback(() => {
    heldLetter.current = null;
    setCurrentLetter(null);
    setHoldProgress(0);

    // If we're still typing a word, delete the last letter
    if (currentWordRef.current.length > 0) {
      setCurrentWord(prev => {
        const next = prev.slice(0, -1);
        currentWordRef.current = next;
        return next;
      });
      return;
    }

    // If the word is empty, move the last finished word back to 'spelling' mode
    setWords(prev => {
      if (prev.length === 0) return prev;
      const lastWord = prev[prev.length - 1];
      const rest = prev.slice(0, -1);

      if (lastWord.length <= 1) {
        // If it's a short word, just delete it
        wordsRef.current = rest;
        return rest;
      } else {
        // If it's a long word, put it back into currentWord so we can edit it
        const trimmed = lastWord.slice(0, -1);
        wordsRef.current = rest;
        setCurrentWord(trimmed);
        currentWordRef.current = trimmed;
        return rest;
      }
    });
  }, []);

  /** Restarts everything from scratch */
  const clearAll = useCallback(() => {
    stopAnimation();
    stopWordTimer();
    heldLetter.current = null;
    holdStart.current  = 0;
    currentWordRef.current = '';
    wordsRef.current   = [];
    setCurrentLetter(null);
    setHoldProgress(0);
    setCurrentWord('');
    setWords([]);
  }, [stopAnimation, stopWordTimer]);

  /** If the user types manually in the text box, sync our state here */
  const setSentenceDirectly = useCallback((text: string) => {
    stopAnimation();
    stopWordTimer();
    heldLetter.current = null;
    holdStart.current  = 0;

    const endsWithSpace = text.endsWith(' ');
    const parts = text.split(' ').filter(Boolean);

    if (endsWithSpace || parts.length === 0) {
      wordsRef.current       = parts;
      currentWordRef.current = '';
      setWords(parts);
      setCurrentWord('');
    } else {
      const committed  = parts.slice(0, -1);
      const inProgress = parts[parts.length - 1];
      wordsRef.current       = committed;
      currentWordRef.current = inProgress;
      setWords(committed);
      setCurrentWord(inProgress);
    }

    setCurrentLetter(null);
    setHoldProgress(0);
  }, [stopAnimation, stopWordTimer]);

  // -- Main Logic Effect --
  // This runs every time the hand model makes a new guess
  useEffect(() => {
    if (!prediction) {
      // -- No hand found --
      stopAnimation();
      heldLetter.current = null;
      setCurrentLetter(null);
      setHoldProgress(0);

      // Start the auto-space timer if the hand is totally gone
      if (!isHandPresent && currentWordRef.current) {
        noHandTimer.current = setTimeout(() => {
          commitWord();
        }, WORD_GAP_MS);
      }
      return;
    }

    // Hand is back! Reset the auto-space timer
    stopWordTimer();

    // -- Handling full words (from the LSTM model) --
    if (prediction.type === 'word') {
      const word = prediction.label;
      if (word !== heldLetter.current) {
        stopAnimation();
        
        // If we were half-way through spelling a word, finish it first
        if (currentWordRef.current) {
          commitWord();
        }

        // Add the whole word
        const translatedWord = arabicDictionary[word] || word;
        setWords(prev => {
          const next = [...prev, translatedWord];
          wordsRef.current = next;
          return next;
        });

        heldLetter.current = word;
        setCurrentLetter(word); 
        setHoldProgress(100);
      }
      return;
    }

    // -- Handling letters (from the ABC model) --
    const label = prediction.label;

    if (label && label !== heldLetter.current) {
      // New letter found! Start the hold timer...
      stopAnimation();
      heldLetter.current = label;
      holdStart.current  = Date.now();
      setCurrentLetter(label);
      setHoldProgress(0);

      const tick = () => {
        const elapsed = Date.now() - holdStart.current;
        const pct     = Math.min((elapsed / HOLD_MS) * 100, 100);

        if (pct >= 100) {
          // Success! Letter typed.
          if (soundChimes) playChime();
          // We only take the Arabic part of the label (e.g. 'ب' from 'ب (baa)')
          appendLetter(label.split(' ')[0]);
          
          heldLetter.current = null; // Reset so they can type it again immediately
          holdStart.current  = Date.now();
          setCurrentLetter(null); 
          setHoldProgress(0);
        } else {
          setHoldProgress(pct);
          rafId.current = requestAnimationFrame(tick);
        }
      };

      rafId.current = requestAnimationFrame(tick);
    }
    // No regular cleanup here. We handle stopAnimation explicitly 
    // when the label changes or prediction goes away to avoid resetting
    // the progress on simple confidence value changes (which create a new object).
  }, [prediction, isHandPresent, appendLetter, commitWord, stopAnimation, stopWordTimer]);

  // Clean up animation if component unmounts
  useEffect(() => {
    return () => {
      stopAnimation();
    };
  }, [stopAnimation]);

  // Combine everything into one string for the display
  const sentenceParts = currentWord
    ? [...words, currentWord]
    : words;
  const sentence = sentenceParts.join(' ');

  return {
    currentLetter,
    holdProgress,
    currentWord,
    words,
    sentence,
    commitWord,
    backspace,
    clearAll,
    setSentenceDirectly,
  };
}
