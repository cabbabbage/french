import React, { useEffect, useMemo, useState } from 'react';
import { BaseTestUI } from '@ui/components/BaseTestUI';
import { useTestSession } from '../session';
import type { SubmissionFeedback, TestVariantProps } from '../types';

function shuffleArray<T>(items: T[]): T[] {
  const shuffled = items.slice();
  for (let i = shuffled.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface MCVariantProps extends TestVariantProps {
  prompt: string;
  options: string[];
  answer: string;
  helper?: string;
}

export const MCVariant: React.FC<MCVariantProps> = ({
  word,
  test,
  prompt,
  options,
  answer,
  helper,
  onComplete
}) => {
  const { attempts, maxAttempts, completed, showContinue, submitAttempt, continueSession } = useTestSession(onComplete);
  const [selection, setSelection] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SubmissionFeedback | null>(null);

  const normalizedAnswer = useMemo(() => answer.trim().toLowerCase(), [answer]);
  const sanitizedOptions = useMemo(
    () => Array.from(new Set([answer, ...options])).map((option) => option.trim()),
    [answer, options]
  );
  const shuffledOptions = useMemo(() => shuffleArray(sanitizedOptions), [sanitizedOptions]);

  useEffect(() => {
    setFeedback(null);
  }, [word.french_word]);

  useEffect(() => {
    if (showContinue && feedback && !feedback.correct) {
      setFeedback({
        correct: false,
        message: `Incorrect. The correct answer is: ${answer}`
      });
    }
  }, [showContinue, feedback, answer]);

  const handleSubmit = () => {
    if (!selection) {
      return;
    }
    const isCorrect = selection.trim().toLowerCase() === normalizedAnswer;
    setFeedback({
      correct: isCorrect,
      message: isCorrect ? 'Correct! Nice work.' : 'Incorrect, try again.'
    });
    submitAttempt(isCorrect);
  };

  const handleContinue = () => {
    continueSession();
  };

  const playLabel = test.requires_audio_output ? 'Play required audio' : 'Play optional audio preview';
  const phaseName = test.phase.replace(/_/g, ' ');

  return (
    <BaseTestUI
      title={`${phaseName} - Multiple choice`}
      description={prompt}
      attempts={attempts}
      maxAttempts={maxAttempts}
      statusMessage={helper}
      disabled={completed}
    >
      <div className="mc-options">
        {shuffledOptions.map((option) => (
          <button
            type="button"
            key={option}
            className={`mc-option ${selection === option ? 'mc-option--active' : ''}`}
            onClick={() => setSelection(option)}
            disabled={completed || showContinue}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mc-actions">
        {showContinue ? (
          <button type="button" onClick={handleContinue}>
            Continue
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={completed || !selection}>
            Submit answer
          </button>
        )}
        <button type="button" onClick={() => console.info('Play audio stub')} disabled={completed && !test.requires_audio_output}>
          {playLabel}
        </button>
      </div>
      {feedback && (
        <div className={`submission-feedback submission-feedback--${feedback.correct ? 'correct' : 'incorrect'}`}>
          {feedback.message}
        </div>
      )}
      <p className="muted-text">
        {test.requires_audio_output ? 'Audio playback is required for this variant.' : 'Audio is optional for reinforcement.'}
      </p>
    </BaseTestUI>
  );
};
