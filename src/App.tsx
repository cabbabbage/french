import React, { useState } from 'react';
import { CapabilityPanel } from '@ui/components/CapabilityPanel';
import { TestOrchestrator } from '@ui/components/TestOrchestrator';
import { ProgressDisplay } from '@ui/components/ProgressDisplay';
import { loadUserCapabilities, persistUserCapabilities } from '@core/capabilities';
import type { UserCapabilities } from '@core/types';

const instructions = [
  'Run the Basic Info ladder exclusively: words drive the test selection, not learning phases.',
  'Track only `basic_info_step` and `basic_info_completed` per word and clamp the ladder bounds.',
  'Gate listening and speaking steps by the capabilities the user enables before the session.',
  'Show each step as an explicit attempt (2 tries per word) and progress accordingly.'
];

const App: React.FC = () => (
  <AppContent />
);

const AppContent: React.FC = () => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [capabilities, setCapabilities] = useState<UserCapabilities>(() => loadUserCapabilities());

  const handleCapabilityChange = (next: UserCapabilities) => {
    setCapabilities(next);
    persistUserCapabilities(next);
  };

  if (!sessionStarted) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <p className="eyebrow">French Learning App</p>
          <h1>The planner-driven vocabulary studio</h1>
          <p className="muted-text">
            Start a focused session that follows the Basic Info ladder: the next step always comes from the word’s progress, and audio tests respect your device capabilities.
          </p>
        </header>
        <section className="app-grid">
          <div className="instructions-panel">
            <h2>Implementation TODOs</h2>
            <ol>
              {instructions.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ol>
          </div>
          <ProgressDisplay />
          <div className="instructions-panel start-panel">
            <h2>Ready to practice?</h2>
            <p className="muted-text">Click below to start a focused session built around the planner-driven tests.</p>
            <div className="audio-access-block">
            <p className="muted-text">
              Toggle input/output so the selector only surfaces listening or speaking steps you can actually complete during this session.
            </p>
              <CapabilityPanel
                capabilities={capabilities}
                onChange={handleCapabilityChange}
                description="Enable these toggles to grant microphone input and audio output access before we open listening or speaking tests."
              />
            </div>
            <button className="start-button" onClick={() => setSessionStarted(true)}>
              Start session
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell app-shell--focus">
      <TestOrchestrator focusMode />
    </div>
  );
};

export default App;
