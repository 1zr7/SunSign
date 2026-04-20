import { describe, it, expect } from 'vitest';
import { tokenizeArabic } from '../utils/glossTokenizer';

/**
 * glossTokenizer Tests
 * ====================
 * These are like mini-exams for our code. 
 * We give the tool a sentence and check if it breaks it apart 
 * correctly into signs.
 */

describe('glossTokenizer', () => {
  it('splits sentences into words', () => {
    // If we give it "Hello you", it should give back ["Hello", "you"]
    expect(tokenizeArabic("مرحبا بك")).toEqual(["مرحبا", "بك"]);
  });

  it('removes punctuation', () => {
    // It should ignore dots and question marks
    expect(tokenizeArabic("مرحبا! كيف حالك؟")).toEqual(["مرحبا", "كيف", "حالك"]);
  });

  it('removes Arabic marks (tashkeel)', () => {
    // It should strip the tiny marks above/below letters to make the word "clean"
    expect(tokenizeArabic("مُحَمَّدٌ")).toEqual(["محمد"]);
    expect(tokenizeArabic("الشَّمْسُ")).toEqual(["الشمس"]);
  });
});
