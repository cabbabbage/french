import type { WordEntry } from '@core/types';
import { setBasicInfoProgress } from '@core/basicInfoProgress';

export type AttemptOutcome = 'correct_first' | 'correct_second' | 'wrong_second';

export interface AttemptResult {
  updatedWord: WordEntry;
  delta: number;
  reason: string;
}

export function commitAttemptOutcome(word: WordEntry, outcome: AttemptOutcome): AttemptResult {
  let nextStep = word.basic_info_step;
  let delta = 0;
  let reason = '';

  if (outcome === 'correct_first') {
    nextStep += 1;
    delta = 1;
    reason = 'Correct on the first attempt advances the ladder.';
  } else if (outcome === 'wrong_second') {
    nextStep -= 1;
    delta = -1;
    reason = 'Two incorrect attempts move you back one step.';
  } else {
    reason = 'Correct on the second attempt keeps the current step intact.';
  }

  const persisted = setBasicInfoProgress(word.french_word, { basic_info_step: nextStep });
  return {
    updatedWord: {
      ...word,
      basic_info_step: persisted.basic_info_step,
      basic_info_completed: persisted.basic_info_completed
    },
    delta,
    reason
  };
}
