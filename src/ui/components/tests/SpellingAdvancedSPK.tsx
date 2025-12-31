
import React from 'react';
import { SpeechVariant } from './common/SpeechVariant';
import type { TestVariantProps } from './types';

export const SpellingAdvancedSPK: React.FC<TestVariantProps> = (props) => {
  const meaning = props.word.english_meanings[0] ?? 'the prompt';
  const prompt = `Advanced dictation: speak the French version of "${meaning}".`;
  return (
    <SpeechVariant
      {...props}
      prompt={prompt}
      answer={props.word.french_word}
      helper="Focus on clarity, then submit your transcript."
    />
  );
};
