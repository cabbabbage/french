import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { BaseTestUI } from '@ui/components/BaseTestUI';
import { useTestSession } from '../session';
function shuffleArray(items) {
    const shuffled = items.slice();
    for (let i = shuffled.length - 1; i > 0; --i) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
export const MCVariant = ({ word, test, prompt, options, answer, helper, onComplete }) => {
    const { attempts, maxAttempts, completed, showContinue, submitAttempt, continueSession } = useTestSession(onComplete);
    const [selection, setSelection] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const normalizedAnswer = useMemo(() => answer.trim().toLowerCase(), [answer]);
    const sanitizedOptions = useMemo(() => Array.from(new Set([answer, ...options])).map((option) => option.trim()), [answer, options]);
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
    return (_jsxs(BaseTestUI, { title: `${phaseName} - Multiple choice`, description: prompt, attempts: attempts, maxAttempts: maxAttempts, statusMessage: helper, disabled: completed, children: [_jsx("div", { className: "mc-options", children: shuffledOptions.map((option) => (_jsx("button", { type: "button", className: `mc-option ${selection === option ? 'mc-option--active' : ''}`, onClick: () => setSelection(option), disabled: completed || showContinue, children: option }, option))) }), _jsxs("div", { className: "mc-actions", children: [showContinue ? (_jsx("button", { type: "button", onClick: handleContinue, children: "Continue" })) : (_jsx("button", { type: "button", onClick: handleSubmit, disabled: completed || !selection, children: "Submit answer" })), _jsx("button", { type: "button", onClick: () => console.info('Play audio stub'), disabled: completed && !test.requires_audio_output, children: playLabel })] }), feedback && (_jsx("div", { className: `submission-feedback submission-feedback--${feedback.correct ? 'correct' : 'incorrect'}`, children: feedback.message })), _jsx("p", { className: "muted-text", children: test.requires_audio_output ? 'Audio playback is required for this variant.' : 'Audio is optional for reinforcement.' })] }));
};
