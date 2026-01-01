import React, { useMemo, useState } from 'react';
import { loadWordEntries } from '@core/dataModel';
import { generateFrenchDistractors } from './utils';
import type { WordEntry } from '@core/types';
import type { BasicInfoTestDefinition } from '@core/basicInfo/tests';

interface EnToFrSelectMCProps {
  word: WordEntry;
  test: BasicInfoTestDefinition;
  attemptIndex: number;
  onSubmit: (correct: boolean) => void;
}

export const EnToFrSelectMC: React.FC<EnToFrSelectMCProps> = ({ word, test, attemptIndex, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const allWords = useMemo(() => loadWordEntries(), []);
  const englishPrompt = word.english_meanings[0] || 'the word';

  const options = useMemo(() => {
    const distractors = generateFrenchDistractors(word, allWords, 3);
    return [...distractors, word.french_word].sort(() => Math.random() - 0.5);
  }, [word, allWords]);

  const handleSubmit = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === word.french_word;
    onSubmit(isCorrect);
  };

  return (
    <div className="basic-info-mc">
      <div className="mc-prompt">
        <p><strong>{englishPrompt}</strong></p>
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
