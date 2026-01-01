import React, { useState } from 'react';
import { normalizeText } from './utils';
import type { WordEntry } from '@core/types';
import type { BasicInfoTestDefinition } from '@core/basicInfo/tests';

interface FrAudioToFrTypeProps {
  word: WordEntry;
  test: BasicInfoTestDefinition;
  attemptIndex: number;
  onSubmit: (correct: boolean) => void;
}

export const FrAudioToFrType: React.FC<FrAudioToFrTypeProps> = ({ word, test, attemptIndex, onSubmit }) => {
  const [input, setInput] = useState('');
  const [audioPlayed, setAudioPlayed] = useState(false);

  const correctAnswer = word.french_word;

  const handlePlayAudio = () => {
    // TODO: Implement actual audio playback using TTS or recorded audio
    console.log(`Playing audio for: ${word.french_word}`);
    setAudioPlayed(true);
  };

  const handleSubmit = () => {
    const normalizedInput = normalizeText(input);
    const normalizedAnswer = normalizeText(correctAnswer);
    const isCorrect = normalizedInput === normalizedAnswer;
    onSubmit(isCorrect);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && audioPlayed) {
      handleSubmit();
    }
  };

  return (
    <div className="basic-info-audio-type">
      <div className="audio-prompt">
        <p>Listen to the French word and type what you heard:</p>
        <button
          type="button"
          onClick={handlePlayAudio}
          className="play-audio-btn"
        >
          🔊 Play Audio
        </button>
        {audioPlayed && <span className="audio-played">Audio played</span>}
      </div>
      <div className="type-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type the French word you heard..."
          disabled={!audioPlayed}
          autoFocus={audioPlayed}
        />
      </div>
      <div className="type-actions">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!input.trim() || !audioPlayed}
          className="submit-btn"
        >
          Submit Answer
        </button>
      </div>
      {!audioPlayed && (
        <div className="audio-hint">
          <p>Please play the audio first before typing your answer.</p>
        </div>
      )}
      {audioPlayed && (
        <div className="type-hint">
          <p>Tip: Pay attention to accents and spelling.</p>
        </div>
      )}
    </div>
  );
};
