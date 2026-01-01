import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
export const EnShownPronounce = ({ word, test, attemptIndex, onSubmit }) => {
    const [recording, setRecording] = useState(false);
    const [recorded, setRecorded] = useState(false);
    const englishPrompt = word.english_meanings[0] || 'the word';
    const handleStartRecording = () => {
        // TODO: Implement actual speech recording
        console.log(`Starting recording for pronunciation of French word corresponding to: ${englishPrompt}`);
        setRecording(true);
    };
    const handleStopRecording = () => {
        // TODO: Implement speech recognition/validation
        console.log(`Stopped recording, validating pronunciation of: ${word.french_word}`);
        setRecording(false);
        setRecorded(true);
        // For now, randomly determine correctness (stub implementation)
        const isCorrect = Math.random() > 0.5;
        onSubmit(isCorrect);
    };
    return (_jsxs("div", { className: "basic-info-pronounce", children: [_jsxs("div", { className: "pronounce-prompt", children: [_jsxs("p", { children: ["Say the French word for: ", _jsxs("strong", { children: ["\"", englishPrompt, "\""] })] }), _jsx("p", { children: "Pronounce the French word clearly into your microphone." })] }), _jsxs("div", { className: "pronounce-display", children: [_jsx("div", { className: "english-prompt", children: englishPrompt }), _jsxs("div", { className: "french-target", children: ["(French: ", word.french_word, ")"] })] }), _jsxs("div", { className: "pronounce-controls", children: [!recording && !recorded && (_jsx("button", { type: "button", onClick: handleStartRecording, className: "record-btn", children: "\uD83C\uDFA4 Start Recording" })), recording && (_jsxs("div", { className: "recording-indicator", children: [_jsx("span", { className: "recording-dot", children: "\u25CF" }), _jsx("span", { children: "Recording..." }), _jsx("button", { type: "button", onClick: handleStopRecording, className: "stop-record-btn", children: "\u23F9\uFE0F Stop & Submit" })] })), recorded && (_jsx("div", { className: "recorded-status", children: _jsx("span", { children: "\u2713 Pronunciation submitted for evaluation" }) }))] }), _jsx("div", { className: "pronounce-hint", children: _jsx("p", { children: "Speech recognition is not yet implemented. This is a placeholder that randomly scores your attempt." }) })] }));
};
