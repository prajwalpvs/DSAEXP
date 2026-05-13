import React from 'react';
import { SAMPLE_QUESTIONS_CATEGORIZED } from '../utils/constants';

const MAX_CHARS = 2000;

export default function ChatInput({
  question,
  setQuestion,
  loading,
  handleGenerateClick,
  toggleFavorite,
  favorites
}) {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleGenerateClick();
    }
  };

  return (
    <div className="card ask-card">
      <div className="card-header">
        <span className="card-title">Ask a Question</span>
      </div>
      <div className="input-section">
        <textarea
          id="question"
          placeholder="e.g. Explain binary search with a Python example..."
          aria-label="Enter your DSA or LeetCode question"
          rows="4"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          maxLength={MAX_CHARS}
        />
        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: question.length > MAX_CHARS * 0.9 ? '#ef4444' : 'var(--text-muted)', marginTop: '4px' }}>
          {question.length}/{MAX_CHARS}
        </div>
        <div className="samples-section">
          <p><span className="trending-badge">Popular prompts</span></p>
          <div className="samples-grid">
            {SAMPLE_QUESTIONS_CATEGORIZED.popular.map((q, i) => (
              <button
                key={i}
                className="sample-btn"
                onClick={() => setQuestion(q.text)}
              >
                <span className="emoji">{q.emoji}</span>
                <span>{q.text}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="button-group">
          <button
            onClick={handleGenerateClick}
            disabled={loading}
            className="generate-btn"
            title="Explain it (Ctrl+Enter)"
          >
            {loading ? 'Generating...' : 'Explain it'}
          </button>
          {question && (
            <button
              className="heart-btn-main"
              onClick={() => toggleFavorite(question)}
              title={favorites.includes(question) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorites.includes(question) ? 'Saved to favorites' : 'Save to favorites'}
            </button>
          )}
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
          Tip: Press <kbd style={{ padding: '1px 5px', borderRadius: '3px', border: '1px solid var(--border-color)', fontSize: '0.7rem' }}>Ctrl+Enter</kbd> to submit
        </p>
      </div>
    </div>
  );
}
