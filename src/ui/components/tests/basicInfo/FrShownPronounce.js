import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const FrShownPronounce = ({ word, test, attemptIndex, onSubmit }) => {
    const [recording, setRecording] = useState(false);
    const [recorded, setRecorded] = useState(false);
    const handleStartRecording = () => {
        // TODO: Implement actual speech recording
        console.log(`Starting recording for pronunciation of: ${word?.french_word}`);
        setRecording(true);
    };
    const handleStopRecording = () => {
        // TODO: Implement speech recognition/validation
        console.log(`Stopped recording, validating pronunciation of: ${word?.french_word}`);
        setRecording(false);
        setRecorded(true);
        // For now, randomly determine correctness (stub implementation)
        const isCorrect = Math.random() > 0.5;
        onSubmit(isCorrect);
    };
    if (!word) {
        return (_jsx("div", { className: "basic-info-pronounce", children: _jsx("div", { className: "pronounce-prompt", children: _jsx("p", { children: "Loading..." }) }) }));
    }
    const englishMeanings = word.english_meanings && Array.isArray(word.english_meanings)
        ? word.english_meanings.filter(Boolean).join(' / ')
        : 'Translation not available';
    return (_jsxs("div", { className: "basic-info-pronounce", children: [_jsxs("div", { className: "pronounce-prompt", children: [_jsxs("p", { children: ["Pronounce the French word: ", _jsxs("strong", { children: ["\"", word.french_word || 'Unknown', "\""] })] }), _jsx("p", { children: "Speak clearly into your microphone." })] }), _jsxs("div", { className: "pronounce-display", children: [_jsx("div", { className: "target-word", children: word.french_word || 'Unknown' }), _jsxs("div", { className: "english-meaning", children: ["(", englishMeanings, ")"] })] }), _jsxs("div", { className: "pronounce-controls", children: [!recording && !recorded && (_jsx("button", { type: "button", onClick: handleStartRecording, className: "record-btn", children: "\uD83C\uDFA4 Start Recording" })), recording && (_jsxs("div", { className: "recording-indicator", children: [_jsx("span", { className: "recording-dot", children: "\u25CF" }), _jsx("span", { children: "Recording..." }), _jsx("button", { type: "button", onClick: handleStopRecording, className: "stop-record-btn", children: "\u23F9\uFE0F Stop & Submit" })] })), recorded && (_jsx("div", { className: "recorded-status", children: _jsx("span", { children: "\u2713 Pronunciation submitted for evaluation" }) }))] }), _jsx("div", { className: "pronounce-hint", children: _jsx("p", { children: "Speech recognition is not yet implemented. This is a placeholder that randomly scores your attempt." }) })] }));
};
