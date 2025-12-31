import type { TestDefinition, WordEntry } from '@core/types';

export interface TestVariantProps {
  word: WordEntry;
  test: TestDefinition;
  onComplete: (resultCode: 0 | 1 | 2) => void;
}

export interface SubmissionFeedback {
  correct: boolean;
  message: string;
}
