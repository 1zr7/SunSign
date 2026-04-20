import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Circle, X, Loader2, AlertCircle } from 'lucide-react';
import HandScene from '../three/HandScene';
import TextInput from './TextInput';
import { useGlossNLP, loadGlossConfig, GLOSS_CONFIG_EVENT } from '../hooks/useGlossNLP';

/**
 * SignAnimator
 * ============
 * This is the control center for the 3D Avatar (the character on the right).
 * It listens for text you type, breaks it into words (signs), 
 * and tells the avatar to play them in order.
 */

export default function SignAnimator() {
  const [tokens, setTokens]             = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [speed, setSpeed]               = useState(1);

  // -- Setup & Sync --
  // We keep the settings in sync across different parts of the app.
  const [glossConfig, setGlossConfig] = useState(() => loadGlossConfig());
  useEffect(() => {
    const onChange = () => setGlossConfig(loadGlossConfig());
    window.addEventListener('storage', onChange);
    window.addEventListener(GLOSS_CONFIG_EVENT, onChange);
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener(GLOSS_CONFIG_EVENT, onChange);
    };
  }, []);

  const { glossify, isLoading: isGlossing, error: glossError } = useGlossNLP(glossConfig);

  const isPlaying = currentIndex >= 0 && currentIndex < tokens.length;

  // When a new list of signs arrives, start from the first one
  useEffect(() => {
    if (tokens.length > 0) setCurrentIndex(0);
    else setCurrentIndex(-1);
  }, [tokens]);

  // This function runs when the 3D character finishes its current sign
  const handleSignComplete = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev >= 0 && prev < tokens.length - 1) return prev + 1;
      return -1; // Stop if no more signs are left
    });
  }, [tokens.length]);

  // Safety Timer: If the 3D model gets glitchy and doesn't tell us 
  // it's finished, we manually skip to the next sign after 4 seconds.
  const safetyRef = useRef<any>(null);
  useEffect(() => {
    if (safetyRef.current) clearTimeout(safetyRef.current);
    if (!isPlaying) return;
    safetyRef.current = setTimeout(handleSignComplete, 4000 / speed);
    return () => { if (safetyRef.current) clearTimeout(safetyRef.current); };
  }, [currentIndex, speed]);

  const handleInputSubmit = async (text: string) => {
    // Turn the sentence into a list of signs (like "أنا" "أحب" "أنت")
    const result = await glossify(text);
    setTokens(result);
  };

  const handleStop = () => {
    setTokens([]);
    setCurrentIndex(-1);
  };

  const activeSign = isPlaying ? tokens[currentIndex] : null;

  return (
    <div className="w-full h-full flex flex-col">

      {/* -- The 3D World -- */}
      <div className="flex-1 relative rounded-t-3xl overflow-hidden sun-glass border-b-0 border-sun-border shadow-[0_-10px_30px_rgba(255,184,0,0.02)]">

        {/* This floating box shows which word the character is saying right now */}
        <AnimatePresence>
          {(tokens.length > 0 || isGlossing) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-10 inset-x-0 mx-auto w-max z-10 bg-sun-void/85 px-8 py-4 rounded-2xl border border-sun-border/30 flex items-center justify-center gap-6 backdrop-blur-lg min-w-[400px] max-w-[90%] shadow-2xl"
            >
              {isGlossing ? (
                /* While the AI is thinking of the translation */
                <>
                  <Loader2 className="w-4 h-4 text-sun-core animate-spin" />
                  <span className="font-ui text-xs text-sun-core/70 uppercase tracking-widest animate-pulse">
                    Thinking…
                  </span>
                </>
              ) : (
                /* The actual list of words */
                <>
                  {isPlaying
                    ? <Play className="w-4 h-4 text-sun-core animate-pulse flex-shrink-0" strokeWidth={2.5} />
                    : <Circle className="w-4 h-4 text-sun-core/30 flex-shrink-0" strokeWidth={2.5} />
                  }
                  <div className="flex gap-2 flex-wrap justify-center overflow-hidden" dir="rtl">
                    {(() => {
                      // We group letters together if the app is "fingerspelling" them
                      const groups: { isSpelling: boolean; items: { char: string; index: number }[] }[] = [];
                      let currentGroup: any = null;

                      tokens.forEach((t, i) => {
                        const isSpace = t === ' ';
                        const isSpelled = !isSpace && (t.length === 1 || t === 'ال' || t === 'لا');

                        if (isSpace) {
                          currentGroup = null;
                          groups.push({ isSpelling: false, items: [{ char: t, index: i }] });
                        } else if (isSpelled) {
                          if (!currentGroup) {
                            currentGroup = { isSpelling: true, items: [] };
                            groups.push(currentGroup);
                          }
                          currentGroup.items.push({ char: t, index: i });
                        } else {
                          currentGroup = null;
                          groups.push({ isSpelling: false, items: [{ char: t, index: i }] });
                        }
                      });

                      return groups.map((g, gi) => {
                        if (!g.isSpelling) {
                          const idx = g.items[0].index;
                          const isSpace = g.items[0].char === ' ';
                          return (
                            <span
                              key={gi}
                              className={`font-arabic text-xl transition-all duration-300 ${
                                idx === currentIndex
                                  ? 'text-sun-core font-bold drop-shadow-[0_0_8px_rgba(255,184,0,0.8)] scale-110 inline-block'
                                  : 'text-text-secondary inline-block'
                              } ${isSpace ? 'px-2' : ''}`}
                            >
                              {g.items[0].char}
                            </span>
                          );
                        } else {
                          // Special styling for words that are being spelled out letter-by-letter
                          return (
                            <span key={gi} className="font-arabic text-xl transition-all duration-300 whitespace-nowrap inline-block">
                              <span className="text-[10px] text-sun-warm/40 font-ui align-middle mr-1">Spell-</span>
                              {g.items.map((it, ci) => (
                                <span
                                  key={ci}
                                  className={`transition-colors duration-150 ${
                                    it.index === currentIndex
                                      ? 'text-sun-core font-bold drop-shadow-[0_0_8px_rgba(255,184,0,0.8)]'
                                      : 'text-text-secondary'
                                  }`}
                                >
                                  {it.char}
                                </span>
                              ))}
                            </span>
                          );
                        }
                      });
                    })()}
                  </div>
                  {/* Stop playback button */}
                  <button onClick={handleStop} className="ml-2 text-text-secondary hover:text-sun-core transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* If the AI fails to translate, show a simple error message */}
        <AnimatePresence>
          {glossError && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-amber-900/40 border border-amber-700/40 text-amber-400 text-xs font-ui px-4 py-2 rounded-xl backdrop-blur-sm max-w-[80%]"
            >
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{glossError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicator that advanced AI mode is active */}
        {glossConfig.enabled && (
          <div className="absolute top-6 right-6 z-10 flex items-center gap-1.5 bg-sun-core/10 border border-sun-core/30 text-sun-core/70 text-[10px] font-ui uppercase tracking-widest px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-sun-core/70 animate-pulse" />
            AI Mode
          </div>
        )}

        {/* The 3D scene where the character lives */}
        <HandScene
          currentSignInfo={activeSign}
          onSignComplete={handleSignComplete}
          speed={speed}
        />

        {/* Slider to change how fast the character signs */}
        <div className="absolute top-6 left-6 z-10 flex items-center gap-3 bg-sun-void/60 px-4 py-2 rounded-xl backdrop-blur-sm">
          <span className="font-ui text-[10px] text-text-secondary uppercase tracking-widest">Speed</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            className="w-16 h-1.5 accent-sun-core cursor-pointer"
          />
          <span className="font-ui text-xs text-sun-warm font-bold">{speed.toFixed(1)}x</span>
        </div>
      </div>

      {/* The text input area at the bottom */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full z-20 -mt-2"
      >
        <TextInput onSubmit={handleInputSubmit} disabled={isPlaying || isGlossing} />
      </motion.div>
    </div>
  );
}
