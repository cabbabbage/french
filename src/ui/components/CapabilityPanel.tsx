import React from 'react';
import type { UserCapabilities } from '@core/types';

interface CapabilityPanelProps {
  capabilities: UserCapabilities;
  onChange: (capabilities: UserCapabilities) => void;
  description?: string;
}

export const CapabilityPanel: React.FC<CapabilityPanelProps> = ({ capabilities, onChange, description }) => {
  const toggle = (key: keyof UserCapabilities) => {
    onChange({ ...capabilities, [key]: !capabilities[key] });
  };

  const detailText =
    description ??
    'Disable capabilities to test how the selector avoids tests that require playback or microphone input.';

  return (
    <section className="capability-panel">
      <h3>Audio capability</h3>
      <p className="muted-text">{detailText}</p>
      <div className="capability-toggles">
        <button
          type="button"
          className={`capability-toggle ${capabilities.has_audio_output ? 'capability-toggle--active' : ''}`}
          onClick={() => toggle('has_audio_output')}
        >
          <strong>Audio output</strong>
          <span>{capabilities.has_audio_output ? 'enabled' : 'disabled'}</span>
        </button>
        <button
          type="button"
          className={`capability-toggle ${capabilities.has_audio_input ? 'capability-toggle--active' : ''}`}
          onClick={() => toggle('has_audio_input')}
        >
          <strong>Audio input</strong>
          <span>{capabilities.has_audio_input ? 'enabled' : 'disabled'}</span>
        </button>
      </div>
    </section>
  );
};
