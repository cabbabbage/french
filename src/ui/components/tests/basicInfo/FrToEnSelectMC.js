import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { loadWordEntries } from '@core/dataModel';
import { generateEnglishDistractors } from './utils';
export const FrToEnSelectMC = ({ word, test, attemptIndex, onSubmit }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const allWords = useMemo(() => loadWordEntries(), []);
    const correctAnswer = word.english_meanings[0] || '';
    const options = useMemo(() => {
        const distractors = generateEnglishDistractors(word, allWords, 3);
        return [...distractors, correctAnswer].sort(() => Math.random() - 0.5);
    }, [word, allWords, correctAnswer]);
    const handleSubmit = () => {
        if (!selectedOption)
            return;
        const isCorrect = selectedOption === correctAnswer;
        onSubmit(isCorrect);
    };
    return (_jsxs("div", { className: "basic-info-mc", children: [_jsx("div", { className: "mc-prompt", children: _jsxs("p", { children: ["What does ", _jsxs("strong", { children: ["\"", word.french_word, "\""] }), " mean?"] }) }), _jsx("div", { className: "mc-options", children: options.map((option) => (_jsx("button", { type: "button", className: `mc-option ${selectedOption === option ? 'selected' : ''}`, onClick: () => setSelectedOption(option), children: option }, option))) }), _jsx("div", { className: "mc-actions", children: _jsx("button", { type: "button", onClick: handleSubmit, disabled: !selectedOption, className: "submit-btn", children: "Submit Answer" }) })] }));
};
