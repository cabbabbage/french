import React, { useState } from 'react';
import { normalizeText } from './utils';
import type { WordEntry } from '@core/types';
import type { BasicInfoTestDefinition } from '@core/basicInfo/tests';

interface FrToEnTypeProps {
  word: WordEntry;
  test: BasicInfoTestDefinition;
  attemptIndex: number;
  onSubmit: (correct: boolean) => void;
}

export const FrToEnType: React.FC<FrToEnTypeProps> = ({ word, test, attemptIndex, onSubmit }) => {
  const [input, setInput] = useState('');

  const correctAnswer = word.english_meanings[0] || '';

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
        <p>What does <strong>"{word.french_word}"</strong> mean?</p>
      </div>
      <div className="type-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type the English meaning..."
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
    </div>
  );
};
