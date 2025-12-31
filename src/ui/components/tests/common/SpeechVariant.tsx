import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BaseTestUI } from '@ui/components/BaseTestUI';
import { useTestSession } from '../session';
import type { SubmissionFeedback, TestVariantProps } from '../types';
import { createSpeechRecognitionInstance, isSpeechRecognitionSupported, speakFrenchWord } from './audioHelpers';

interface SpeechVariantProps extends TestVariantProps {
  prompt: string;
  answer: string;
  helper?: string;
}

export const SpeechVariant: React.FC<SpeechVariantProps> = ({
  word,
  test,
  prompt,
  answer,
  helper,
  onComplete
}) => {
  const { attempts, maxAttempts, completed, showContinue, submitAttempt, continueSession, finishedRef } = useTestSession(onComplete);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [statusLine, setStatusLine] = useState('Tap record to start speaking.');
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognitionInstance> | null>(null);
  const [feedback, setFeedback] = useState<SubmissionFeedback | null>(null);

  const normalizedAnswer = useMemo(() => answer.trim().toLowerCase(), [answer]);
  const phaseName = test.phase.replace(/_/g, ' ');

  const handleRecord = () => {
    if (!recognitionSupported) {
      setStatusLine('Speech recognition is unavailable in this browser.');
      return;
    }
    const recognition = createSpeechRecognitionInstance();
    if (!recognition) {
      setStatusLine('Unable to instantiate speech recognition. Please try a different browser.');
      return;
    }
    recognitionRef.current?.abort();
    setTranscript('');
    recognition.lang = 'fr-FR';
    recognition.maxAlternatives = 1;
    recognition.interimResults = false;
    recognition.onstart = () => {
      setIsRecording(true);
      setStatusLine('Listening... speak clearly into the microphone.');
    };
    recognition.onresult = (event: any) => {
      const captured = event.results?.[0]?.[0]?.transcript ?? '';
      setTranscript(captured);
      setStatusLine('Captured transcript, evaluating result...');
      const isCorrect = captured.trim().toLowerCase() === normalizedAnswer;
      setFeedback({
        correct: isCorrect,
        message: isCorrect ? 'Correct! Recording matched the target.' : 'Not quite; give it another try.'
      });
      submitAttempt(isCorrect);
    };
    recognition.onerror = (event: any) => {
      setStatusLine(`Recognition error: ${event.error ?? 'unknown'}.`);
      setIsRecording(false);
    };
    recognition.onend = () => {
      setIsRecording(false);
      if (!finishedRef.current) {
        setStatusLine('Recording ended; retry if the capture was unclear.');
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  useEffect(() => {
    setRecognitionSupported(isSpeechRecognitionSupported());
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    setFeedback(null);
  }, [word.french_word]);

  const handleSubmit = () => {
    if (!transcript) {
      return;
    }
    const isCorrect = transcript.trim().toLowerCase() === normalizedAnswer;
    setFeedback({
      correct: isCorrect,
      message: isCorrect ? 'Correct! Nice job speaking the word.' : 'Not quite; try recording again.'
    });
    submitAttempt(isCorrect);
  };

  const audioInfo = [
    test.requires_audio_output ? 'Audio output required for this variant.' : 'Audio output is optional.',
    test.requires_audio_input ? 'Microphone input is required before submitting a response.' : 'Microphone input is optional for this variant.'
  ];

  return (
    <BaseTestUI
      title={`${phaseName} - Speech response`}
      description={prompt}
      attempts={attempts}
      maxAttempts={maxAttempts}
      statusMessage={helper}
      disabled={completed}
    >
      <div className="speech-variant">
        <button type="button" onClick={handleRecord} disabled={completed || isRecording}>
          {isRecording ? 'Recording...' : 'Start live recording'}
        </button>
        <textarea
          placeholder="Transcript from speech-to-text appears here"
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          disabled={completed}
        />
        <div className="speech-actions">
          <button type="button" onClick={handleSubmit} disabled={completed}>
            Submit spoken answer
          </button>
          <button type="button" onClick={() => speakFrenchWord(word.french_word)}>
            {test.requires_audio_output ? 'Play required prompt' : 'Play prompt'}
          </button>
        </div>
        <div className="audio-info">
          <p className="muted-text">{statusLine}</p>
          {audioInfo.map((line) => (
            <p key={line} className="muted-text">
              {line}
            </p>
          ))}
        </div>
        {feedback && (
          <div className={`submission-feedback submission-feedback--${feedback.correct ? 'correct' : 'incorrect'}`}>
            {feedback.message}
          </div>
        )}
      </div>
    </BaseTestUI>
  );
};
