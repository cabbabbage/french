
import React from 'react';
import { TextVariant } from './common/TextVariant';
import type { TestVariantProps } from './types';

export const EnToFrMatchTXT: React.FC<TestVariantProps> = (props) => {
  const meaning = props.word.english_meanings[0] ?? 'the prompt';
  const prompt = `English to French match: type the French entry for "${meaning}".`;
  return (
    <TextVariant
      {...props}
      prompt={prompt}
      answer={props.word.french_word}
      placeholder="Type the correct word"
    />
  );
};
