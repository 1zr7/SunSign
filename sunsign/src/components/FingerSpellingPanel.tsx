/**
 * FingerSpellingPanel
 * ====================
 * This is the control box for spelling out words using your fingers.
 * It shows:
 *   • A yellow timer ring that fills up as you hold a sign.
 *   • The current word you are building.
 *   • The full sentence you've finished so far.
 *   • Buttons to delete letters, add spaces, or clear everything.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Delete, Space, Check, RotateCcw } from 'lucide-react';
import type { FingerSpellingState, FingerSpellingControls } from '../hooks/useFingerSpelling';

interface FingerSpellingPanelProps extends FingerSpellingState, FingerSpellingControls {
  onConfirm: (sentence: string) => void;
  isModelReady: boolean;
}

// Math for the yellow progress ring
const R   = 52;
const C   = 2 * Math.PI * R; // Circumference (total length of the circle)

export default function FingerSpellingPanel({
  currentLetter,
  holdProgress,
  currentWord,
  words,
  sentence,
  commitWord,
  backspace,
  clearAll,
  onConfirm,
  isModelReady,
}: FingerSpellingPanelProps) {

  const handleConfirm = () => {
    if (!sentence.trim()) return;
    onConfirm(sentence.trim());
    clearAll();
  };

  return (
    <div className="flex flex-col h-full w-full sun-glass p-5 gap-4 text-text-primary">

      {/* -- Title -- */}
      <div className="flex items-center justify-between pb-3 border-b border-sun-border">
        <h2 className="font-brand text-2xl text-sun-warm" dir="rtl">تهجئة بالأصابع</h2>
        <span className={`font-ui text-[0.6rem] uppercase tracking-widest px-2 py-1 rounded-full border ${
          isModelReady
            ? 'border-sun-core/40 text-sun-core'
            : 'border-text-secondary/20 text-text-secondary'
        }`}>
          {isModelReady ? 'System Ready' : 'Starting...'}
        </span>
      </div>

      {/* -- The Interactive Hand Timer -- */}
      <div className="flex items-center justify-center gap-8">
        <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 128 128"
          >
            {/* The background track for the circle */}
            <circle
              cx="64" cy="64" r={R}
              fill="none"
              stroke="rgba(255,184,0,0.12)"
              strokeWidth="6"
            />
            {/* The yellow progress bar that fills up */}
            <motion.circle
              cx="64" cy="64" r={R}
              fill="none"
              stroke="#FFB800"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={C}
              animate={{ strokeDashoffset: C * (1 - holdProgress / 100) }}
              transition={{ duration: 0.05, ease: 'linear' }}
            />
          </svg>

          {/* Show the letter you are currently signing */}
          <AnimatePresence mode="wait">
            <motion.span
              key={currentLetter ?? 'idle'}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1,   opacity: 1 }}
              exit={{    scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="font-arabic text-5xl text-sun-core z-10 select-none"
              dir="rtl"
            >
              {currentLetter ?? '✋'}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Short instructions for the user */}
        <div className="flex flex-col gap-1 text-text-secondary font-ui text-[0.65rem] uppercase tracking-wider">
          <span>Hold for 1.5s to type letter</span>
          <span>Remove hand to add space</span>
        </div>
      </div>

      {/* -- The word you are currently typing -- */}
      <div className="flex flex-col items-center gap-1">
        <span className="font-ui text-[0.6rem] text-text-secondary uppercase tracking-widest self-start">
          Current Word
        </span>
        <div
          className="w-full min-h-[3.5rem] bg-sun-void/30 rounded-xl px-4 flex items-center justify-end overflow-hidden border border-sun-border"
          dir="rtl"
        >
          <AnimatePresence initial={false}>
            {currentWord ? (
              currentWord.split('').map((ch, i) => (
                <motion.span
                  key={`${i}-${ch}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-arabic text-3xl text-sun-core leading-none"
                >
                  {ch}
                </motion.span>
              ))
            ) : (
              <motion.span
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-arabic text-xl text-text-secondary/40"
              >
                ...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* -- The full sentence you've finished -- */}
      <div className="flex flex-col gap-1 flex-1">
        <span className="font-ui text-[0.6rem] text-text-secondary uppercase tracking-widest">
          Finished Sentence
        </span>
        <div
          className="flex-1 bg-sun-void/30 rounded-xl p-4 border border-sun-border overflow-y-auto"
          dir="rtl"
        >
          {sentence ? (
            <p className="font-arabic text-2xl text-text-arabic leading-[2]">
              {words.map((w, i) => (
                <span key={i} className="text-text-arabic">{w} </span>
              ))}
              {/* Highlight the word we are currently building */}
              {currentWord && (
                <span className="text-sun-warm/70">{currentWord}</span>
              )}
            </p>
          ) : (
            <p className="font-arabic text-lg text-text-secondary/40 text-center mt-4">
              Start signing letters to see them here...
            </p>
          )}
        </div>
      </div>

      {/* -- Action Buttons -- */}
      <div className="flex gap-2">
        <button
          onClick={commitWord}
          disabled={!currentWord}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 sun-glass
                     hover:bg-sun-core/10 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors rounded-xl font-ui text-xs text-text-secondary uppercase tracking-wider"
        >
          <Space size={14} />
          Space
        </button>

        <button
          onClick={backspace}
          disabled={!currentWord}
          className="px-4 py-2.5 sun-glass hover:bg-red-500/10
                     hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors rounded-xl text-text-secondary"
          title="Delete last letter"
        >
          <Delete size={16} />
        </button>

        <button
          onClick={clearAll}
          disabled={!sentence && !currentWord}
          className="px-4 py-2.5 sun-glass hover:bg-red-500/10
                     hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors rounded-xl text-text-secondary"
          title="Clear all"
        >
          <RotateCcw size={16} />
        </button>

        <AnimatePresence>
          {sentence.trim() && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{    opacity: 0, scale: 0.8 }}
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-2 py-2.5
                         bg-sun-core/20 hover:bg-sun-core/30 border border-sun-core/40
                         text-sun-core font-ui text-xs uppercase tracking-wider
                         transition-colors rounded-xl"
            >
              <Check size={14} />
              Confirm
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
