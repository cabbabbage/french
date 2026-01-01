import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BaseTestUI } from '@ui/components/BaseTestUI';
import { CapabilityPanel } from '@ui/components/CapabilityPanel';
import { IntroCard } from '@ui/components/tests/basicInfo/IntroCard';
import { loadWordEntries } from '@core/dataModel';
import { loadUserCapabilities, persistUserCapabilities } from '@core/capabilities';
import { buildSelectionPool, getTestForWord, selectRandomWord } from '@core/basicInfo/selector';
import { commitAttemptOutcome } from '@core/basicInfo/orchestrator';
import { COMPLETION_STEP } from '@core/basicInfo/tests';
import { setBasicInfoProgress } from '@core/basicInfoProgress';
import { speakFrenchWord } from '@ui/components/tests/common/audioHelpers';
const MAX_ATTEMPTS = 2;
const describeNoEligibleWords = (pool, capabilities) => {
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
export const TestOrchestrator = ({ focusMode = false }) => {
    console.log('TestOrchestrator component rendered');
    const initialWords = useMemo(() => loadWordEntries(), []);
    const [words, setWords] = useState(initialWords);
    const refreshWords = useCallback(() => {
        console.log('Refreshing words...');
        const newWords = loadWordEntries();
        console.log('Loaded words:', newWords.slice(0, 3).map(w => ({ word: w.french_word, step: w.basic_info_step })));
        setWords(newWords);
    }, []);
    const [selection, setSelection] = useState(null);
    const [attemptIndex, setAttemptIndex] = useState(1);
    const [statusMessage, setStatusMessage] = useState('Welcome to French Learning!');
    const [attemptFeedback, setAttemptFeedback] = useState(null);
    const [capabilities, setCapabilities] = useState(() => loadUserCapabilities());
    const lastWordRef = useRef(null);
    const startedRef = useRef(false);
    const selectionPool = useMemo(() => buildSelectionPool(words, capabilities), [words, capabilities]);
    const scheduleNextWord = useCallback(() => {
        const pool = buildSelectionPool(words, capabilities);
        console.log('Selection pool:', {
            remainingWords: pool.remainingWords.length,
            blockedByAudio: pool.blockedByAudio.length,
            eligibleWords: pool.eligibleWords.length
        });
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
        console.log('Selected word:', {
            word: nextWord.french_word,
            step: nextWord.basic_info_step,
            completed: nextWord.basic_info_completed,
            test: test.id
        });
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
    const handleCapabilityChange = (next) => {
        setCapabilities(next);
        persistUserCapabilities(next);
    };
    const applyAttemptResult = useCallback((result) => {
        setWords((previous) => previous.map((word) => (word.french_word === result.updatedWord.french_word ? result.updatedWord : word)));
        setAttemptFeedback(result);
        setAttemptIndex(1); // Reset attempt index for next test
        setStatusMessage(result.reason);
    }, []);
    const handleAttemptSubmission = useCallback((correct) => {
        if (!selection || attemptFeedback) {
            return;
        }
        if (attemptIndex === 1) {
            if (correct) {
                applyAttemptResult(commitAttemptOutcome(selection.word, 'correct_first'));
            }
            else {
                setAttemptIndex(2);
                setStatusMessage('Incorrect. You have one more attempt.');
            }
            return;
        }
        const outcome = correct ? 'correct_second' : 'wrong_second';
        applyAttemptResult(commitAttemptOutcome(selection.word, outcome));
    }, [selection, attemptIndex, attemptFeedback, applyAttemptResult]);
    const handleNextWord = useCallback(() => {
        scheduleNextWord();
    }, [scheduleNextWord]);
    const handleIntroComplete = useCallback(() => {
        if (!selection)
            return;
        // Mark the word as completed and select a new word
        const persisted = setBasicInfoProgress(selection.word.french_word, { basic_info_step: COMPLETION_STEP });
        setWords((previous) => previous.map((word) => (word.french_word === selection.word.french_word ? { ...word, basic_info_step: persisted.basic_info_step, basic_info_completed: persisted.basic_info_completed } : word)));
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
        console.log('Rendering test content, selection:', selection ? {
            word: selection.word.french_word,
            step: selection.word.basic_info_step,
            test: selection.test.id
        } : null);
        if (!selection) {
            console.log('No selection - showing re-check button');
            return (_jsxs("div", { className: "test-actions", children: [_jsx("p", { className: "muted-text", children: "Select a capability combo and re-run the selector to continue." }), _jsx("button", { type: "button", onClick: handleNextWord, children: "Re-check words" })] }));
        }
        if (attemptFeedback) {
            const badgeClass = attemptFeedback.outcome === 'wrong_second' ? 'score-feedback--negative' : 'score-feedback--positive';
            const word = attemptFeedback.updatedWord;
            return (_jsxs("div", { className: "test-actions", children: [_jsxs("div", { className: "word-info", children: [_jsxs("p", { children: [_jsx("strong", { children: "French:" }), " ", _jsx("span", { onClick: () => speakFrenchWord(word.french_word), style: { cursor: 'pointer', textDecoration: 'underline' }, children: word.french_word })] }), _jsxs("p", { children: [_jsx("strong", { children: "English:" }), " ", word.english_meanings.filter(Boolean).join(', ')] }), _jsxs("p", { children: [_jsx("strong", { children: "Part of Speech:" }), " ", word.part_of_speech] })] }), _jsx("p", { className: `muted-text ${badgeClass}`, children: attemptFeedback.reason }), _jsx("button", { type: "button", onClick: handleNextWord, children: "Next word" })] }));
        }
        // Special case: if word is at step 0, show the intro card
        if (selection.word.basic_info_step === 0) {
            console.log('Word at step 0 - showing IntroCard');
            return _jsx(IntroCard, { word: selection.word, onNext: handleIntroComplete });
        }
        // TEMPORARY: Force show IntroCard for first test to check if component works
        console.log('TEMPORARY: Forcing IntroCard display to test component');
        return _jsx(IntroCard, { word: selection.word, onNext: handleIntroComplete });
    };
    const isFrenchAnswer = selection && selection.word.basic_info_step > 0 && (selection.test.id.includes('to_fr') || selection.test.id.includes('pronounce_fr'));
    const wordInfo = null;
    // Create selective highlightWord based on test type
    const getHighlightWord = () => {
        if (!selection || selection.word.basic_info_step === 0)
            return undefined;
        return {
            french: heroWord,
            english: heroEnglish
        };
    };
    const testCard = (_jsx(BaseTestUI, { label: "Basic Info ladder", title: selection?.test.title ?? 'Gathering the next word', description: selection?.test.description ?? 'Drawing a word from the Basic Info ladder.', attempts: attemptIndex, maxAttempts: MAX_ATTEMPTS, statusMessage: statusMessage, highlightWord: getHighlightWord(), answerLanguage: isFrenchAnswer ? 'french' : 'english', submissionResult: attemptFeedback, children: renderTestContent() }));
    if (focusMode) {
        return (_jsx("div", { className: "orchestrator-main orchestrator-main--focused", children: testCard }));
    }
    return (_jsxs("div", { className: "orchestrator-shell", children: [_jsxs("div", { className: "orchestrator-side", children: [_jsx(CapabilityPanel, { capabilities: capabilities, onChange: handleCapabilityChange }), _jsxs("div", { className: "selection-summary", children: [_jsxs("p", { className: "muted-text", children: ["Remaining words: ", selectionPool.remainingWords.length] }), _jsxs("p", { className: "muted-text", children: ["Audio gated: ", selectionPool.blockedByAudio.length] })] })] }), _jsx("div", { className: "orchestrator-main", children: testCard })] }));
};
