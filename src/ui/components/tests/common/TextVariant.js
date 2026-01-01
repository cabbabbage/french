import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { BaseTestUI } from '@ui/components/BaseTestUI';
import { useTestSession } from '../session';
export const TextVariant = ({ word, test, prompt, answer, placeholder = 'Type your response here', onComplete }) => {
    const { attempts, maxAttempts, completed, showContinue, submitAttempt, continueSession } = useTestSession(onComplete);
    const [value, setValue] = useState('');
    const [feedback, setFeedback] = useState(null);
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
    return (_jsxs(BaseTestUI, { title: `${phaseName} - Text entry`, description: prompt, attempts: attempts, maxAttempts: maxAttempts, statusMessage: "Type the word that matches the prompt.", disabled: completed, children: [_jsxs("div", { className: "text-variant", children: [_jsx("input", { type: "text", placeholder: placeholder, value: value, onChange: (event) => setValue(event.target.value), disabled: completed || showContinue }), _jsxs("div", { className: "text-actions", children: [showContinue ? (_jsx("button", { type: "button", onClick: handleContinue, children: "Continue" })) : (_jsx("button", { type: "button", onClick: handleSubmit, disabled: completed, children: "Submit text answer" })), _jsx("button", { type: "button", onClick: () => console.info('Play audio stub'), disabled: !test.requires_audio_output, children: test.requires_audio_output ? 'Play required dictation' : 'Play optional pronunciation' })] })] }), feedback && (_jsx("div", { className: `submission-feedback submission-feedback--${feedback.correct ? 'correct' : 'incorrect'}`, children: feedback.message })), _jsx("p", { className: "muted-text", children: test.requires_audio_output
                    ? 'This variant requires listening to audio before typing.'
                    : 'You can type the answer without audio playback.' })] }));
};
