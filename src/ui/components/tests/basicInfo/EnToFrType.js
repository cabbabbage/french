import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { normalizeText } from './utils';
export const EnToFrType = ({ word, test, attemptIndex, onSubmit }) => {
    const [input, setInput] = useState('');
    const englishPrompt = word.english_meanings[0] || 'the word';
    const correctAnswer = word.french_word;
    const handleSubmit = () => {
        const normalizedInput = normalizeText(input);
        const normalizedAnswer = normalizeText(correctAnswer);
        const isCorrect = normalizedInput === normalizedAnswer;
        onSubmit(isCorrect);
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };
    return (_jsxs("div", { className: "basic-info-type", children: [_jsx("div", { className: "type-prompt", children: _jsxs("p", { children: ["Type the French word for: ", _jsxs("strong", { children: ["\"", englishPrompt, "\""] })] }) }), _jsx("div", { className: "type-input", children: _jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), onKeyPress: handleKeyPress, placeholder: "Type your answer...", autoFocus: true }) }), _jsx("div", { className: "type-actions", children: _jsx("button", { type: "button", onClick: handleSubmit, disabled: !input.trim(), className: "submit-btn", children: "Submit Answer" }) }), _jsx("div", { className: "type-hint", children: _jsx("p", { children: "Tip: Pay attention to accents and spelling." }) })] }));
};
