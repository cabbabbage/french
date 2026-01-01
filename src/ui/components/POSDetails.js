import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
const formatValue = (value) => {
    if (value == null) {
        return '—';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map((item) => String(item)).join(', ');
    }
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        }
        catch {
            return String(value);
        }
    }
    return String(value);
};
const renderDataRows = (data) => {
    if (!data) {
        return null;
    }
    return (_jsx("div", { className: "pos-block", children: Object.entries(data)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => (_jsxs("p", { className: "muted-text", children: [_jsxs("strong", { children: [key.replace(/_/g, ' '), ":"] }), " ", formatValue(value)] }, key))) }));
};
export const POSDetails = ({ word }) => {
    if (!word) {
        return null;
    }
    const englishMeanings = word.english_meanings && Array.isArray(word.english_meanings)
        ? word.english_meanings.filter(Boolean).join(', ')
        : 'Not available';
    return (_jsxs("aside", { className: "pos-details", children: [_jsx("h3", { children: "Grammar spotlight" }), _jsxs("p", { className: "muted-text", children: ["Part of speech: ", _jsx("strong", { children: word.part_of_speech || 'Unknown' })] }), _jsxs("p", { className: "muted-text", children: ["Meanings: ", _jsx("strong", { children: englishMeanings })] }), word.pronunciation_guide && (_jsxs("p", { className: "muted-text", children: ["Pronunciation guide: ", _jsx("strong", { children: word.pronunciation_guide })] })), word.noun_data && renderDataRows(word.noun_data), word.verb_data && renderDataRows(word.verb_data), word.adjective_data && renderDataRows(word.adjective_data), word.adverb_data && renderDataRows(word.adverb_data)] }));
};
