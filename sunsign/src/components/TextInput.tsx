import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, MicOff, Globe, Loader2, ChevronDown, Check } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { translateText } from '../hooks/useTranslationApi';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

/**
 * TextInput
 * =========
 * This is the bar where you can type or talk to the app. 
 * If you type in English (or any other language), it will 
 * automatically translate it to Arabic before sending it 
 * to the 3D avatar.
 */

interface TextInputProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
}

export default function TextInput({ onSubmit, disabled }: TextInputProps) {
  const [text, setText] = useState('');
  const [langCode, setLangCode] = useState('ar');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isListening, transcript, startListening, clearTranscript } = useSpeechRecognition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // If you use the microphone, add the heard words to the text box
  useEffect(() => {
    if (transcript) {
      setText(prev => prev ? `${prev} ${transcript}` : transcript);
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentText = text.trim();
    if (!currentText || disabled || isTranslating) return;

    // If the language isn't Arabic, ask Google Translate for help first
    if (langCode !== 'ar') {
      setIsTranslating(true);
      const translatedToArabic = await translateText(currentText, langCode, 'ar');
      onSubmit(translatedToArabic);
      setIsTranslating(false);
    } else {
      onSubmit(currentText);
    }
    setText(''); // Clear the box after sending
  };

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || SUPPORTED_LANGUAGES[0];

  return (
    <form onSubmit={handleSubmit} className="relative w-full sun-glass p-1">
      <div className="flex items-center w-full relative">
        <input
          type="text"
          // Flip the typing direction if it's Arabic
          dir={langCode === 'ar' ? 'rtl' : 'ltr'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={langCode === 'ar' ? "اكتب هنا لترجمته إلى لغة الإشارة..." : `Type in ${currentLang.name} to translate...`}
          className={`w-full bg-transparent border-none outline-none font-arabic text-xl py-4 ${langCode === 'ar' ? 'pr-6 pl-36' : 'pl-6 pr-36'} text-text-primary placeholder:text-text-secondary/50`}
          disabled={disabled || isTranslating}
        />
        
        {/* Buttons for Microphone, Language, and Send */}
        <div className={`absolute ${langCode === 'ar' ? 'left-2' : 'right-2'} flex gap-2`}>
          <div className="relative" ref={dropdownRef}>
            {/* Custom Language Dropdown (Avatar Side) */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`p-3 bg-sun-surface text-text-secondary rounded-xl hover:text-sun-warm transition-all duration-300 font-ui font-bold text-sm flex items-center justify-between w-14 h-11 border ${isDropdownOpen ? 'border-sun-core/50 bg-sun-core/10 text-sun-warm' : 'border-transparent'}`}
            >
              <span>{currentLang.label}</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={14} className="opacity-40" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute bottom-full mb-3 z-[150] min-w-[340px] sun-glass border border-sun-core/30 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden ${langCode === 'ar' ? 'left-0' : 'right-0'}`}
                >
                  <div className="p-2 flex flex-col gap-2 bg-sun-void/98 shadow-2xl">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-text-secondary/50 border-b border-sun-border/30 mb-1">
                      Translate FROM
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SUPPORTED_LANGUAGES.map(l => {
                        const isActive = langCode === l.code;
                        return (
                          <button
                            key={l.code}
                            onClick={() => {
                              setLangCode(l.code);
                              setIsDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-ui transition-all duration-200 group
                              ${isActive 
                                ? 'bg-sun-core/20 text-sun-core font-bold' 
                                : 'text-text-secondary hover:bg-sun-core/10 hover:text-text-primary'
                              }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-4 flex items-center justify-center rounded bg-sun-void/50 border border-sun-border/40 text-[9px] tracking-tighter ${isActive ? 'border-sun-core/40' : ''}`}>
                                {l.label}
                              </span>
                              <span>{l.name}</span>
                            </div>
                            {isActive && (
                              <Check size={12} className="text-sun-core" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            type="button"
            onClick={() => startListening(currentLang.ttsCode)}
            disabled={disabled || isListening || isTranslating}
            className={`p-3 rounded-xl transition-all w-11 h-11 flex items-center justify-center duration-300 ${isListening ? 'bg-sun-core shadow-[0_0_15px_rgba(255,184,0,0.5)] text-sun-void' : 'bg-sun-surface text-text-secondary hover:text-sun-warm'}`}
          >
            {isListening ? <Mic size={20} className="animate-pulse" /> : <MicOff size={20} />}
          </button>
          
          <button
            type="submit"
            disabled={disabled || !text.trim() || isTranslating}
            className="p-3 bg-sun-surface text-text-secondary rounded-xl w-11 h-11 flex items-center justify-center hover:text-sun-core transition-colors disabled:opacity-50"
          >
            {isTranslating ? <Loader2 size={20} className="animate-spin text-sun-warm" /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </form>
  );
}
