import { useState, useEffect } from 'react';

// Hooks & Utils
import { useLocalStorage } from './hooks/useLocalStorage';
import { useGeminiAPI } from './hooks/useGeminiAPI';
import { STORAGE_KEYS, SAMPLE_QUESTIONS_CATEGORIZED, DSA_TOPICS } from './utils/constants';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import AnswerCard from './components/AnswerCard';

import './App.css';
export default function App() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [question, setQuestion] = useState('');
  
  // Custom Hooks mapped
  const { generateAnswer, answer, setAnswer, loading, error, setError } = useGeminiAPI();
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.QUESTION_HISTORY, []);
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.FAVORITES, []);
  const [darkMode, setDarkMode] = useLocalStorage(STORAGE_KEYS.DARK_MODE, false);
  const [difficulty, setDifficulty] = useLocalStorage(STORAGE_KEYS.DIFFICULTY, 'beginner');

  // UI state variables
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [toast, setToast] = useState('');
  const [toastTimeout, setToastTimeout] = useState(null);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Apply dark mode to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Show toast notification with proper cleanup
  const showToast = (message) => {
    // Clear previous timeout if exists
    if (toastTimeout) clearTimeout(toastTimeout);

    setToast(message);
    const newTimeout = setTimeout(() => {
      setToast('');
      setToastTimeout(null);
    }, 3000);
    setToastTimeout(newTimeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeout) clearTimeout(toastTimeout);
    };
  }, [toastTimeout]);

  // Save to history with error handling
  const saveToHistory = (q, a) => {
    try {
      const newEntry = {
        id: Date.now(),
        question: q,
        answer: a,
        timestamp: new Date().toLocaleString()
      };
      const updated = [newEntry, ...history].slice(0, 10);
      setHistory(updated);
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        showToast('⚠️ Storage full. Clearing old history.');
        setHistory([]);
      } else {
        console.error('Error saving to history:', err);
      }
    }
  };

  // Clear history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      showToast('🗑️ History cleared');
      setShowHistory(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = (q) => {
    if (favorites.includes(q)) {
      const updated = favorites.filter(fav => fav !== q);
      setFavorites(updated);
    } else {
      const updated = [...favorites, q];
      setFavorites(updated);
    }
  };

  // Load from history
  const loadFromHistory = (q, a) => {
    setQuestion(q);
    setAnswer(a);
    setShowHistory(false);
  };

    // Validate input before API call
  const handleGenerateClick = async () => {
    const trimmedQuestion = (question || '').trim();

    if (trimmedQuestion.length === 0) {
      setError('❌ Please enter a DSA or LeetCode question.');
      return;
    }

    if (trimmedQuestion.length < 5) {
      setError('❌ Question must be at least 5 characters long.');
      return;
    }

    if (trimmedQuestion.length > 2000) {
      setError(`❌ Question must be less than 2000 characters. Current: ${trimmedQuestion.length}`);
      return;
    }

    // Await answer generation from hook
    const result = await generateAnswer(trimmedQuestion, difficulty);
    if (result) {
        saveToHistory(trimmedQuestion, result);
        showToast('✅ Answer generated successfully!');
    }
  };

  // ============================================
  // RENDER THE COMPONENT
  // ============================================
  return (
    <div className="app-wrapper">
      {/* Toast Notification */}
      {toast && <div className="toast">{toast}</div>}

      {/* ===== TOP NAV BAR ===== */}
      <Header 
        difficulty={difficulty} 
        setDifficulty={setDifficulty} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

      {/* ===== DASHBOARD (Sidebar + Main) ===== */}
      <div className="dashboard">

        {/* ===== SIDEBAR ===== */}
        <Sidebar 
          history={history}
          favorites={favorites}
          difficulty={difficulty}
          setQuestion={setQuestion}
          loadFromHistory={loadFromHistory}
          clearHistory={clearHistory}
          toggleFavorite={toggleFavorite}
        />

        {/* ===== MAIN CONTENT ===== */}
        <main className="main-content">

          {/* Welcome Hero — only when no answer is displayed */}
          {!answer && !loading && !error && (
            <div className="welcome-hero">
              <div className="welcome-icon">💡</div>
              <h2 className="welcome-title">What do you want to learn today?</h2>
              <p className="welcome-subtitle">Ask any DSA question — from Two Sum to system design. Get step-by-step explanations, code, and diagrams.</p>
            </div>
          )}

          {/* Ask Card */}
          <ChatInput 
            question={question}
            setQuestion={setQuestion}
            loading={loading}
            handleGenerateClick={handleGenerateClick}
            toggleFavorite={toggleFavorite}
            favorites={favorites}
          />

          {/* Loading */}
          {loading && (
            <div className="loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="loading-text">Generating your answer…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {/* Answer Card */}
          <AnswerCard 
            answer={answer}
            toggleFavorite={toggleFavorite}
            question={question}
            favorites={favorites}
            showToast={showToast}
          />

        </main>
      </div>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Scroll to top"
      >
        ↑
      </button>
    </div>
  );
}

