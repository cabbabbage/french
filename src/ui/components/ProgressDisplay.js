import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { loadWordEntries } from '@core/dataModel';
import { getBasicInfoProgress, setBasicInfoProgress } from '@core/basicInfoProgress';
import { COMPLETION_STEP } from '@core/basicInfo/tests';
const WordProgressItem = ({ word, onReset }) => {
    const progress = getBasicInfoProgress(word.french_word);
    const progressPercent = (progress.basic_info_step / COMPLETION_STEP) * 100;
    const isCompleted = progress.basic_info_completed;
    const englishMeanings = word.english_meanings?.filter(Boolean).join(' / ') || 'No translation';
    const handleReset = () => {
        onReset(word.french_word);
    };
    return (_jsxs("div", { className: "word-progress-item", children: [_jsxs("div", { className: "word-info", children: [_jsxs("div", { className: "word-text", children: [_jsx("span", { className: "french-word", children: word.french_word }), _jsx("span", { className: "english-meanings", children: englishMeanings })] }), _jsx("button", { type: "button", onClick: handleReset, className: "reset-word-btn", title: "Reset this word's progress", children: "\u21BB" })] }), _jsxs("div", { className: "progress-container", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: `progress-fill ${isCompleted ? 'completed' : ''}`, style: { width: `${progressPercent}%` } }) }), _jsxs("span", { className: "progress-text", children: [progress.basic_info_step, "/", COMPLETION_STEP, isCompleted && ' ✓'] })] })] }));
};
export const ProgressDisplay = () => {
    const words = loadWordEntries();
    // Sort: completed words first, then by progress descending
    const sortedWords = [...words].sort((a, b) => {
        const aProgress = getBasicInfoProgress(a.french_word);
        const bProgress = getBasicInfoProgress(b.french_word);
        // Completed words first
        if (aProgress.basic_info_completed && !bProgress.basic_info_completed)
            return -1;
        if (!aProgress.basic_info_completed && bProgress.basic_info_completed)
            return 1;
        // Then by progress percentage descending
        const aPercent = (aProgress.basic_info_step / COMPLETION_STEP) * 100;
        const bPercent = (bProgress.basic_info_step / COMPLETION_STEP) * 100;
        return bPercent - aPercent;
    });
    const handleResetWord = (wordKey) => {
        setBasicInfoProgress(wordKey, {
            basic_info_step: 0,
            basic_info_completed: false
        });
        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent('progressReset'));
    };
    const handleResetAll = () => {
        if (window.confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) {
            words.forEach(word => {
                setBasicInfoProgress(word.french_word, {
                    basic_info_step: 0,
                    basic_info_completed: false
                });
            });
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('progressReset'));
        }
    };
    const completedCount = words.filter(word => getBasicInfoProgress(word.french_word).basic_info_completed).length;
    return (_jsxs("div", { className: "progress-display", children: [_jsxs("div", { className: "progress-header", children: [_jsx("h3", { children: "Word Progress" }), _jsxs("p", { className: "progress-summary", children: [completedCount, " of ", words.length, " words completed"] })] }), _jsx("div", { className: "word-progress-list", children: sortedWords.map(word => (_jsx(WordProgressItem, { word: word, onReset: handleResetWord }, word.french_word))) }), _jsx("div", { className: "progress-actions", children: _jsx("button", { type: "button", onClick: handleResetAll, className: "reset-all-btn", children: "Reset All Progress" }) })] }));
};
