import React from 'react';
import { SAMPLE_QUESTIONS_CATEGORIZED } from '../utils/constants';

export default function ChatInput({ 
  question, 
  setQuestion, 
  loading, 
  handleGenerateClick, 
  toggleFavorite, 
  favorites 
}) {
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
          disabled={loading}
        />
        <div className="samples-section">
          <p><span className="trending-badge">🔥 Trending</span></p>
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
          >
            {loading ? '⏳ Generating...' : '✨ Ask AI'}
          </button>
          {question && (
            <button
              className="heart-btn-main"
              onClick={() => toggleFavorite(question)}
              title={favorites.includes(question) ? 'Remove from favorites' : 'Add to favorites'}
            >
              {favorites.includes(question) ? '❤️ Favorited' : '🤍 Favorite'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
