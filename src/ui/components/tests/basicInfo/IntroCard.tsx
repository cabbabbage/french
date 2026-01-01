import React from 'react';
import { POSDetails } from '@ui/components/POSDetails';
import type { WordEntry } from '@core/types';

interface IntroCardProps {
  word: WordEntry;
  onNext: () => void;
}

export const IntroCard: React.FC<IntroCardProps> = ({ word, onNext }) => {
  if (!word) {
    return (
      <div className="basic-info-intro">
        <div className="intro-content">
          <h3>Loading...</h3>
          <p className="intro-description">Preparing your learning session.</p>
        </div>
        <div className="intro-actions">
          <button type="button" onClick={onNext} className="continue-btn">
            Next
          </button>
        </div>
      </div>
    );
  }

  const englishMeanings = word.english_meanings && Array.isArray(word.english_meanings)
    ? word.english_meanings.filter(Boolean).join(' / ')
    : 'Translation not available';

  return (
    <div className="basic-info-intro">
      <div className="intro-content">
        <div className="word-display">
          <p className="french-word">{word.french_word || 'Unknown word'}</p>
          <p className="english-meanings">{englishMeanings}</p>
        </div>
        {word && <POSDetails word={word} />}
      </div>
      <div className="intro-actions">
        <button type="button" onClick={onNext} className="continue-btn">
          Next
        </button>
      </div>
    </div>
  );
};
