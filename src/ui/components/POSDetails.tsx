import React from 'react';
import type { WordEntry } from '@core/types';

interface POSDetailsProps {
  word: WordEntry;
}

const formatValue = (value: unknown): string => {
  if (value == null) {
    return '—';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(', ');
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const renderDataRows = (data?: Record<string, unknown>) => {
  if (!data) {
    return null;
  }
  return (
    <div className="pos-block">
      {Object.entries(data)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => (
          <p key={key} className="muted-text">
            <strong>{key.replace(/_/g, ' ')}:</strong> {formatValue(value)}
          </p>
        ))}
    </div>
  );
};

export const POSDetails: React.FC<POSDetailsProps> = ({ word }) => {
  return (
    <aside className="pos-details">
      <h3>Grammar spotlight</h3>
      <p className="muted-text">
        Part of speech: <strong>{word.part_of_speech}</strong>
      </p>
      <p className="muted-text">
        Meanings: <strong>{word.english_meanings.join(', ')}</strong>
      </p>
      {word.pronunciation_guide && (
        <p className="muted-text">
          Pronunciation guide: <strong>{word.pronunciation_guide}</strong>
        </p>
      )}
      {word.noun_data && renderDataRows(word.noun_data)}
      {word.verb_data && renderDataRows(word.verb_data)}
      {word.adjective_data && renderDataRows(word.adjective_data)}
      {word.adverb_data && renderDataRows(word.adverb_data)}
    </aside>
  );
};
