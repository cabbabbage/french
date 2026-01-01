import React, { useState } from 'react';
import type { WordEntry } from '@core/types';
import type { BasicInfoTestDefinition } from '@core/basicInfo/tests';

interface EnShownPronounceProps {
  word: WordEntry;
  test: BasicInfoTestDefinition;
  attemptIndex: number;
  onSubmit: (correct: boolean) => void;
}

export const EnShownPronounce: React.FC<EnShownPronounceProps> = ({ word, test, attemptIndex, onSubmit }) => {
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);

  const englishPrompt = word.english_meanings[0] || 'the word';

  const handleStartRecording = () => {
    // TODO: Implement actual speech recording
    console.log(`Starting recording for pronunciation of French word corresponding to: ${englishPrompt}`);
    setRecording(true);
  };

  const handleStopRecording = () => {
    // TODO: Implement speech recognition/validation
    console.log(`Stopped recording, validating pronunciation of: ${word.french_word}`);
    setRecording(false);
    setRecorded(true);

    // For now, randomly determine correctness (stub implementation)
    const isCorrect = Math.random() > 0.5;
    onSubmit(isCorrect);
  };

  return (
    <div className="basic-info-pronounce">
      <div className="pronounce-prompt">
        <p>Say the French word for: <strong>"{englishPrompt}"</strong></p>
        <p>Pronounce the French word clearly into your microphone.</p>
      </div>
      <div className="pronounce-display">
        <div className="english-prompt">{englishPrompt}</div>
        <div className="french-target">(French: {word.french_word})</div>
      </div>
      <div className="pronounce-controls">
        {!recording && !recorded && (
          <button
            type="button"
            onClick={handleStartRecording}
            className="record-btn"
          >
            🎤 Start Recording
          </button>
        )}
        {recording && (
          <div className="recording-indicator">
            <span className="recording-dot">●</span>
            <span>Recording...</span>
            <button
              type="button"
              onClick={handleStopRecording}
              className="stop-record-btn"
            >
              ⏹️ Stop & Submit
            </button>
          </div>
        )}
        {recorded && (
          <div className="recorded-status">
            <span>✓ Pronunciation submitted for evaluation</span>
          </div>
        )}
      </div>
      <div className="pronounce-hint">
        <p>Speech recognition is not yet implemented. This is a placeholder that randomly scores your attempt.</p>
      </div>
    </div>
  );
};
