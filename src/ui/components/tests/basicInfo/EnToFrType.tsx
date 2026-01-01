import React, { useState } from 'react';
import { normalizeText } from './utils';
import type { WordEntry } from '@core/types';
import type { BasicInfoTestDefinition } from '@core/basicInfo/tests';

interface EnToFrTypeProps {
  word: WordEntry;
  test: BasicInfoTestDefinition;
  attemptIndex: number;
  onSubmit: (correct: boolean) => void;
}

export const EnToFrType: React.FC<EnToFrTypeProps> = ({ word, test, attemptIndex, onSubmit }) => {
  const [input, setInput] = useState('');

  const englishPrompt = word.english_meanings[0] || 'the word';
  const correctAnswer = word.french_word;

  const handleSubmit = () => {
    const normalizedInput = normalizeText(input);
    const normalizedAnswer = normalizeText(correctAnswer);
    const isCorrect = normalizedInput === normalizedAnswer;
    onSubmit(isCorrect);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="basic-info-type">
      <div className="type-prompt">
        <p>Type the French word for: <strong>"{englishPrompt}"</strong></p>
      </div>
      <div className="type-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer..."
          autoFocus
        />
      </div>
      <div className="type-actions">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="submit-btn"
        >
          Submit Answer
        </button>
      </div>
      <div className="type-hint">
        <p>Tip: Pay attention to accents and spelling.</p>
      </div>
    </div>
  );
};
