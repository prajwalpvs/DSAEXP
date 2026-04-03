import React from 'react';
import { BLIND_75_TOPICS } from '../utils/constants';

export default function Sidebar({
  history,
  favorites,
  difficulty,
  setQuestion,
  loadFromHistory,
  clearHistory,
  toggleFavorite,
  xp,
  streak,
  badges,
  currentLevel,
  xpProgress,
  xpForNextLevel,
  curriculumProgress,
  onPracticeNext,
  onResetCurriculum
}) {
  return (
    <aside className="sidebar">
      <div className="card profile-card">
        <div className="profile-card-header">
          <span className="profile-title">Level {currentLevel} Problem Solver</span>
          <span className="profile-badge-icon">{badges.length > 0 ? badges[badges.length - 1].icon : 'S'}</span>
        </div>
        <div className="stat-label profile-progress-label">{xp} XP · Next at {xpForNextLevel}</div>
        <div className="stat-bar profile-progress-bar">
          <div className="stat-bar-fill" style={{ width: `${Math.min(xpProgress, 100)}%` }}></div>
        </div>

        {badges.length > 0 && (
          <div className="badge-list">
            {badges.map((badge) => (
              <span key={badge.id} title={badge.name} className="badge-chip">
                {badge.icon} {badge.name}
              </span>
            ))}
          </div>
        )}
      </div>

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
            <div className="stat-value emerald">{difficulty === 'beginner' ? 'B' : difficulty === 'intermediate' ? 'I' : 'A'}</div>
            <div className="stat-label">Mode</div>
          </div>
          <div className="stat-item">
            <div className="stat-value amber">{streak}</div>
            <div className="stat-label">Day Streak</div>
            <div className="stat-bar"><div className="stat-bar-fill amber-bar" style={{ width: `${Math.min(streak, 10) * 10}%` }}></div></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Curriculum Path</span>
          <button
            className="clear-btn"
            onClick={() => {
              if (window.confirm('Reset all progress?')) {
                onResetCurriculum();
              }
            }}
          >
            Reset
          </button>
        </div>
        <div className="topics-grid topics-stack">
          {BLIND_75_TOPICS.map((topic) => {
            const completed = curriculumProgress?.[topic.id] || 0;
            const percentage = Math.round((completed / topic.total) * 100);

            return (
              <div key={topic.id} className="topic-progress-card">
                <div className="topic-progress-header">
                  <span className="topic-progress-name">{topic.icon} {topic.name}</span>
                  <span className="topic-progress-count">{completed}/{topic.total}</span>
                </div>
                <div className="stat-bar topic-progress-bar">
                  <div className="stat-bar-fill" style={{ width: `${percentage}%` }}></div>
                </div>
                <button
                  className="quick-action-btn"
                  onClick={() => onPracticeNext(topic)}
                >
                  Practice next
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card card-accent-subtle">
        <div className="card-header">
          <span className="card-title">Recent</span>
          {history.length > 0 && (
            <button className="clear-btn" onClick={clearHistory}>Clear</button>
          )}
        </div>
        {history.length > 0 ? (
          <div className="sidebar-list">
            {history.slice(0, 5).map((item) => (
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
          <p className="sidebar-empty">No history yet. Ask a question to build your study trail.</p>
        )}
      </div>

      <div className="card card-accent-pink">
        <div className="card-header">
          <span className="card-title">Favorites</span>
        </div>
        {favorites.length > 0 ? (
          <div className="sidebar-list">
            {favorites.map((favorite, idx) => (
              <div key={idx} className="sidebar-list-item sidebar-list-item-row">
                <p
                  className="sidebar-list-item-text"
                  onClick={() => setQuestion(favorite)}
                  style={{ cursor: 'pointer' }}
                >
                  {favorite}
                </p>
                <button
                  className="heart-btn"
                  onClick={() => toggleFavorite(favorite)}
                  title="Remove from favorites"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="sidebar-empty">Save a question here for faster review later.</p>
        )}
      </div>

      <div className="card card-accent-subtle">
        <div className="card-header">
          <span className="card-title">Study Tips</span>
        </div>
        <div className="study-tips">
          <p><strong>Deep work:</strong> 25 minutes focused, 5 minutes to reset.</p>
          <p><strong>Pattern check:</strong> Name the data structure before writing code.</p>
          <p><strong>Complexity first:</strong> Sanity-check time and space before coding.</p>
        </div>
      </div>
    </aside>
  );
}
