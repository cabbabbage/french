import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const CapabilityPanel = ({ capabilities, onChange, description }) => {
    const toggle = (key) => {
        onChange({ ...capabilities, [key]: !capabilities[key] });
    };
    const detailText = description ??
        'Disable capabilities to test how the selector avoids tests that require playback or microphone input.';
    return (_jsxs("section", { className: "capability-panel", children: [_jsx("h3", { children: "Audio capability" }), _jsx("p", { className: "muted-text", children: detailText }), _jsxs("div", { className: "capability-toggles", children: [_jsxs("button", { type: "button", className: `capability-toggle ${capabilities.has_audio_output ? 'capability-toggle--active' : ''}`, onClick: () => toggle('has_audio_output'), children: [_jsx("strong", { children: "Audio output" }), _jsx("span", { children: capabilities.has_audio_output ? 'enabled' : 'disabled' })] }), _jsxs("button", { type: "button", className: `capability-toggle ${capabilities.has_audio_input ? 'capability-toggle--active' : ''}`, onClick: () => toggle('has_audio_input'), children: [_jsx("strong", { children: "Audio input" }), _jsx("span", { children: capabilities.has_audio_input ? 'enabled' : 'disabled' })] })] })] }));
};
