/**
 * useGlossNLP
 * ===========
 * This hook turns normal Arabic or English sentences into a list of 
 * sign names (glosses). 
 * 
 * It can use a smart AI (like Ollama or LM Studio) to do the translation 
 * if you have it running on your computer. If not, it uses a simpler 
 * "word-by-word" tool instead.
 *
 * How it works:
 *  1. It gives the AI a list of all the signs the 3D avatar knows.
 *  2. It asks the AI to pick the best signs for your sentence.
 *  3. If the AI is broken or too slow, it uses the fallback tool.
 */

import { useState, useCallback, useRef } from 'react';
import { tokenizeArabic } from '../utils/glossTokenizer';
import { arabicDictionary } from '../utils/arabicDictionary';

// -- Getting all words our avatar knows --
const VOCAB_KEYS = Object.keys(arabicDictionary);
const VOCAB_VALUES = [...new Set(Object.values(arabicDictionary))];
const ALL_VOCAB = [...new Set([...VOCAB_KEYS, ...VOCAB_VALUES])];

// -- The "Instruction Manual" for the AI --
const SYSTEM_PROMPT = `You are an Arabic Sign Language (ArSL) translator.

Your job:
Turn normal Arabic or English text into a list of sign names (JSON array).

Rules:
1. ONLY use words from this list.
2. If a word is missing, spell it out in Arabic letters (e.g. "كلب" -> ["ك","ل","ب"]).
3. Use sign language order (simple words, ignore "the", "is", "a").
4. No repeating signs.
5. Send ONLY the JSON list. No talking, no markdown.

Allowed words:
${JSON.stringify(ALL_VOCAB)}

Examples:
Input: "أنا جائع وأريد أن آكل" -> Output: ["eat"]
Input: "good morning" -> Output: ["Good morning"]`;

// -- Types --
export type LLMProvider = 'ollama' | 'lmstudio';

export interface GlossNLPConfig {
  enabled: boolean;
  provider: LLMProvider;
  customBaseUrl?: string; // If you changed the server address
  model: string;          // The name of the AI model
}

export interface GlossNLPResult {
  tokens: string[];       // The final list of sign names
  isLoading: boolean;     // Is the AI still thinking?
  error: string | null;   // Did something go wrong?
  glossify: (text: string) => Promise<string[]>; // The function to run
}

export const PROVIDER_URLS: Record<LLMProvider, string> = {
  ollama: 'http://localhost:11434',
  lmstudio: 'http://localhost:1234',
};

// -- The Hook --
export function useGlossNLP(config: GlossNLPConfig): GlossNLPResult {
  const [tokens, setTokens] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Used to cancel a request if the user types a new sentence quickly
  const abortRef = useRef<AbortController | null>(null);

  const glossify = useCallback(async (text: string): Promise<string[]> => {
    // -- Step 1: Check if we even need the AI --
    if (!config.enabled || !text.trim()) {
      const fallback = tokenizeArabic(text);
      setTokens(fallback);
      return fallback;
    }

    // Cancel the old request if it's still running
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Give the AI 15 seconds to answer before we give up
    const timeoutId = setTimeout(() => ctrl.abort(), 15000);

    setIsLoading(true);
    setError(null);

    const baseUrl = config.customBaseUrl?.trim() || PROVIDER_URLS[config.provider];
    const endpoint = `${baseUrl}/v1/chat/completions`;

    try {
      // -- Step 2: Ask the AI --
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user',   content: text },
          ],
          temperature: 0.1, // Keep it from being too 'creative'
          max_tokens: 256,
          stream: false,
        }),
      });

      if (!res.ok) {
        throw new Error(`AI server said: ${res.status}`);
      }

      const json = await res.json();
      const raw: string = json?.choices?.[0]?.message?.content ?? '';

      // -- Step 3: Clean up the answer --
      // Sometimes the AI puts the answer inside ```json tags. We need to strip those.
      const cleaned = raw
        .replace(/```json?\s*/gi, '')
        .replace(/```/g, '')
        .trim();

      let parsed: string[];
      try {
        parsed = JSON.parse(cleaned);
        if (!Array.isArray(parsed)) throw new Error('Not a list');
        parsed = parsed.map(String).filter(Boolean);
      } catch {
        // AI sent back something that wasn't a list
        console.warn('[AI] Sent bad data, using fallback:', raw);
        parsed = tokenizeArabic(text);
        setError('AI sent a bad answer — used simple translation instead.');
      }

      clearTimeout(timeoutId);
      setTokens(parsed);
      setIsLoading(false);
      return parsed;

    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setIsLoading(false);
        return [];
      }

      // -- Step 4: Fallback (The AI failed) --
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[AI] Failed, using simple translation:', msg);

      const fallback = tokenizeArabic(text);
      setTokens(fallback);
      setError(`AI is not working (${msg}) — used simple translation instead.`);
      setIsLoading(false);
      return fallback;
    }
  }, [config]);

  return { tokens, isLoading, error, glossify };
}

// -- Saving and Loading Settings --
const LS_KEY = 'sunsign_gloss_nlp';

export function loadGlossConfig(): GlossNLPConfig {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...defaultGlossConfig(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultGlossConfig();
}

export const GLOSS_CONFIG_EVENT = 'sunsign:gloss-config-change';

export function saveGlossConfig(cfg: GlossNLPConfig): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new CustomEvent(GLOSS_CONFIG_EVENT));
  } catch { /* ignore */ }
}

export function defaultGlossConfig(): GlossNLPConfig {
  return {
    enabled: false,
    provider: 'ollama',
    customBaseUrl: '',
    model: 'qwen2.5:7b',
  };
}
