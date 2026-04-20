import { useEffect, useState } from 'react';
import { Mic, Send, MicOff, Globe, Loader2 } from 'lucide-react';
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
  const { isListening, transcript, startListening, clearTranscript } = useSpeechRecognition();

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
          <div className="relative inline-block">
            <select
              value={langCode}
              onChange={(e) => setLangCode(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Select Input Language"
            >
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
            <button
              type="button"
              className="p-3 bg-sun-surface text-text-secondary rounded-xl hover:text-sun-warm transition-colors font-ui font-bold text-sm flex items-center justify-center w-11 h-11 pointer-events-none"
            >
              {currentLang.label}
            </button>
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
