export interface WordEntry {
  french_word: string;
  part_of_speech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'expression';
  english_meanings: string[];
  pronunciation_guide?: string;
  basic_info_step: number;
  basic_info_completed: boolean;
  noun_data?: Record<string, unknown>;
  verb_data?: Record<string, unknown>;
  adjective_data?: Record<string, unknown>;
  adverb_data?: Record<string, unknown>;
}

export interface UserCapabilities {
  has_audio_output: boolean;
  has_audio_input: boolean;
}

export interface TestDefinition {
  id: string;
  requires_audio_output: boolean;
  requires_audio_input: boolean;
  description: string;
}

export interface Candidate {
  word: WordEntry;
  test: TestDefinition;
}

export interface SelectorHistory {
  recentWords: string[];
  recentTestTypes: string[];
}

export interface TestResult {
  resultCode: 0 | 1 | 2;
  attempts: number;
}

export interface ScoringOutcome {
  delta: number;
  reason: string;
}
