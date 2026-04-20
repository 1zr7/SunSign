import { useState, useEffect } from 'react';

/**
 * useSignAnimator
 * ===============
 * This hook tells the 3D avatar exactly how to move for a specific sign.
 *
 * How it works:
 *  1. It check if we have a direct recording of the sign (moving sign).
 *  2. If not, it breaks the word into individual Arabic letters and 
 *     spells them out (fingerspelling).
 */

export interface TrackFrame {
  time: number;  // When this pose happens (in seconds)
  pose: any;     // Where the dots are in space
}

export interface AnimationTrack {
  totalDuration: number;
  frames: TrackFrame[];
  /** 'dynamic' means a moving sign, 'fingerspell' means spelling one letter at a time */
  type: 'dynamic' | 'fingerspell';
}

/**
 * Breaks a word into separate letters for the avatar to spell.
 * It also handles special combinations like 'La' (لا) and 'Al' (ال).
 */
function decomposeArabic(word: string, staticDict: Record<string, any>): string[] {
  // Simplify the Arabic characters so they match our animation files
  const normalized = word
    .replace(/[اآإأٱ]/g, 'أ')  // All 'A' variants become the same sign
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, ''); // Remove the tiny marks (tashkeel)

  const twoCharKeys = new Set(Object.keys(staticDict).filter(k => k.length === 2));
  const tokens: string[] = [];
  let i = 0;

  while (i < normalized.length) {
    const ch = normalized[i];
    if (ch === ' ') {
      tokens.push(' ');
      i++;
      continue;
    }

    // Look for 2-character marks first (like 'ال')
    if (i + 1 < normalized.length) {
      const two = normalized.slice(i, i + 2);
      if (twoCharKeys.has(two)) {
        tokens.push(two);
        i += 2;
        continue;
      }
    }

    // Just a single letter
    if (staticDict[ch] !== undefined) {
      tokens.push(ch);
    }
    i++;
  }
  return tokens;
}

export function useSignAnimator(activeSign: string | null, dictionary: any): AnimationTrack | null {
  const [track, setTrack] = useState<AnimationTrack | null>(null);

  useEffect(() => {
    // If no word is picked, don't move
    if (!dictionary || !activeSign) {
      setTrack(null);
      return;
    }

    const dynDict: Record<string, any[]> = dictionary.dynamic ?? {};
    const lookup = activeSign.toLowerCase() === 'learning' ? 'thinking' : activeSign;

    // -- Step 1: Look for a moving sign (dynamic) --
    const dynEntry: any[] | undefined =
      dynDict[lookup] ??
      dynDict[activeSign] ??
      (Object.entries(dynDict).find(([k]) => k.toLowerCase() === lookup.toLowerCase())?.[1] as any[] | undefined);

    if (dynEntry) {
      const FPS = 30; // 30 frames per second
      const fd = 1.0 / FPS;
      setTrack({
        type: 'dynamic',
        totalDuration: dynEntry.length * fd,
        frames: dynEntry.map((frame: any, i: number) => ({ 
          time: i * fd, 
          pose: frame 
        })),
      });
      return;
    }

    // -- Step 2: Spell it out (static letters) --
    if (dictionary.static) {
      const tokens = decomposeArabic(activeSign, dictionary.static);
      const HOLD = 0.45;  // Hold each letter for almost half a second
      const GAP  = 0.18;  // Small pause between letters
      const frames: TrackFrame[] = [];
      let t = 0;

      tokens.forEach((ch, i) => {
        if (ch === ' ') { 
          t += 0.35; // Longer pause for spaces between words
          return; 
        }
        const frame = dictionary.static[ch];
        if (!frame) return;

        // Set the pose, wait a bit, then move to the next
        frames.push({ time: t, pose: frame });
        t += HOLD;
        frames.push({ time: t, pose: frame });

        if (i < tokens.length - 1) t += GAP;
      });

      setTrack(frames.length > 0 ? { type: 'fingerspell', totalDuration: t, frames } : null);
    } else {
      setTrack(null);
    }
  }, [activeSign, dictionary]);

  return track;
}
