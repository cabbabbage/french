import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { CapabilityPanel } from '@ui/components/CapabilityPanel';
import { TestOrchestrator } from '@ui/components/TestOrchestrator';
import { loadUserCapabilities, persistUserCapabilities } from '@core/capabilities';
import { loadWordEntries } from '@core/dataModel';
const instructions = [
    'Run the Basic Info ladder exclusively: words drive the test selection, not learning phases.',
    'Track only `basic_info_step` and `basic_info_completed` per word and clamp the ladder bounds.',
    'Gate listening and speaking steps by the capabilities the user enables before the session.',
    'Show each step as an explicit attempt (2 tries per word) and progress accordingly.'
];
const App = () => (_jsx(AppContent, {}));
const AppContent = () => {
    const [sessionStarted, setSessionStarted] = useState(false);
    const [capabilities, setCapabilities] = useState(() => loadUserCapabilities());
    const handleCapabilityChange = (next) => {
        setCapabilities(next);
        persistUserCapabilities(next);
    };
    const words = loadWordEntries();
    const getCompletedTests = (word) => {
        return Object.values(word.learning_phases).filter((phase) => phase.user_progress >= phase.target_progress).length;
    };
    const VocabList = () => (_jsxs("div", { className: "vocab-list", children: [_jsx("h2", { children: "Vocabulary Progress" }), _jsx("ul", { className: "vocab-items", children: words.map((word) => {
                    const completed = getCompletedTests(word);
                    const total = Object.keys(word.learning_phases).length;
                    const progressPercent = (completed / total) * 100;
                    return (_jsxs("li", { className: "vocab-item", children: [_jsx("span", { className: "vocab-word", children: word.french_word }), _jsxs("div", { className: "progress-bar-container", children: [_jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${progressPercent}%` } }) }), _jsxs("span", { className: "progress-text", children: [completed, "/", total, " tests passed"] })] })] }, word.french_word));
                }) })] }));
    if (!sessionStarted) {
        return (_jsxs("div", { className: "app-shell", children: [_jsxs("header", { className: "app-header", children: [_jsx("p", { className: "eyebrow", children: "French Learning App" }), _jsx("h1", { children: "The planner-driven vocabulary studio" }), _jsx("p", { className: "muted-text", children: "Start a focused session that follows the Basic Info ladder: the next step always comes from the word\u2019s progress, and audio tests respect your device capabilities." })] }), _jsxs("section", { className: "app-grid", children: [_jsxs("div", { className: "instructions-panel", children: [_jsx("h2", { children: "Implementation TODOs" }), _jsx("ol", { children: instructions.map((note) => (_jsx("li", { children: note }, note))) })] }), _jsx(VocabList, {}), _jsxs("div", { className: "instructions-panel start-panel", children: [_jsx("h2", { children: "Ready to practice?" }), _jsx("p", { className: "muted-text", children: "Click below to start a focused session built around the planner-driven tests." }), _jsxs("div", { className: "audio-access-block", children: [_jsx("p", { className: "muted-text", children: "Toggle input/output so the selector only surfaces listening or speaking steps you can actually complete during this session." }), _jsx(CapabilityPanel, { capabilities: capabilities, onChange: handleCapabilityChange, description: "Enable these toggles to grant microphone input and audio output access before we open listening or speaking tests." })] }), _jsx("button", { className: "start-button", onClick: () => setSessionStarted(true), children: "Start session" })] })] })] }));
    }
    return (_jsx("div", { className: "app-shell app-shell--focus", children: _jsx(TestOrchestrator, { focusMode: true }) }));
};
export default App;
