import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const BaseTestUI = ({ title, description, attempts, maxAttempts, statusMessage, disabled, label = 'Test', highlightWord, answerLanguage, submissionResult, children }) => {
    const englishText = highlightWord?.english.filter(Boolean).join(' / ');
    // Determine outline class based on submission result
    const getOutlineClass = () => {
        if (submissionResult) {
            // Test completed with result
            if (submissionResult.outcome === 'correct_first' || submissionResult.outcome === 'correct_second') {
                return 'test-ui--correct';
            }
            else if (submissionResult.outcome === 'wrong_second') {
                return 'test-ui--wrong-both';
            }
        }
        else if (attempts > 1) {
            // Show orange border during second attempt (after first wrong)
            return 'test-ui--first-wrong';
        }
        return '';
    };
    const outlineClass = getOutlineClass();
    return (_jsxs("section", { className: `test-ui${disabled ? ' test-ui--disabled' : ''}${outlineClass ? ` ${outlineClass}` : ''}`, children: [_jsxs("header", { children: [label && _jsx("p", { className: "eyebrow", children: label }), _jsx("h2", { children: title })] }), _jsx("div", { className: "test-body", children: children })] }));
};
