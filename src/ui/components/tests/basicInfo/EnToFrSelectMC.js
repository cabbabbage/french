import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { loadWordEntries } from '@core/dataModel';
import { generateFrenchDistractors } from './utils';
export const EnToFrSelectMC = ({ word, test, attemptIndex, onSubmit }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const allWords = useMemo(() => loadWordEntries(), []);
    const englishPrompt = word.english_meanings[0] || 'the word';
    const options = useMemo(() => {
        const distractors = generateFrenchDistractors(word, allWords, 3);
        return [...distractors, word.french_word].sort(() => Math.random() - 0.5);
    }, [word, allWords]);
    const handleSubmit = () => {
        if (!selectedOption)
            return;
        const isCorrect = selectedOption === word.french_word;
        onSubmit(isCorrect);
    };
    return (_jsxs("div", { className: "basic-info-mc", children: [_jsx("div", { className: "mc-prompt", children: _jsx("p", { children: _jsx("strong", { children: englishPrompt }) }) }), _jsx("div", { className: "mc-options", children: options.map((option) => (_jsx("button", { type: "button", className: `mc-option ${selectedOption === option ? 'selected' : ''}`, onClick: () => setSelectedOption(option), children: option }, option))) }), _jsx("div", { className: "mc-actions", children: _jsx("button", { type: "button", onClick: handleSubmit, disabled: !selectedOption, className: "submit-btn", children: "Submit Answer" }) })] }));
};
