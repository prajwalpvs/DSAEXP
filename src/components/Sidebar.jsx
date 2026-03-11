import React from 'react';
import { DSA_TOPICS } from '../utils/constants';

export default function Sidebar({ 
  history, 
  favorites, 
  difficulty, 
  setQuestion, 
  loadFromHistory, 
  clearHistory, 
  toggleFavorite 
}) {
  return (
    <aside className="sidebar">
      {/* Stats Card */}
      <div className="card card-accent">
        <div className="card-header">
          <span className="card-title">Your Stats</span>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{history.length}</div>
            <div className="stat-label">Questions</div>
            <div className="stat-bar"><div className="stat-bar-fill" style={{ width: `${Math.min(history.length * 10, 100)}%` }}></div></div>
          </div>
          <div className="stat-item">
            <div className="stat-value pink">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
            <div className="stat-bar"><div className="stat-bar-fill pink-bar" style={{ width: `${Math.min(favorites.length * 20, 100)}%` }}></div></div>
          </div>
          <div className="stat-item">
            <div className="stat-value emerald">{difficulty === 'beginner' ? '🌱' : difficulty === 'intermediate' ? '⚡' : '🚀'}</div>
            <div className="stat-label">Level</div>
          </div>
          <div className="stat-item">
            <div className="stat-value amber">{Math.min(history.length, 10)}</div>
            <div className="stat-label">Streak</div>
            <div className="stat-bar"><div className="stat-bar-fill amber-bar" style={{ width: `${Math.min(history.length, 10) * 10}%` }}></div></div>
          </div>
        </div>
      </div>

      {/* Topics Card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Quick Topics</span>
        </div>
        <div className="topics-grid">
          {DSA_TOPICS.map((topic, i) => (
            <button
              key={i}
              className="topic-chip"
              onClick={() => setQuestion(`Explain ${topic.name} in DSA with examples`)}
            >
              <span className="topic-icon">{topic.icon}</span> {topic.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recent History Card */}
      <div className="card card-accent-subtle">
        <div className="card-header">
          <span className="card-title">Recent</span>
          {history.length > 0 && (
            <button className="clear-btn" onClick={clearHistory}>Clear</button>
          )}
        </div>
        {history.length > 0 ? (
          <div className="sidebar-list">
            {history.slice(0, 5).map(item => (
              <button
                key={item.id}
                className="sidebar-list-item"
                onClick={() => loadFromHistory(item.question, item.answer)}
              >
                <p className="sidebar-list-item-text">{item.question}</p>
                <span className="sidebar-list-item-time">{item.timestamp?.split(',')[0]}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="sidebar-empty">📭 No history yet — ask a question!</p>
        )}
      </div>

      {/* Favorites Card */}
      <div className="card card-accent-pink">
        <div className="card-header">
          <span className="card-title">Favorites</span>
        </div>
        {favorites.length > 0 ? (
          <div className="sidebar-list">
            {favorites.map((fav, idx) => (
              <div key={idx} className="sidebar-list-item">
                <p
                  className="sidebar-list-item-text"
                  onClick={() => setQuestion(fav)}
                  style={{ cursor: 'pointer' }}
                >
                  {fav}
                </p>
                <button
                  className="heart-btn"
                  onClick={() => toggleFavorite(fav)}
                  title="Remove from favorites"
                >
                  ❤️
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="sidebar-empty">⭐ No favorites yet — star a question!</p>
        )}
      </div>
    </aside>
  );
}
