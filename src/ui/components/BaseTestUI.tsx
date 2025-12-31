import React from 'react';

interface HighlightWord {
  french: string;
  english: string[];
}

interface BaseTestUIProps {
  title: string;
  description: string;
  attempts: number;
  maxAttempts: number;
  statusMessage?: string;
  disabled?: boolean;
  label?: string | null;
  highlightWord?: HighlightWord;
  children: React.ReactNode;
}

export const BaseTestUI: React.FC<BaseTestUIProps> = ({
  title,
  description,
  attempts,
  maxAttempts,
  statusMessage,
  disabled,
  label = 'Test',
  highlightWord,
  children
}) => {
  const englishText = highlightWord?.english.filter(Boolean).join(' / ');
  return (
    <section className={`test-ui${disabled ? ' test-ui--disabled' : ''}`}>
      <header>
        {label && <p className="eyebrow">{label}</p>}
        <h2>{title}</h2>
        <p className="muted-text">{description}</p>
        <div className="attempt-tracker">
          <span>
            Attempts: {Math.min(attempts, maxAttempts)} / {maxAttempts}
          </span>
          <p className="muted-text">{statusMessage ?? 'Ready for the first attempt.'}</p>
        </div>
      </header>
      {highlightWord && (
        <div className="hero-word">
          <p className="hero-word__french">{highlightWord.french}</p>
          {englishText && <p className="hero-word__english">{englishText}</p>}
        </div>
      )}
      <div className="test-body">{children}</div>
    </section>
  );
};
