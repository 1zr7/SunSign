import { describe, it, expect } from 'vitest';
import { normalizeLandmarks } from '../utils/landmarkNormalizer';

/**
 * landmarkNormalizer Tests
 * ========================
 * These tests check if our "Hand Cleaner" math is actually working.
 * We throw some fake hand points at it and see if it makes them 
 * standard and wrist-friendly.
 */

describe('landmarkNormalizer', () => {
  it('returns empty array if not 21 landmarks', () => {
    // If we only find 1 dot (instead of 21), it should just give up.
    expect(normalizeLandmarks([])).toEqual([]);
    expect(normalizeLandmarks([{ x: 0, y: 0, z: 0 }])).toEqual([]);
  });

  it('normalizes relative to wrist (index 0)', () => {
    // We create a fake hand where points are far away (starting at 10, 20, 30)
    const mockLandmarks = Array(21).fill(0).map((_, i) => ({
      x: 10 + i, 
      y: 20,     
      z: 30      
    }));

    const result = normalizeLandmarks(mockLandmarks);
    
    // The wrist (first dot) should now be at 0,0,0
    expect(result[0]).toBe(0);
    expect(result[1]).toBe(0);
    expect(result[2]).toBe(0);

    // The furthest finger tip should be scaled to 1.0
    const dist = 20; 
    expect(result[60]).toBeCloseTo(20 / dist);
  });
});
