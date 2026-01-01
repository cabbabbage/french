import type { WordEntry } from '@core/types';

// Generate multiple choice distractors from other words
export function generateFrenchDistractors(targetWord: WordEntry, allWords: WordEntry[], count: number = 3): string[] {
  const otherWords = allWords.filter(word => word.french_word !== targetWord.french_word);
  const distractors: string[] = [];

  // Shuffle and take first 'count' words
  const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    distractors.push(shuffled[i].french_word);
  }

  return distractors;
}

export function generateEnglishDistractors(targetWord: WordEntry, allWords: WordEntry[], count: number = 3): string[] {
  const targetMeanings = targetWord.english_meanings;
  const distractors: string[] = [];

  // Collect meanings from other words
  const otherMeanings: string[] = [];
  allWords.forEach(word => {
    if (word.french_word !== targetWord.french_word) {
      otherMeanings.push(...word.english_meanings);
    }
  });

  // Shuffle and take unique meanings
  const shuffled = [...otherMeanings].sort(() => Math.random() - 0.5);
  const uniqueDistractors = [...new Set(shuffled)];

  for (let i = 0; i < Math.min(count, uniqueDistractors.length); i++) {
    distractors.push(uniqueDistractors[i]);
  }

  return distractors;
}

// Normalize text for comparison (case insensitive, trim whitespace)
export function normalizeText(text: string): string {
  return text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
