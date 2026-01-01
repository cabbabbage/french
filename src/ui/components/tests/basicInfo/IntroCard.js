import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { POSDetails } from '@ui/components/POSDetails';
export const IntroCard = ({ word, onNext }) => {
    if (!word) {
        return (_jsxs("div", { className: "basic-info-intro", children: [_jsxs("div", { className: "intro-content", children: [_jsx("h3", { children: "Loading..." }), _jsx("p", { className: "intro-description", children: "Preparing your learning session." })] }), _jsx("div", { className: "intro-actions", children: _jsx("button", { type: "button", onClick: onNext, className: "continue-btn", children: "Next" }) })] }));
    }
    const englishMeanings = word.english_meanings && Array.isArray(word.english_meanings)
        ? word.english_meanings.filter(Boolean).join(' / ')
        : 'Translation not available';
    return (_jsxs("div", { className: "basic-info-intro", children: [_jsxs("div", { className: "intro-content", children: [_jsx("h3", { children: "Welcome to French Learning!" }), _jsxs("div", { className: "word-display", children: [_jsx("p", { className: "french-word", children: word.french_word || 'Unknown word' }), _jsx("p", { className: "english-meanings", children: englishMeanings })] }), word && _jsx(POSDetails, { word: word }), _jsx("p", { className: "intro-description", children: "Get ready to practice this word through various exercises. You'll work on recognition, spelling, listening, and speaking skills to master it." })] }), _jsx("div", { className: "intro-actions", children: _jsx("button", { type: "button", onClick: onNext, className: "continue-btn", children: "Next" }) })] }));
};
