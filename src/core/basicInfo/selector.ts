import type { UserCapabilities, WordEntry } from '@core/types';
import { BASIC_INFO_TESTS, LAST_STEP } from './tests';

export interface SelectionPool {
  remainingWords: WordEntry[];
  blockedByAudio: WordEntry[];
  eligibleWords: WordEntry[];
}

export interface BasicInfoSelection {
  word: WordEntry;
  test: typeof BASIC_INFO_TESTS[number];
}

function getStepIndex(word: WordEntry): number {
  if (word.basic_info_step <= LAST_STEP) {
    return word.basic_info_step;
  }
  return LAST_STEP;
}

function testForWord(word: WordEntry) {
  const index = getStepIndex(word);
  return BASIC_INFO_TESTS[index];
}

function isAudioCompatible(word: WordEntry, capabilities: UserCapabilities): boolean {
  const test = testForWord(word);
  if (test.requires_audio_output && !capabilities.has_audio_output) {
    return false;
  }
  if (test.requires_audio_input && !capabilities.has_audio_input) {
    return false;
  }
  return true;
}

export function buildSelectionPool(words: WordEntry[], capabilities: UserCapabilities): SelectionPool {
  const remainingWords = words.filter((word) => !word.basic_info_completed);
  const blockedByAudio = remainingWords.filter((word) => !isAudioCompatible(word, capabilities));
  const eligibleWords = remainingWords.filter((word) => isAudioCompatible(word, capabilities));

  return { remainingWords, blockedByAudio, eligibleWords };
}

export function selectRandomWord(
  eligibleWords: WordEntry[],
  lastWordId?: string | null
): WordEntry | null {
  if (eligibleWords.length === 0) {
    return null;
  }
  let pool = eligibleWords;
  if (lastWordId && eligibleWords.length > 1) {
    const filtered = eligibleWords.filter((word) => word.french_word !== lastWordId);
    if (filtered.length > 0) {
      pool = filtered;
    }
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export function createSelection(words: WordEntry[], capabilities: UserCapabilities, lastWordId?: string | null): BasicInfoSelection | null {
  const pool = buildSelectionPool(words, capabilities);
  const word = selectRandomWord(pool.eligibleWords, lastWordId);
  if (!word) {
    return null;
  }
  return {
    word,
    test: testForWord(word)
  };
}

export function getTestForWord(word: WordEntry) {
  return testForWord(word);
}
