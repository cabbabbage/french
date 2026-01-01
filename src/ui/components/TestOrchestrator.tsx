import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BaseTestUI } from '@ui/components/BaseTestUI';
import { CapabilityPanel } from '@ui/components/CapabilityPanel';
import { CandidatePanel } from '@ui/components/CandidatePanel';
import { POSDetails } from '@ui/components/POSDetails';
import { IntroCard } from '@ui/components/tests/basicInfo/IntroCard';
import { loadWordEntries } from '@core/dataModel';
import { loadUserCapabilities, persistUserCapabilities } from '@core/capabilities';
import { buildSelectionPool, getTestForWord, selectRandomWord, SelectionPool } from '@core/basicInfo/selector';
import { commitAttemptOutcome, AttemptOutcome, AttemptResult } from '@core/basicInfo/orchestrator';
import { basicInfoTestRegistry } from '@ui/components/tests';
import { COMPLETION_STEP } from '@core/basicInfo/tests';
import { setBasicInfoProgress } from '@core/basicInfoProgress';
import { speakFrenchWord } from '@ui/components/tests/common/audioHelpers';
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

  const refreshWords = useCallback(() => {
    const newWords = loadWordEntries();
    setWords(newWords);
  }, []);
  const [selection, setSelection] = useState<BasicInfoSelection | null>(null);
  const [attemptIndex, setAttemptIndex] = useState(1);
  const [statusMessage, setStatusMessage] = useState('Welcome to French Learning!');
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

    const test = getTestForWord(nextWord);

    setSelection({
      word: nextWord,
      test: test
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

  // Listen for progress reset events (when progress is reset from ProgressDisplay)
  useEffect(() => {
    const handleProgressReset = () => {
      refreshWords();
      // Reset selection to trigger re-selection with updated word data
      setSelection(null);
      setAttemptFeedback(null);
    };

    window.addEventListener('progressReset', handleProgressReset);
    return () => window.removeEventListener('progressReset', handleProgressReset);
  }, [refreshWords]);

  useEffect(() => {
    if (startedRef.current && !selection) {
      scheduleNextWord();
    }
  }, [selection, scheduleNextWord]);

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
    setAttemptIndex(1); // Reset attempt index for next test
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
          setStatusMessage('Incorrect. You have one more attempt.');
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

  const handleIntroComplete = useCallback(() => {
    if (!selection) return;
    // Treat intro completion as a successful first attempt
    const result = commitAttemptOutcome(selection.word, 'correct_first');
    setWords((previous) =>
      previous.map((word) => (word.french_word === result.updatedWord.french_word ? result.updatedWord : word))
    );
    // Reset lastWordRef to allow selecting the progressed word immediately
    lastWordRef.current = null;
    scheduleNextWord();
  }, [selection, scheduleNextWord]);

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

  const renderTestContent = () => {
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
      const badgeClass = attemptFeedback.outcome === 'wrong_second' ? 'score-feedback--negative' : 'score-feedback--positive';
      const word = attemptFeedback.updatedWord;
      return (
        <div className="test-actions">
          <div className="word-info">
            <p><strong>French:</strong> <span
              onClick={() => speakFrenchWord(word.french_word)}
              style={{ cursor: 'pointer', textDecoration: 'underline' }}
            >
              {word.french_word}
            </span></p>
            <p><strong>English:</strong> {word.english_meanings.filter(Boolean).join(', ')}</p>
            <p><strong>Part of Speech:</strong> {word.part_of_speech}</p>
          </div>
          <p className={`muted-text ${badgeClass}`}>{attemptFeedback.reason}</p>
          <button type="button" onClick={handleNextWord}>
            Next word
          </button>
        </div>
      );
    }

    // Special case: if word is at step 0, show the intro card
    if (selection.word.basic_info_step === 0) {
      return <IntroCard word={selection.word} onNext={handleIntroComplete} />;
    }

    // Render the appropriate test component for the current step
    const TestComponent = basicInfoTestRegistry[selection.test.id as keyof typeof basicInfoTestRegistry];
    if (TestComponent) {
      return (
        <TestComponent
          word={selection.word}
          test={selection.test}
          attemptIndex={attemptIndex}
          onSubmit={handleAttemptSubmission}
        />
      );
    }

    // Fallback if test component not found
    return (
      <div className="test-error">
        <p>Error: Test component not found for {selection.test.id}</p>
      </div>
    );
  };

  const isFrenchAnswer = selection && selection.word.basic_info_step > 0 && (selection.test.id.includes('to_fr') || selection.test.id.includes('pronounce_fr'));

  const wordInfo = null;

  // Create selective highlightWord based on test type
  const getHighlightWord = () => {
    if (!selection || selection.word.basic_info_step === 0) return undefined;

    return {
      french: heroWord,
      english: heroEnglish
    };
  };

  const testCard = (
    <BaseTestUI
      label="Basic Info ladder"
      title={selection?.test.title ?? 'Gathering the next word'}
      description={selection?.test.description ?? 'Drawing a word from the Basic Info ladder.'}
      attempts={attemptIndex}
      maxAttempts={MAX_ATTEMPTS}
      statusMessage={statusMessage}
      highlightWord={getHighlightWord()}
      answerLanguage={isFrenchAnswer ? 'french' : 'english'}
      submissionResult={attemptFeedback}
    >
      {renderTestContent()}
    </BaseTestUI>
  );

  if (focusMode) {
    return (
      <div className="orchestrator-main orchestrator-main--focused">
        {testCard}
      </div>
    );
  }

  return (
    <div className="orchestrator-shell">
      <div className="orchestrator-side">
        <CapabilityPanel capabilities={capabilities} onChange={handleCapabilityChange} />
        <div className="selection-summary">
          <p className="muted-text">Remaining words: {selectionPool.remainingWords.length}</p>
          <p className="muted-text">Audio gated: {selectionPool.blockedByAudio.length}</p>
        </div>
      </div>
      <div className="orchestrator-main">
        {testCard}
      </div>
    </div>
  );
};
