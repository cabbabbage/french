import React, { useMemo } from 'react';
import { speakFrenchWord } from '@ui/components/tests/common/audioHelpers';
import type { WordEntry } from '@core/types';

interface HoverableTextDisplayProps {
  phrase: string;
  word?: WordEntry;
}

const formatMeaningTooltip = (meanings: string[]): string => {
  if (meanings.length === 0) {
    return 'Tap to play audio';
  }
  return `Meanings: ${meanings.join(', ')}`;
};

export const HoverableTextDisplay: React.FC<HoverableTextDisplayProps> = ({ phrase, word }) => {
  const tokens = phrase.split(' ');
  const targetWord = word?.french_word?.toLowerCase() ?? '';
  const englishMeanings = word?.english_meanings ?? [];
  const tooltip = formatMeaningTooltip(englishMeanings);
  const pronunciation = word?.pronunciation_guide;

  const handleTokenClick = (token: string) => {
    if (!word) {
      speakFrenchWord(token);
      return;
    }
    const candidate = token.toLowerCase();
    if (candidate.includes(targetWord)) {
      speakFrenchWord(word.french_word);
    } else {
      speakFrenchWord(token);
    }
  };

  const meaningLabel = englishMeanings.join(' / ');

  return (
    <div className="hoverable-text">
      {tokens.map((token, index) => (
        <button
          key={`${token}-${index}`}
          className="hoverable-token"
          type="button"
          title={tooltip}
          onClick={() => handleTokenClick(token)}
        >
          {token}
        </button>
      ))}
      {word && (
        <div className="hoverable-note">
          <p className="muted-text">
            <strong>Meanings:</strong> {meaningLabel || '—'}
          </p>
          {pronunciation && (
            <p className="muted-text">
              <strong>Pronunciation guide:</strong> {pronunciation}
            </p>
          )}
          <button type="button" onClick={() => speakFrenchWord(word.french_word)}>
            Play {word.french_word}
          </button>
        </div>
      )}
    </div>
  );
};
