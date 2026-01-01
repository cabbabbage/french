import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { speakFrenchWord } from '@ui/components/tests/common/audioHelpers';
const formatMeaningTooltip = (meanings) => {
    if (meanings.length === 0) {
        return 'Tap to play audio';
    }
    return `Meanings: ${meanings.join(', ')}`;
};
export const HoverableTextDisplay = ({ phrase, word }) => {
    const tokens = phrase.split(' ');
    const targetWord = word?.french_word?.toLowerCase() ?? '';
    const englishMeanings = word?.english_meanings ?? [];
    const tooltip = formatMeaningTooltip(englishMeanings);
    const pronunciation = word?.pronunciation_guide;
    const handleTokenClick = (token) => {
        if (!word) {
            speakFrenchWord(token);
            return;
        }
        const candidate = token.toLowerCase();
        if (candidate.includes(targetWord)) {
            speakFrenchWord(word.french_word);
        }
        else {
            speakFrenchWord(token);
        }
    };
    const meaningLabel = englishMeanings.join(' / ');
    return (_jsxs("div", { className: "hoverable-text", children: [tokens.map((token, index) => (_jsx("button", { className: "hoverable-token", type: "button", title: tooltip, onClick: () => handleTokenClick(token), children: token }, `${token}-${index}`))), word && (_jsxs("div", { className: "hoverable-note", children: [_jsxs("p", { className: "muted-text", children: [_jsx("strong", { children: "Meanings:" }), " ", meaningLabel || '—'] }), pronunciation && (_jsxs("p", { className: "muted-text", children: [_jsx("strong", { children: "Pronunciation guide:" }), " ", pronunciation] })), _jsxs("button", { type: "button", onClick: () => speakFrenchWord(word.french_word), children: ["Play ", word.french_word] })] }))] }));
};
