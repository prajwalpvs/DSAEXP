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
      {/* Profile / Gamification Card */}
      <div className="card profile-card" style={{ paddingBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 'bold' }}>Level {currentLevel} Problem Solver</span>
          <span style={{ fontSize: '1.2rem' }}>{badges.length > 0 ? badges[badges.length - 1].icon : '🐣'}</span>
        </div>
        <div className="stat-label" style={{ marginBottom: '6px' }}>{xp} XP · Next at {xpForNextLevel}</div>
        <div className="stat-bar" style={{ height: '8px', marginBottom: '16px' }}>
          <div className="stat-bar-fill" style={{ width: `${Math.min((xpProgress / 100) * 100, 100)}%`, background: 'var(--primary)' }}></div>
        </div>
        
        {badges.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
             {badges.map(b => (
               <span key={b.id} title={b.name} style={{ background: 'var(--surface-color)', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border-color)' }}>
                 {b.icon} {b.name}
               </span>
             ))}
          </div>
        )}
      </div>

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
            <div className="stat-value amber">{streak}</div>
            <div className="stat-label">Day Streak</div>
            <div className="stat-bar"><div className="stat-bar-fill amber-bar" style={{ width: `${Math.min(streak, 10) * 10}%` }}></div></div>
          </div>
        </div>
      </div>

      {/* Curriculum Path Card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">📖 Curriculum Path</span>
          <button className="clear-btn" onClick={() => {
            if (window.confirm('Reset all progress?')) onResetCurriculum();
          }}>Reset</button>
        </div>
        <div className="topics-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {BLIND_75_TOPICS.map((topic) => {
            const completed = curriculumProgress?.[topic.id] || 0;
            const percentage = Math.round((completed / topic.total) * 100);
            return (
              <div key={topic.id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{topic.icon} {topic.name}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{completed}/{topic.total}</span>
                </div>
                <div className="stat-bar" style={{ height: '6px', marginBottom: '8px' }}>
                  <div className="stat-bar-fill" style={{ width: `${percentage}%`, background: 'var(--primary)' }}></div>
                </div>
                <button
                  className="quick-action-btn"
                  onClick={() => onPracticeNext(topic)}
                  style={{ width: '100%', padding: '6px', fontSize: '0.8rem', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Practice Next
                </button>
              </div>
            );
          })}
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

      {/* Study Tips Card */}
      <div className="card card-accent-subtle">
        <div className="card-header">
          <span className="card-title">💡 Study Tips</span>
        </div>
        <div className="sidebar-list" style={{ padding: '4px' }}>
          <div style={{ padding: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <p style={{ marginBottom: '8px' }}>• <strong>Deep Work:</strong> 25 min practice, 5 min break.</p>
            <p style={{ marginBottom: '8px' }}>• <strong>Identify Tries:</strong> Always look for prefix paths in strings.</p>
            <p>• <strong>Complexity:</strong> Always calculate Big O before writing code.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
