import { useCallback, useRef, useState } from 'react';
const MAX_ATTEMPTS = 2;
export function useTestSession(onComplete) {
    const [attempts, setAttempts] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [showContinue, setShowContinue] = useState(false);
    const finishedRef = useRef(false);
    const finish = useCallback((code) => {
        if (finishedRef.current) {
            return;
        }
        finishedRef.current = true;
        setCompleted(true);
        setShowContinue(false);
        onComplete(code);
    }, [onComplete]);
    const submitAttempt = useCallback((correct) => {
        if (finishedRef.current) {
            return;
        }
        setAttempts((prev) => {
            const next = prev + 1;
            if (correct) {
                finish(prev === 0 ? 2 : 1);
            }
            else if (next >= MAX_ATTEMPTS) {
                setShowContinue(true);
            }
            return next;
        });
    }, [finish]);
    const continueSession = useCallback(() => {
        finish(0);
    }, [finish]);
    return {
        attempts,
        maxAttempts: MAX_ATTEMPTS,
        completed,
        showContinue,
        submitAttempt,
        continueSession,
        finishedRef
    };
}
