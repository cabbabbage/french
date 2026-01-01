import React from 'react';
import type { AttemptResult } from '@core/basicInfo/orchestrator';

interface HighlightWord {
  french: string;
  english: string[];
}

interface BaseTestUIProps {
  title: string;
  description: string;
  attempts: number;
  maxAttempts: number;
  statusMessage?: string;
  disabled?: boolean;
  label?: string | null;
  highlightWord?: HighlightWord;
  answerLanguage?: 'french' | 'english' | null;
  submissionResult?: AttemptResult | null;
  children: React.ReactNode;
}

export const BaseTestUI: React.FC<BaseTestUIProps> = ({
  title,
  description,
  attempts,
  maxAttempts,
  statusMessage,
  disabled,
  label = 'Test',
  highlightWord,
  answerLanguage,
  submissionResult,
  children
}) => {
  const englishText = highlightWord?.english.filter(Boolean).join(' / ');

  // Determine outline class based on submission result
  const getOutlineClass = () => {
    if (submissionResult) {
      // Test completed with result
      if (submissionResult.outcome === 'correct_first' || submissionResult.outcome === 'correct_second') {
        return 'test-ui--correct';
      } else if (submissionResult.outcome === 'wrong_second') {
        return 'test-ui--wrong-both';
      }
    } else if (attempts > 1) {
      // Show orange border during second attempt (after first wrong)
      return 'test-ui--first-wrong';
    }
    return '';
  };

  const outlineClass = getOutlineClass();

  return (
    <section className={`test-ui${disabled ? ' test-ui--disabled' : ''}${outlineClass ? ` ${outlineClass}` : ''}`}>
      <header>
        {label && <p className="eyebrow">{label}</p>}
        <h2>{title}</h2>
      </header>
      <div className="test-body">{children}</div>
    </section>
  );
};
