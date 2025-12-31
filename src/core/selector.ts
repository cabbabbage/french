import type { Candidate, SelectorHistory, UserCapabilities, WordEntry } from './types';
import { sequentialTests } from './testCatalog';

const HISTORY_STORAGE_KEY = 'french-learning-selector-history';
const MAX_HISTORY_ITEMS = 3; // Only track recent words to avoid repeats

export function selectNextCandidate(
  words: WordEntry[],
  capabilities: UserCapabilities,
  history: SelectorHistory
): Candidate | null {
  // Get available words (progress < 9)
  const availableWords = words.filter(word => word.progress < 9);

  if (availableWords.length === 0) {
    return null;
  }

  // Filter out recently selected words (avoid consecutive repeats)
  let candidateWords = availableWords;
  if (history.recentWords.length > 0) {
    const lastWord = history.recentWords[0];
    candidateWords = availableWords.filter(word => word.french_word !== lastWord);
    // If filtering removes all words and we have only one word total, allow it
    if (candidateWords.length === 0 && availableWords.length === 1) {
      candidateWords = availableWords;
    }
  }

  if (candidateWords.length === 0) {
    return null;
  }

  // Select random word
  const randomIndex = Math.floor(Math.random() * candidateWords.length);
  const selectedWord = candidateWords[randomIndex];

  // Map progress to test
  const testIndex = Math.min(selectedWord.progress, sequentialTests.length - 1);
  const selectedTest = sequentialTests[testIndex];

  // Check if test requires audio capabilities we don't have
  if ((selectedTest.requires_audio_output && !capabilities.has_audio_output) ||
      (selectedTest.requires_audio_input && !capabilities.has_audio_input)) {
    // Skip this word for now - audio capability not available
    // Remove from available words and try again
    const remainingWords = candidateWords.filter(word => word.french_word !== selectedWord.french_word);
    if (remainingWords.length === 0) {
      return null; // No words available with current capabilities
    }
    // Recursively try with remaining words (but avoid infinite recursion by limiting depth)
    const subHistory = { ...history, recentWords: [] }; // Don't penalize recent selection for capability filtering
    return selectNextCandidate(remainingWords.map(word => ({ ...word })), capabilities, subHistory);
  }

  // Update history
  history.recentWords.unshift(selectedWord.french_word);
  history.recentWords = history.recentWords.slice(0, MAX_HISTORY_ITEMS);

  return {
    word: selectedWord,
    test: selectedTest
  };
}

function safeParseHistory(raw: unknown): SelectorHistory {
  if (!raw || typeof raw !== 'object') {
    return { recentWords: [], recentTestTypes: [] };
  }
  const data = raw as Partial<SelectorHistory>;
  const sanitize = (list: unknown): string[] =>
    Array.isArray(list) ? list.filter((item) => typeof item === 'string').slice(0, MAX_HISTORY_ITEMS) : [];
  return {
    recentWords: sanitize(data.recentWords),
    recentTestTypes: sanitize(data.recentTestTypes)
  };
}

export function loadSelectorHistory(): SelectorHistory {
  if (typeof window === 'undefined') {
    return { recentWords: [], recentTestTypes: [] };
  }
  try {
    const serialized = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!serialized) {
      return { recentWords: [], recentTestTypes: [] };
    }
    const parsed = JSON.parse(serialized);
    return safeParseHistory(parsed);
  } catch {
    return { recentWords: [], recentTestTypes: [] };
  }
}

export function persistSelectorHistory(history: SelectorHistory): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const snapshot = {
      recentWords: history.recentWords.slice(0, MAX_HISTORY_ITEMS),
      recentTestTypes: history.recentTestTypes.slice(0, MAX_HISTORY_ITEMS)
    };
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage failures (user might have disabled localStorage)
  }
}
