import React from 'react';

interface CandidateItem {
  word: string;
  step: number;
  testId: string;
}

interface CandidatePanelProps {
  candidates: CandidateItem[];
}

export const CandidatePanel: React.FC<CandidatePanelProps> = ({ candidates }) => (
  <aside className="candidate-panel">
    {/* TODO: Plug this into the selector store so live words/phases populate in production. */}
    <h3>Upcoming Words</h3>
    <div className="candidate-list">
      {candidates.map((candidate) => (
        <article key={`${candidate.word}-${candidate.phase}-${candidate.variant}`} className="candidate-card">
          <div>
            <strong>{candidate.word}</strong>
          <p className="muted-text">Step: {candidate.step}</p>
          </div>
          <span className="badge">{candidate.testId}</span>
        </article>
      ))}
    </div>
  </aside>
);
