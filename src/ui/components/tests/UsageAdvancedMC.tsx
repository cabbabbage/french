
import React from 'react';
import { MCVariant } from './common/MCVariant';
import type { TestVariantProps } from './types';

const DISTRACTORS = ['ami', 'ville', 'carte'];

export const UsageAdvancedMC: React.FC<TestVariantProps> = (props) => {
  const meaning = props.word.english_meanings[0] ?? 'the prompt';
  const prompt = `Usage advanced prompts: match the French word to "${meaning}".`;
  return (
    <MCVariant
      {...props}
      prompt={prompt}
      options={[...DISTRACTORS, props.word.french_word]}
      answer={props.word.french_word}
      helper="Review the prompt before submitting."
    />
  );
};
