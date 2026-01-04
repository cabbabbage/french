import frenchDictionary from '../../french.json';
import type { WordEntry } from './types';
import { getBasicInfoProgress } from './basicInfoProgress';

interface RawWordEntry {
  french_word: string;
  part_of_speech: WordEntry['part_of_speech'];
  english_meanings: string[];
  pronunciation_guide?: string;
  learning_phases: Record<string, { user_progress: number; target_progress: number }>;
  noun_data?: Record<string, unknown>;
  verb_data?: Record<string, unknown>;
  adjective_data?: Record<string, unknown>;
  adverb_data?: Record<string, unknown>;
}

function normalizeWord(raw: RawWordEntry): WordEntry {
  const progress = getBasicInfoProgress(raw.french_word);
  const step = typeof progress.basic_info_step === 'number' ? progress.basic_info_step : 0;
  return {
    french_word: raw.french_word,
    part_of_speech: raw.part_of_speech,
    english_meanings: raw.english_meanings ? [...raw.english_meanings] : [],
    pronunciation_guide: raw.pronunciation_guide,
    basic_info_step: step,
    basic_info_completed: progress.basic_info_completed,
    learning_phases: raw.learning_phases,
    noun_data: raw.noun_data,
    verb_data: raw.verb_data,
    adjective_data: raw.adjective_data,
    adverb_data: raw.adverb_data
  };
}

export function loadWordEntries(): WordEntry[] {
  return (frenchDictionary as RawWordEntry[]).map(normalizeWord);
}
