import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Copy, Trash2, Sun } from 'lucide-react';
import { useTTS } from '../hooks/useTTS';

/**
 * LogEntry
 * ========
 * Every time you finish a sentence, we save it here as a "LogEntry" 
 * so you can look back at what you said.
 */
export interface LogEntry {
  id: string;
  text: string;
  timestamp: string;
}

interface TranscriptPanelProps {
  entries: LogEntry[];
  onClear: () => void;
  isTTSMuted: boolean;
  toggleTTS: () => void;
}

/**
 * TranscriptPanel
 * ===============
 * This component shows the "history transcript" (the list of everything 
 * translated so far). It features:
 *   • Auto-scrolling to the newest message.
 *   • Voice output (Auto-speaking new items).
 *   • Copy and Clear buttons.
 */
export default function TranscriptPanel({ entries, onClear, isTTSMuted, toggleTTS }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { speak } = useTTS();

  useEffect(() => {
    // 1. Automatically scroll to the bottom when a new message arrives
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // 2. Read the latest message out loud (if the sound is turned on)
    if (entries.length > 0 && !isTTSMuted) {
      speak(entries[entries.length - 1].text);
    }
  }, [entries, speak, isTTSMuted]);

  /** Copy everything in the log to the clipboard */
  const copyAll = () => {
    const text = entries.map(e => e.text).join(' ');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full w-full sun-glass p-6 text-text-primary" dir="rtl">
      {/* -- Menu Bar -- */}
      <div className="flex items-center justify-between pb-4 border-b border-sun-border mb-4">
        <h2 className="font-brand text-2xl text-sun-warm flex items-center gap-2">
          <span>سجل الترجمة</span>
        </h2>
        <div className="flex gap-3">
          {/* Sound Toggle */}
          <button onClick={toggleTTS} className="p-2 hover:bg-sun-glass rounded-full transition-colors">
            {isTTSMuted ? <VolumeX size={18} className="text-text-secondary" /> : <Volume2 size={18} className="text-sun-core" />}
          </button>
          {/* Copy Button */}
          <button onClick={copyAll} className="p-2 hover:bg-sun-glass rounded-full transition-colors" title="نسخ الكل">
            <Copy size={18} className="text-text-secondary" />
          </button>
          {/* Clear Log Button */}
          <button onClick={onClear} className="p-2 hover:bg-sun-glass rounded-full transition-colors" title="مسح">
            <Trash2 size={18} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* -- The Main Log Display -- */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar flex flex-col items-start font-arabic">
        {entries.length === 0 ? (
          // If the log is empty, show a pulsing sun icon
          <div className="m-auto flex flex-col items-center justify-center text-text-secondary opacity-60">
            <Sun className="w-12 h-12 mb-3 animate-pulse text-sun-warm" />
            <p className="text-xl">بانتظار النور...</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full flex flex-col bg-sun-void/40 p-4 rounded-xl border border-sun-border"
              >
                {/* Time stamp */}
                <div className="font-ui text-[0.65rem] text-text-secondary tracking-wider mb-2">
                  {entry.timestamp}
                </div>
                {/* The Translated Arabic Text */}
                <div className="text-[clamp(1.4rem,2.5vw,2rem)] leading-[2] text-text-arabic">
                  {entry.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
