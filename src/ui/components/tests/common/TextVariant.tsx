import React, { useEffect, useMemo, useState } from 'react';
import { BaseTestUI } from '@ui/components/BaseTestUI';
import { useTestSession } from '../session';
import type { SubmissionFeedback, TestVariantProps } from '../types';

interface TextVariantProps extends TestVariantProps {
  prompt: string;
  answer: string;
  placeholder?: string;
}

export const TextVariant: React.FC<TextVariantProps> = ({
  word,
  test,
  prompt,
  answer,
  placeholder = 'Type your response here',
  onComplete
}) => {
  const { attempts, maxAttempts, completed, showContinue, submitAttempt, continueSession } = useTestSession(onComplete);
  const [value, setValue] = useState('');
  const [feedback, setFeedback] = useState<SubmissionFeedback | null>(null);

  const normalizedAnswer = useMemo(() => answer.trim().toLowerCase(), [answer]);
  const phaseName = test.phase.replace(/_/g, ' ');

  const handleSubmit = () => {
    if (completed) {
      return;
    }
    const normalizedValue = value.trim().toLowerCase();
    if (!normalizedValue) {
      return;
    }
    const isCorrect = normalizedValue === normalizedAnswer;
    setFeedback({
      correct: isCorrect,
      message: isCorrect ? 'Correct! Nice work.' : 'Incorrect, give it another try.'
    });
    submitAttempt(isCorrect);
  };

  const handleContinue = () => {
    continueSession();
  };

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

  return (
    <BaseTestUI
      title={`${phaseName} - Text entry`}
      description={prompt}
      attempts={attempts}
      maxAttempts={maxAttempts}
      statusMessage="Type the word that matches the prompt."
      disabled={completed}
    >
      <div className="text-variant">
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={completed || showContinue}
        />
        <div className="text-actions">
          {showContinue ? (
            <button type="button" onClick={handleContinue}>
              Continue
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={completed}>
              Submit text answer
            </button>
          )}
          <button type="button" onClick={() => console.info('Play audio stub')} disabled={!test.requires_audio_output}>
            {test.requires_audio_output ? 'Play required dictation' : 'Play optional pronunciation'}
          </button>
        </div>
      </div>
      {feedback && (
        <div className={`submission-feedback submission-feedback--${feedback.correct ? 'correct' : 'incorrect'}`}>
          {feedback.message}
        </div>
      )}
      <p className="muted-text">
        {test.requires_audio_output
          ? 'This variant requires listening to audio before typing.'
          : 'You can type the answer without audio playback.'}
      </p>
    </BaseTestUI>
  );
};
