import React, { useMemo, useState } from 'react';
import { loadWordEntries } from '@core/dataModel';
import { generateEnglishDistractors } from './utils';
import type { WordEntry } from '@core/types';
import type { BasicInfoTestDefinition } from '@core/basicInfo/tests';

interface FrToEnSelectMCProps {
  word: WordEntry;
  test: BasicInfoTestDefinition;
  attemptIndex: number;
  onSubmit: (correct: boolean) => void;
}

export const FrToEnSelectMC: React.FC<FrToEnSelectMCProps> = ({ word, test, attemptIndex, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const allWords = useMemo(() => loadWordEntries(), []);
  const correctAnswer = word.english_meanings[0] || '';

  const options = useMemo(() => {
    const distractors = generateEnglishDistractors(word, allWords, 3);
    return [...distractors, correctAnswer].sort(() => Math.random() - 0.5);
  }, [word, allWords, correctAnswer]);

  const handleSubmit = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === correctAnswer;
    onSubmit(isCorrect);
  };

  return (
    <div className="basic-info-mc">
      <div className="mc-prompt">
        <p>What does <strong>"{word.french_word}"</strong> mean?</p>
      </div>
      <div className="mc-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`mc-option ${selectedOption === option ? 'selected' : ''}`}
            onClick={() => setSelectedOption(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mc-actions">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedOption}
          className="submit-btn"
        >
          Submit Answer
        </button>
      </div>
    </div>
  );
};
