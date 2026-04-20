import { useState, useCallback } from 'react';

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

  // Check if the browser actually supports listening to speech
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  const startListening = useCallback((lang: string = 'ar-SA') => {
    if (!SpeechRecognition) {
      setError("Your browser doesn't support speech listening. Try using Chrome!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = false;   // Stop listening after one sentence
      recognition.interimResults = false; // Only give the final answer, not guesses along the way

      // When the "ear" opens
      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      // When it hears a sentence
      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };

      // When something goes wrong
      recognition.onerror = (event: any) => {
        setError(event.error);
        setIsListening(false);
      };

      // When it stops listening
      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setError(err.message);
    }
  }, [SpeechRecognition]);

  return { 
    isListening, 
    transcript, 
    error,
    startListening,
    clearTranscript: () => setTranscript('')
  };
}
