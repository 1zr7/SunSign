import type { Landmark } from '@mediapipe/hands';

/**
 * landmarkNormalizer
 * ==================
 * This tool takes the 21 dots on your hand and cleans up the numbers.
 * 
 * It does two main things:
 *  1. It makes the wrist the center (0,0,0). Every other finger point 
 *     is calculated based on where the wrist is.
 *  2. It makes the hand size "standard." This way, the AI doesn't 
 *     get confused if your hand is close to the camera or far away.
 */

export function normalizeLandmarks(landmarks: Landmark[], mirrorX = false): number[] {
  // If no hand is found, return nothing
  if (!landmarks || landmarks.length === 0) return [];
  if (landmarks.length !== 21) return [];

  const wrist = landmarks[0];
  const list: number[] = [];

  // Step 1: Shift everything so the wrist is the center
  for (let i = 0; i < landmarks.length; i++) {
    let x = landmarks[i].x - wrist.x;
    const y = landmarks[i].y - wrist.y;
    const z = landmarks[i].z - wrist.z;
    
    // If it's a left hand, flip it so it looks like a right hand
    if (mirrorX) x = -x;
    
    list.push(x, y, z);
  }

  // Step 2: Make the hand a "standard" size
  // We find the finger that is furthest from the wrist and use that to scale everything.
  const distances = [];
  for (let i = 0; i < list.length; i += 3) {
    distances.push(Math.sqrt(list[i]**2 + list[i+1]**2 + list[i+2]**2));
  }
  const maxDist = Math.max(...distances) || 1;
  const normalized = list.map(v => v / maxDist);

  return normalized;
}
