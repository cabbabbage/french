import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { loadWordEntries } from '@core/dataModel';
import { generateEnglishDistractors } from './utils';
export const FrAudioToEnMC = ({ word, test, attemptIndex, onSubmit }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [audioPlayed, setAudioPlayed] = useState(false);
    const allWords = useMemo(() => loadWordEntries(), []);
    const correctAnswer = word.english_meanings[0] || '';
    const options = useMemo(() => {
        const distractors = generateEnglishDistractors(word, allWords, 3);
        return [...distractors, correctAnswer].sort(() => Math.random() - 0.5);
    }, [word, allWords, correctAnswer]);
    const handlePlayAudio = () => {
        // TODO: Implement actual audio playback using TTS or recorded audio
        console.log(`Playing audio for: ${word.french_word}`);
        setAudioPlayed(true);
    };
    const handleSubmit = () => {
        if (!selectedOption)
            return;
        const isCorrect = selectedOption === correctAnswer;
        onSubmit(isCorrect);
    };
    return (_jsxs("div", { className: "basic-info-audio-mc", children: [_jsxs("div", { className: "audio-prompt", children: [_jsx("p", { children: "Listen to the French word and select its meaning:" }), _jsx("button", { type: "button", onClick: handlePlayAudio, className: "play-audio-btn", children: "\uD83D\uDD0A Play Audio" }), audioPlayed && _jsx("span", { className: "audio-played", children: "Audio played" })] }), _jsx("div", { className: "mc-options", children: options.map((option) => (_jsx("button", { type: "button", className: `mc-option ${selectedOption === option ? 'selected' : ''}`, onClick: () => setSelectedOption(option), disabled: !audioPlayed, children: option }, option))) }), _jsx("div", { className: "mc-actions", children: _jsx("button", { type: "button", onClick: handleSubmit, disabled: !selectedOption || !audioPlayed, className: "submit-btn", children: "Submit Answer" }) }), !audioPlayed && (_jsx("div", { className: "audio-hint", children: _jsx("p", { children: "Please play the audio first before selecting an answer." }) }))] }));
};
