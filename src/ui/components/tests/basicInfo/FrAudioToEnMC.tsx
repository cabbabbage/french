import React, { useMemo, useState } from 'react';
import { loadWordEntries } from '@core/dataModel';
import { generateEnglishDistractors } from './utils';
import type { WordEntry } from '@core/types';
import type { BasicInfoTestDefinition } from '@core/basicInfo/tests';

interface FrAudioToEnMCProps {
  word: WordEntry;
  test: BasicInfoTestDefinition;
  attemptIndex: number;
  onSubmit: (correct: boolean) => void;
}

export const FrAudioToEnMC: React.FC<FrAudioToEnMCProps> = ({ word, test, attemptIndex, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [audioPlayed, setAudioPlayed] = useState(false);

  const allWords = useMemo(() => loadWordEntries(), []);
  const correctAnswer = word.english_meanings[0] || '';

  const options = useMemo(() => {
    const distractors = generateEnglishDistractors(word, allWords, 3);
    return [...distractors, correctAnswer].sort(() => Math.random() - 0.5);
  }, [word, allWords, correctAnswer]);

  const handlePlayAudio = () => {
    // TODO: Implement actual audio playback using TTS or recorded audio
    console.log(`Playing audio for: ${word.french_word}`);
    setAudioPlayed(true);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption === correctAnswer;
    onSubmit(isCorrect);
  };

  return (
    <div className="basic-info-audio-mc">
      <div className="audio-prompt">
        <p>Listen to the French word and select its meaning:</p>
        <button
          type="button"
          onClick={handlePlayAudio}
          className="play-audio-btn"
        >
          🔊 Play Audio
        </button>
        {audioPlayed && <span className="audio-played">Audio played</span>}
      </div>
      <div className="mc-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`mc-option ${selectedOption === option ? 'selected' : ''}`}
            onClick={() => setSelectedOption(option)}
            disabled={!audioPlayed}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="mc-actions">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedOption || !audioPlayed}
          className="submit-btn"
        >
          Submit Answer
        </button>
      </div>
      {!audioPlayed && (
        <div className="audio-hint">
          <p>Please play the audio first before selecting an answer.</p>
        </div>
      )}
    </div>
  );
};
