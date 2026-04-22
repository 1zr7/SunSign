import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Delete, Trash2, Pencil, ChevronDown, Check, PictureInPicture2, Zap, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateText } from '../hooks/useTranslationApi';
import { SUPPORTED_LANGUAGES } from '../utils/languages';

/**
 * SignInputRecorder
 * =================
 * This is the big text box where your signs appear. 
 * It also handles:
 *   1. Translating the Arabic signs into other languages (English, Spanish, etc).
 *   2. Letting you edit the text if the AI made a mistake.
 *   3. Reading the text out loud.
 */

interface SignInputRecorderProps {
  currentLetter: string | null;
  holdProgress: number;
  currentWord: string;
  sentence: string;
  onBackspace: () => void;
  onClear: () => void;
  onSpeak: (text: string, lang?: string) => void;
  onSentenceChange: (text: string) => void;
  isAutoMode?: boolean;
  setIsAutoMode?: (val: boolean) => void;
  isPiPActive?: boolean;
  togglePiP?: () => void;
  modelConfig?: string;
  onModelToggle?: () => void;
}

export default function SignInputRecorder({
  currentLetter,
  holdProgress,
  currentWord,
  sentence,
  onBackspace,
  onClear,
  onSpeak,
  onSentenceChange,
  isAutoMode,
  setIsAutoMode,
  isPiPActive,
  togglePiP,
  modelConfig,
  onModelToggle,
}: SignInputRecorderProps) {
  const { t } = useTranslation();
  const [outLangCode, setOutLangCode] = useState('ar');
  const [translatedText, setTranslatedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
  
  const fullText = sentence;

  // -- Translation Timer --
  // We wait 600ms after you stop signing to send the text to Google Translate.
  // This keeps the app fast.
  useEffect(() => {
    if (outLangCode === 'ar' || !fullText) {
      setTranslatedText(fullText);
      return;
    }
    
    const timer = setTimeout(async () => {
      const result = await translateText(fullText, 'ar', outLangCode);
      setTranslatedText(result);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [fullText, outLangCode]);

  const currentLang = SUPPORTED_LANGUAGES.find(l => l.code === outLangCode) || SUPPORTED_LANGUAGES[0];

  /** Makes the computer speak the text in the chosen language */
  const handleSpeak = () => {
    if (outLangCode !== 'ar') {
      onSpeak(translatedText || fullText, currentLang.ttsCode);
    } else {
      onSpeak(fullText, 'ar-SA');
    }
  };

  // Auto Mode: Automatically speak and clear after 2 seconds of inactivity
  useEffect(() => {
    if (!isAutoMode || !fullText) return;
    
    const timer = setTimeout(() => {
      handleSpeak();
      setTimeout(onClear, 500); // Give it a tiny delay so the voice starts before clearing
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [fullText, isAutoMode, outLangCode, translatedText]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* -- Action Buttons (Speak, Delete, Clear, Language) -- */}
      <div className="flex items-center justify-between px-2">
        <div className="flex gap-3">
          <div className="relative" ref={dropdownRef}>
            {/* Custom Language Dropdown */}
            <button 
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`p-3 px-4 rounded-full sun-glass hover:bg-sun-core/20 text-sun-warm transition-all duration-300 font-ui font-bold text-sm min-w-[4.5rem] flex items-center justify-between gap-2 border ${isDropdownOpen ? 'border-sun-core/50 bg-sun-core/10' : 'border-sun-border'}`}
            >
              <span>{currentLang.label}</span>
              <motion.div
                animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown size={14} className="opacity-60" />
              </motion.div>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute bottom-full left-0 mb-3 z-[100] min-w-[340px] sun-glass border border-sun-core/30 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden"
                >
                  <div className="p-2 flex flex-col gap-2 bg-sun-void/95 shadow-2xl">
                    <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-text-secondary/50 border-b border-sun-border/30 mb-1">
                      Translate to
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SUPPORTED_LANGUAGES.map(l => {
                        const isActive = outLangCode === l.code;
                        return (
                          <button
                            key={l.code}
                            onClick={() => {
                              setOutLangCode(l.code);
                              setIsDropdownOpen(false);
                            }}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-ui transition-all duration-200 group
                              ${isActive 
                                ? 'bg-sun-core/20 text-sun-core font-bold' 
                                : 'text-text-secondary hover:bg-sun-core/10 hover:text-text-primary'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-8 h-5 flex items-center justify-center rounded bg-sun-void/50 border border-sun-border/40 text-[10px] tracking-tighter ${isActive ? 'border-sun-core/40' : ''}`}>
                                {l.label}
                              </span>
                              <span>{l.name}</span>
                            </div>
                            {isActive && (
                              <Check size={14} className="text-sun-core" />
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
            onClick={onModelToggle}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 z-20 relative font-ui font-bold text-[10px] tracking-wider ${modelConfig === 'dual_lstm' ? 'bg-sun-core text-sun-void shadow-[0_0_15px_rgba(255,184,0,0.5)]' : 'sun-glass text-text-secondary hover:bg-sun-core/20 hover:text-text-primary'}`}
            title={`Switch Model (Current: ${modelConfig === 'static' ? 'Fingerspelling' : 'LSTM Words'})`}
          >
            {modelConfig === 'static' ? 'FS' : 'LSTM'}
          </button>

          <button
            onClick={() => setIsAutoMode && setIsAutoMode(!isAutoMode)}
            className={`p-3 rounded-full transition-all duration-300 z-20 relative ${isAutoMode ? 'bg-sun-core text-sun-void shadow-[0_0_15px_rgba(255,184,0,0.5)]' : 'sun-glass text-text-secondary hover:bg-sun-core/20 hover:text-text-primary'}`}
            title="Auto-Send & Speak Mode"
          >
            <Zap size={20} />
          </button>

          <button
            onClick={togglePiP}
            className={`p-3 rounded-full transition-all duration-300 z-20 relative ${isPiPActive ? 'bg-sun-core text-sun-void shadow-[0_0_15px_rgba(255,184,0,0.5)]' : 'sun-glass text-text-secondary hover:bg-sun-core/20 hover:text-text-primary'}`}
            title="Picture-in-Picture Mode"
          >
            <PictureInPicture2 size={20} />
          </button>
          
          <div className="w-px h-6 bg-sun-border mx-1 z-20" />

          <button 
            onClick={handleSpeak}
            disabled={!fullText}
            className="p-3 rounded-full sun-glass hover:bg-sun-core/20 text-sun-warm transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent z-20 relative"
          >
            <Volume2 size={20} />
          </button>
          
          <button 
            onClick={onBackspace}
            disabled={!fullText}
            className="p-3 rounded-full sun-glass hover:bg-sun-core/20 text-text-secondary transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent z-20 relative"
          >
            <Delete size={20} />
          </button>
          
          <button 
            onClick={onClear}
            disabled={!fullText}
            className="p-3 rounded-full sun-glass hover:bg-red-500/20 text-red-400 transition-all duration-300 disabled:opacity-30 disabled:hover:bg-transparent z-20 relative"
          >
            <Trash2 size={20} />
          </button>
        </div>
        
        {/* -- Mini Hand Progress Ring -- */}
        <div className="flex items-center gap-4">
          <span className="text-xs md:text-sm font-ui text-text-secondary uppercase tracking-[0.2em]">
            {t('recording')}
          </span>
          <div className="relative w-10 h-10 flex items-center justify-center bg-sun-void rounded-full border border-sun-border shadow-[0_0_20px_rgba(255,184,0,0.15)]">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-sun-border" />
               <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="113" strokeDashoffset={113 - (113 * (holdProgress || 0)) / 100} className="text-sun-warm transition-all duration-75 ease-linear" strokeLinecap="round" />
            </svg>
            <AnimatePresence mode="popLayout">
              {currentLetter && (
                <motion.span 
                  key={currentLetter}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className="font-arabic text-lg text-sun-warm absolute"
                >
                  {currentLetter.split(' ')[0]}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* -- Main Text Display -- */}
      {/* Click to edit the text manually if the AI makes a mistake */}
      <div
        className="w-full min-h-[80px] max-h-[160px] overflow-y-auto sun-glass rounded-2xl border border-sun-border/50 shadow-[inset_0_4px_15px_rgba(0,0,0,0.2)] flex flex-col justify-center relative group"
        onClick={() => {
          if (!isEditing) {
            setEditDraft(fullText);
            setIsEditing(true);
            setTimeout(() => textareaRef.current?.focus(), 0);
          }
        }}
      >
        <div className="absolute top-2 right-3 opacity-0 group-hover:opacity-40 transition-opacity duration-200 text-sun-warm pointer-events-none">
          <Pencil size={14} />
        </div>

        {isEditing ? (
          <textarea
            ref={textareaRef}
            className={`w-full bg-transparent resize-none outline-none p-4 md:px-6 text-2xl md:text-3xl lg:text-4xl text-text-primary leading-tight min-h-[80px] max-h-[160px] ${
              outLangCode === 'ar' ? 'font-arabic text-right' : 'font-ui text-left'
            }`}
            dir={outLangCode === 'ar' ? 'rtl' : 'ltr'}
            value={editDraft}
            onChange={(e) => setEditDraft(e.target.value)}
            onBlur={() => {
              onSentenceChange(editDraft);
              setIsEditing(false);
            }}
            rows={2}
            placeholder={outLangCode === 'ar' ? 'ابدأ لغة الإشارة...' : 'Start signing...'}
          />
        ) : (
          <p
            className={`text-2xl md:text-3xl lg:text-4xl text-text-primary leading-tight break-words min-h-[32px] p-4 md:px-6 cursor-text ${
              outLangCode === 'ar' ? 'font-arabic text-right' : 'font-ui text-left'
            }`}
            dir={outLangCode === 'ar' ? 'rtl' : 'ltr'}
          >
            {outLangCode === 'ar' ? fullText : translatedText || <span className="text-text-secondary/30">{t('start_signing')}</span>}
            {!fullText && outLangCode === 'ar' && <span className="text-text-secondary/30">{t('start_signing')}</span>}
            
            {/* The pulsing yellow typing cursor */}
            <motion.span 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className={`inline-block w-[3px] md:w-2 h-6 md:h-8 lg:h-10 bg-sun-warm align-middle rounded-sm shadow-[0_0_10px_rgba(255,184,0,0.6)] ${outLangCode === 'ar' ? 'ml-2' : 'mr-2'}`}
            />
          </p>
        )}

        {/* Small Arabic subtitle if you are viewing a different language */}
        {outLangCode !== 'ar' && fullText && !isEditing && (
          <p className="font-arabic text-text-secondary/50 text-sm md:text-lg px-4 md:px-6 pb-3 text-left" dir="rtl">
            {fullText}
          </p>
        )}
      </div>
    </div>
  );
}
