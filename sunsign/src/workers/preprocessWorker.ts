/// <reference lib="webworker" />
import { normalizeLandmarks } from '../utils/landmarkNormalizer';

/**
 * Preprocess Worker
 * =================
 * This script runs in the background so it doesn't slow down the main website.
 * Its job is to take the raw hand dots from MediaPipe and clean them up 
 * before we send them to the AI model.
 * 
 * Cleaning up involves:
 *  1. Normalizing: Making the hand the same size no matter how close it is to the camera.
 *  2. Mirroring: Flipping the left hand so it looks like a right hand (the AI only knows right hands).
 *  3. Buffering: Saving the last 20 frames so the AI can see the "movement" of a sign.
 */

const normalizedBuffer: number[][] = [];
const mirroredBuffer: number[][] = [];
const MAX_BUFFER_SIZE = 20;

let lastPushTime = 0;
const TIME_BETWEEN_FRAMES_MS = 60; // We only save a frame every 60ms to keep it smooth

self.onmessage = (e: MessageEvent) => {
  const { landmarks, handedness } = e.data;

  if (landmarks && landmarks.length > 0) {
    const hands = landmarks.map((hand: any, i: number) => {
      // Secret tip: Front-facing cameras flip the hand labels!
      // If MediaPipe says "Left", it's usually the user's RIGHT hand.
      const mpLabel: string = handedness?.[i]?.label ?? 'Left';
      const isRight = mpLabel === 'Left'; 

      return {
        normalized: normalizeLandmarks(hand, false),
        mirrored:   normalizeLandmarks(hand, true),
        isRight,
      };
    });
    
    // -- Movement Tracking (for the LSTM model) --
    // We only take a new frame if enough time has passed
    const now = Date.now();
    if (now - lastPushTime >= TIME_BETWEEN_FRAMES_MS) {
      lastPushTime = now;
      
      // Save the main hand's position
      normalizedBuffer.push(hands[0].normalized);
      mirroredBuffer.push(hands[0].mirrored);
      
      // If the list gets too long (more than 20), delete the oldest one
      if (normalizedBuffer.length > MAX_BUFFER_SIZE) {
        normalizedBuffer.shift();
        mirroredBuffer.shift();
      }
    }
    
    // Send the cleaned-up data back to the main website
    self.postMessage({ 
      hands,
      lstmSequence: normalizedBuffer.length === MAX_BUFFER_SIZE ? {
        normalized: [...normalizedBuffer],
        mirrored: [...mirroredBuffer]
      } : null
    });
  } else {
    // If the hand is gone, clear our memory so we don't get confused
    normalizedBuffer.length = 0;
    mirroredBuffer.length = 0;
    self.postMessage({ hands: [], lstmSequence: null });
  }
};
