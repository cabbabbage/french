import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { normalizeText } from './utils';
export const FrAudioToFrType = ({ word, test, attemptIndex, onSubmit }) => {
    const [input, setInput] = useState('');
    const [audioPlayed, setAudioPlayed] = useState(false);
    const correctAnswer = word.french_word;
    const handlePlayAudio = () => {
        // TODO: Implement actual audio playback using TTS or recorded audio
        console.log(`Playing audio for: ${word.french_word}`);
        setAudioPlayed(true);
    };
    const handleSubmit = () => {
        const normalizedInput = normalizeText(input);
        const normalizedAnswer = normalizeText(correctAnswer);
        const isCorrect = normalizedInput === normalizedAnswer;
        onSubmit(isCorrect);
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && audioPlayed) {
            handleSubmit();
        }
    };
    return (_jsxs("div", { className: "basic-info-audio-type", children: [_jsxs("div", { className: "audio-prompt", children: [_jsx("p", { children: "Listen to the French word and type what you heard:" }), _jsx("button", { type: "button", onClick: handlePlayAudio, className: "play-audio-btn", children: "\uD83D\uDD0A Play Audio" }), audioPlayed && _jsx("span", { className: "audio-played", children: "Audio played" })] }), _jsx("div", { className: "type-input", children: _jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), onKeyPress: handleKeyPress, placeholder: "Type the French word you heard...", disabled: !audioPlayed, autoFocus: audioPlayed }) }), _jsx("div", { className: "type-actions", children: _jsx("button", { type: "button", onClick: handleSubmit, disabled: !input.trim() || !audioPlayed, className: "submit-btn", children: "Submit Answer" }) }), !audioPlayed && (_jsx("div", { className: "audio-hint", children: _jsx("p", { children: "Please play the audio first before typing your answer." }) })), audioPlayed && (_jsx("div", { className: "type-hint", children: _jsx("p", { children: "Tip: Pay attention to accents and spelling." }) }))] }));
};
