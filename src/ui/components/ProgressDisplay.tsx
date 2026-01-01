import React, { useState, useEffect } from 'react';
import { loadWordEntries } from '@core/dataModel';
import { getBasicInfoProgress, setBasicInfoProgress } from '@core/basicInfoProgress';
import { COMPLETION_STEP } from '@core/basicInfo/tests';
import type { WordEntry } from '@core/types';

interface WordProgressItemProps {
  word: WordEntry;
  onReset: (wordKey: string) => void;
}

const WordProgressItem: React.FC<WordProgressItemProps> = ({ word, onReset }) => {
  const progress = getBasicInfoProgress(word.french_word);
  const progressPercent = (progress.basic_info_step / COMPLETION_STEP) * 100;
  const isCompleted = progress.basic_info_completed;

  const englishMeanings = word.english_meanings?.filter(Boolean).join(' / ') || 'No translation';

  const handleReset = () => {
    onReset(word.french_word);
  };

  return (
    <div className="word-progress-item">
      <div className="word-info">
        <div className="word-text">
          <span className="french-word">{word.french_word}</span>
          <span className="english-meanings">{englishMeanings}</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="reset-word-btn"
          title="Reset this word's progress"
        >
          ↻
        </button>
      </div>
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className={`progress-fill ${isCompleted ? 'completed' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="progress-text">
          {progress.basic_info_step}/{COMPLETION_STEP}
          {isCompleted && ' ✓'}
        </span>
      </div>
    </div>
  );
};

export const ProgressDisplay: React.FC = () => {
  const [words, setWords] = useState<WordEntry[]>([]);

  const loadWords = () => {
    setWords(loadWordEntries());
  };

  useEffect(() => {
    loadWords();
  }, []);

  useEffect(() => {
    const handleProgressUpdate = () => {
      loadWords();
    };

    window.addEventListener('progressUpdated', handleProgressUpdate);
    window.addEventListener('progressReset', handleProgressUpdate);

    return () => {
      window.removeEventListener('progressUpdated', handleProgressUpdate);
      window.removeEventListener('progressReset', handleProgressUpdate);
    };
  }, []);

  // Sort: completed words first, then by progress descending
  const sortedWords = [...words].sort((a, b) => {
    const aProgress = getBasicInfoProgress(a.french_word);
    const bProgress = getBasicInfoProgress(b.french_word);

    // Completed words first
    if (aProgress.basic_info_completed && !bProgress.basic_info_completed) return -1;
    if (!aProgress.basic_info_completed && bProgress.basic_info_completed) return 1;

    // Then by progress percentage descending
    const aPercent = (aProgress.basic_info_step / COMPLETION_STEP) * 100;
    const bPercent = (bProgress.basic_info_step / COMPLETION_STEP) * 100;
    return bPercent - aPercent;
  });

  const handleResetWord = (wordKey: string) => {
    setBasicInfoProgress(wordKey, {
      basic_info_step: 0,
      basic_info_completed: false
    });
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('progressReset'));
  };

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
      words.forEach(word => {
        setBasicInfoProgress(word.french_word, {
          basic_info_step: 0,
          basic_info_completed: false
        });
      });
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('progressReset'));
    }
  };

  const completedCount = words.filter(word =>
    getBasicInfoProgress(word.french_word).basic_info_completed
  ).length;

  return (
    <div className="progress-display">
      <div className="progress-header">
        <h3>Word Progress</h3>
        <p className="progress-summary">
          {completedCount} of {words.length} words completed
        </p>
      </div>
      <div className="word-progress-list">
        {sortedWords.map(word => (
          <WordProgressItem
            key={word.french_word}
            word={word}
            onReset={handleResetWord}
          />
        ))}
      </div>
      <div className="progress-actions">
        <button
          type="button"
          onClick={handleResetAll}
          className="reset-all-btn"
        >
          Reset All Progress
        </button>
      </div>
    </div>
  );
};
