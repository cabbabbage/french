import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { BaseTestUI } from '@ui/components/BaseTestUI';
import { useTestSession } from '../session';
import { createSpeechRecognitionInstance, isSpeechRecognitionSupported, speakFrenchWord } from './audioHelpers';
export const SpeechVariant = ({ word, test, prompt, answer, helper, onComplete }) => {
    const { attempts, maxAttempts, completed, showContinue, submitAttempt, continueSession, finishedRef } = useTestSession(onComplete);
    const [transcript, setTranscript] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [statusLine, setStatusLine] = useState('Tap record to start speaking.');
    const [recognitionSupported, setRecognitionSupported] = useState(false);
    const recognitionRef = useRef(null);
    const [feedback, setFeedback] = useState(null);
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
        recognition.onresult = (event) => {
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
        recognition.onerror = (event) => {
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
    return (_jsx(BaseTestUI, { title: `${phaseName} - Speech response`, description: prompt, attempts: attempts, maxAttempts: maxAttempts, statusMessage: helper, disabled: completed, children: _jsxs("div", { className: "speech-variant", children: [_jsx("button", { type: "button", onClick: handleRecord, disabled: completed || isRecording, children: isRecording ? 'Recording...' : 'Start live recording' }), _jsx("textarea", { placeholder: "Transcript from speech-to-text appears here", value: transcript, onChange: (event) => setTranscript(event.target.value), disabled: completed }), _jsxs("div", { className: "speech-actions", children: [_jsx("button", { type: "button", onClick: handleSubmit, disabled: completed, children: "Submit spoken answer" }), _jsx("button", { type: "button", onClick: () => speakFrenchWord(word.french_word), children: test.requires_audio_output ? 'Play required prompt' : 'Play prompt' })] }), _jsxs("div", { className: "audio-info", children: [_jsx("p", { className: "muted-text", children: statusLine }), audioInfo.map((line) => (_jsx("p", { className: "muted-text", children: line }, line)))] }), feedback && (_jsx("div", { className: `submission-feedback submission-feedback--${feedback.correct ? 'correct' : 'incorrect'}`, children: feedback.message }))] }) }));
};
