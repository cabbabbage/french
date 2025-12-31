import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BaseTestUI } from '@ui/components/BaseTestUI';
import { CapabilityPanel } from '@ui/components/CapabilityPanel';
import { CandidatePanel } from '@ui/components/CandidatePanel';
import { HoverableTextDisplay } from '@ui/components/HoverableTextDisplay';
import { POSDetails } from '@ui/components/POSDetails';
import { loadWordEntries } from '@core/dataModel';
import { loadUserCapabilities, persistUserCapabilities } from '@core/capabilities';
import { buildSelectionPool, getTestForWord, selectRandomWord, SelectionPool } from '@core/basicInfo/selector';
import { commitAttemptOutcome, AttemptOutcome, AttemptResult } from '@core/basicInfo/orchestrator';
import type { BasicInfoSelection } from '@core/basicInfo/selector';
import type { WordEntry, UserCapabilities } from '@core/types';

interface TestOrchestratorProps {
  focusMode?: boolean;
}

const MAX_ATTEMPTS = 2;

const describeNoEligibleWords = (pool: SelectionPool, capabilities: UserCapabilities): string => {
  if (pool.remainingWords.length === 0) {
    return 'All words are complete for this session.';
  }
  const needsAudioOutput = pool.blockedByAudio.some((word) => getTestForWord(word).requires_audio_output);
  const needsAudioInput = pool.blockedByAudio.some((word) => getTestForWord(word).requires_audio_input);
  if (needsAudioOutput && !capabilities.has_audio_output) {
    return 'Enable audio output to unlock the remaining listening steps.';
  }
  if (needsAudioInput && !capabilities.has_audio_input) {
    return 'Enable microphone input to unlock the remaining pronunciation exercises.';
  }
  return 'The remaining words are gated by unavailable capabilities.';
};

export const TestOrchestrator: React.FC<TestOrchestratorProps> = ({ focusMode = false }) => {
  const initialWords = useMemo(() => loadWordEntries(), []);
  const [words, setWords] = useState<WordEntry[]>(initialWords);
  const [selection, setSelection] = useState<BasicInfoSelection | null>(null);
  const [attemptIndex, setAttemptIndex] = useState(1);
  const [statusMessage, setStatusMessage] = useState('Preparing the next Basic Info activity.');
  const [attemptFeedback, setAttemptFeedback] = useState<AttemptResult | null>(null);
  const [capabilities, setCapabilities] = useState<UserCapabilities>(() => loadUserCapabilities());
  const lastWordRef = useRef<string | null>(null);
  const startedRef = useRef(false);
  const selectionPool = useMemo(() => buildSelectionPool(words, capabilities), [words, capabilities]);

  const scheduleNextWord = useCallback(() => {
    const pool = buildSelectionPool(words, capabilities);
    if (pool.eligibleWords.length === 0) {
      setSelection(null);
      setAttemptFeedback(null);
      setStatusMessage(describeNoEligibleWords(pool, capabilities));
      return;
    }
    const nextWord = selectRandomWord(pool.eligibleWords, lastWordRef.current);
    if (!nextWord) {
      setSelection(null);
      setAttemptFeedback(null);
      setStatusMessage('Unable to select a new word right now.');
      return;
    }
    setSelection({
      word: nextWord,
      test: getTestForWord(nextWord)
    });
    setAttemptIndex(1);
    setAttemptFeedback(null);
    setStatusMessage('Ready for attempt 1 of 2.');
    lastWordRef.current = nextWord.french_word;
  }, [words, capabilities]);

  useEffect(() => {
    if (!startedRef.current) {
      scheduleNextWord();
      startedRef.current = true;
    }
  }, [scheduleNextWord]);

  useEffect(() => {
    if (!selection && selectionPool.eligibleWords.length > 0) {
      scheduleNextWord();
    }
  }, [selectionPool, selection, scheduleNextWord]);

  const handleCapabilityChange = (next: UserCapabilities) => {
    setCapabilities(next);
    persistUserCapabilities(next);
  };

  const applyAttemptResult = useCallback((result: AttemptResult) => {
    setWords((previous) =>
      previous.map((word) => (word.french_word === result.updatedWord.french_word ? result.updatedWord : word))
    );
    setAttemptFeedback(result);
    setStatusMessage(result.reason);
  }, []);

  const handleAttemptSubmission = useCallback(
    (correct: boolean) => {
      if (!selection || attemptFeedback) {
        return;
      }
      if (attemptIndex === 1) {
        if (correct) {
          applyAttemptResult(commitAttemptOutcome(selection.word, 'correct_first'));
        } else {
          setAttemptIndex(2);
          setStatusMessage('Incorrect on round one. You have one more attempt.');
        }
        return;
      }
      const outcome: AttemptOutcome = correct ? 'correct_second' : 'wrong_second';
      applyAttemptResult(commitAttemptOutcome(selection.word, outcome));
    },
    [selection, attemptIndex, attemptFeedback, applyAttemptResult]
  );

  const handleNextWord = useCallback(() => {
    scheduleNextWord();
  }, [scheduleNextWord]);

  const heroWord = selection?.word.french_word ?? 'Bienvenue';
  const heroEnglish = selection?.word.english_meanings ?? [];
  const heroEnglishText = heroEnglish.filter(Boolean).join(' / ');

  const candidateList = selection
    ? [
        {
          word: selection.word.french_word,
          step: selection.word.basic_info_step,
          testId: selection.test.id
        }
      ]
    : [];

  const renderControls = () => {
    if (!selection) {
      return (
        <div className="test-actions">
          <p className="muted-text">Select a capability combo and re-run the selector to continue.</p>
          <button type="button" onClick={handleNextWord}>
            Re-check words
          </button>
        </div>
      );
    }
    if (attemptFeedback) {
      const badgeClass =
        attemptFeedback.delta > 0
          ? 'score-feedback--positive'
          : attemptFeedback.delta < 0
          ? 'score-feedback--negative'
          : '';
      return (
        <div className="test-actions">
          <p className={`muted-text ${badgeClass}`}>{attemptFeedback.reason}</p>
          <button type="button" onClick={handleNextWord}>
            Next word
          </button>
        </div>
      );
    }
    return (
      <div className="test-actions">
        <button type="button" onClick={() => handleAttemptSubmission(true)}>
          Mark correct
        </button>
        <button type="button" onClick={() => handleAttemptSubmission(false)}>
          Mark incorrect
        </button>
        {attemptIndex > 1 && <p className="muted-text">A second attempt is available.</p>}
      </div>
    );
  };

  const wordInfo = (
    <div className="word-info">
      <div className="word-info__hero hero-word">
        <p className="hero-word__french">{heroWord}</p>
        {heroEnglishText && <p className="hero-word__english">{heroEnglishText}</p>}
      </div>
      <HoverableTextDisplay phrase={heroWord} word={selection?.word} />
      {selection && <POSDetails word={selection.word} />}
    </div>
  );

  const testCard = (
    <BaseTestUI
      label="Basic Info ladder"
      title={selection?.test.title ?? 'Gathering the next word'}
      description={selection?.test.description ?? 'Drawing a word from the Basic Info ladder.'}
      attempts={attemptIndex}
      maxAttempts={MAX_ATTEMPTS}
      statusMessage={statusMessage}
      highlightWord={selection ? { french: selection.word.french_word, english: selection.word.english_meanings } : undefined}
    >
      {renderControls()}
    </BaseTestUI>
  );

  if (focusMode) {
    return (
      <div className="orchestrator-main orchestrator-main--focused">
        {wordInfo}
        {testCard}
      </div>
    );
  }

  return (
    <div className="orchestrator-shell">
      <div className="orchestrator-side">
        <CapabilityPanel capabilities={capabilities} onChange={handleCapabilityChange} />
        <CandidatePanel candidates={candidateList} />
        <div className="selection-summary">
          <p className="muted-text">Remaining words: {selectionPool.remainingWords.length}</p>
          <p className="muted-text">Audio gated: {selectionPool.blockedByAudio.length}</p>
        </div>
      </div>
      <div className="orchestrator-main">
        {wordInfo}
        {testCard}
      </div>
    </div>
  );
};
