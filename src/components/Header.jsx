import React from 'react';

export default function Header({ difficulty, setDifficulty, darkMode, setDarkMode, language, setLanguage }) {
  return (
    <nav className="nav-bar">
      <div className="nav-brand">
        <div className="nav-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        </div>
        <span className="nav-title">
          <span className="text-gradient-animated">DSA Helper</span>
        </span>
      </div>
      <div className="nav-controls">
        <select
          className="difficulty-select language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label="Select programming language"
        >
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="javascript">JavaScript</option>
          <option value="sql">SQL</option>
        </select>
        <select
          className="difficulty-select"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          aria-label="Select difficulty level"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button
          className="theme-toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle dark mode"
        >
          {darkMode ? 'Light' : 'Dark'}
        </button>
      </div>
    </nav>
  );
}
