import { useState, useCallback, useRef } from 'react';

/**
 * useSpeechRecognition
 * ====================
 * This hook uses the browser's built-in "ear" to listen to what 
 * you say and turn it into text.
 */

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Track continuous mode state to restart if it drops
  const recognitionRef = useRef<any>(null);
  const isContinuousRef = useRef(false);
  const onFinalResultRef = useRef<((text: string) => void) | null>(null);

  // Check if the browser actually supports listening to speech
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const startListening = useCallback((lang: string = 'ar-SA', continuousMode = false, onFinalResult?: (text: string) => void) => {
    if (!SpeechRecognition) {
      setError("Your browser doesn't support speech listening. Try using Chrome!");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      isContinuousRef.current = continuousMode;
      if (onFinalResult) onFinalResultRef.current = onFinalResult;

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = lang;
      recognition.continuous = continuousMode;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        // Collect all final results from the current event
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const result = event.results[i][0].transcript;
            setTranscript(result);
            if (onFinalResultRef.current) {
              onFinalResultRef.current(result);
            }
          }
        }
      };

      recognition.onerror = (event: any) => {
        // 'no-speech' is harmless, it just means the user was quiet
        if (event.error !== 'no-speech') {
          setError(event.error);
        }
      };

      recognition.onend = () => {
        // If we are in continuous mode and haven't explicitly stopped, restart the listener
        if (isContinuousRef.current) {
           try { recognition.start(); } catch(e) {}
        } else {
           setIsListening(false);
        }
      };

      recognition.start();
    } catch (err: any) {
      setError(err.message);
    }
  }, [SpeechRecognition]);

  const stopListening = useCallback(() => {
    isContinuousRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return { 
    isListening, 
    transcript, 
    error,
    startListening,
    stopListening,
    clearTranscript: () => setTranscript('')
  };
}
