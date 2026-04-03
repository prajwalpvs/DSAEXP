import { useEffect, useState } from 'react';
import './App.css';

import AnswerCard from './components/AnswerCard';
import ChatInput from './components/ChatInput';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAppState } from './hooks/useAppState';
import { useGamification } from './hooks/useGamification';
import { useGeminiAPI } from './hooks/useGeminiAPI';
import { SAMPLE_QUESTIONS_CATEGORIZED } from './utils/constants';

const HERO_FEATURES = [
  {
    title: 'Flexible answers',
    description: 'Switch difficulty and language without rewriting the question from scratch.'
  },
  {
    title: 'Reliable study trail',
    description: 'Keep favorites, revisit earlier answers, and pick up from your last topic.'
  },
  {
    title: 'Fast revision',
    description: 'Turn a generated explanation into a short quiz and export notes when needed.'
  }
];

export default function App() {
  const [question, setQuestion] = useState('');
  const [toast, setToast] = useState('');
  const [toastTimeout, setToastTimeout] = useState(null);
  const [lastRequestedCategoryId, setLastRequestedCategoryId] = useState(null);

  const {
    history,
    favorites,
    darkMode,
    difficulty,
    language,
    curriculumProgress,
    setDarkMode,
    setDifficulty,
    setLanguage,
    setCurriculumProgress,
    saveToHistory,
    clearHistory,
    toggleFavorite
  } = useAppState();

  const {
    generateAnswer,
    generateQuiz,
    answer,
    setAnswer,
    loading,
    error,
    setError
  } = useGeminiAPI();

  const gamification = useGamification();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    return () => {
      if (toastTimeout) {
        clearTimeout(toastTimeout);
      }
    };
  }, [toastTimeout]);

  const showToast = (message) => {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    setToast(message);
    const nextTimeout = setTimeout(() => {
      setToast('');
      setToastTimeout(null);
    }, 3200);
    setToastTimeout(nextTimeout);
  };

  const loadFromHistory = (savedQuestion, savedAnswer) => {
    setQuestion(savedQuestion);
    setAnswer(savedAnswer);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePracticeNext = (topic) => {
    setQuestion(`Give me a LeetCode style question for ${topic.name}`);
    setLastRequestedCategoryId(topic.id);
    setAnswer('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetCurriculum = () => {
    setCurriculumProgress({});
    showToast('Curriculum progress reset.');
  };

  const handleGenerateClick = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError('Please enter a DSA or LeetCode question.');
      return;
    }

    if (trimmedQuestion.length < 5) {
      setError('Question must be at least 5 characters long.');
      return;
    }

    if (trimmedQuestion.length > 2000) {
      setError(`Question must be less than 2000 characters. Current: ${trimmedQuestion.length}`);
      return;
    }

    const result = await generateAnswer(trimmedQuestion, difficulty, language);
    if (!result) {
      return;
    }

    saveToHistory(trimmedQuestion, result);

    const newBadges = gamification.addXp(lastRequestedCategoryId ? 15 : 10);
    if (newBadges.length > 0) {
      showToast(`New badge unlocked: ${newBadges[0].name}`);
    } else {
      showToast(lastRequestedCategoryId ? 'Answer ready. Progress updated.' : 'Answer ready.');
    }

    if (lastRequestedCategoryId) {
      setCurriculumProgress((previous) => ({
        ...previous,
        [lastRequestedCategoryId]: (previous[lastRequestedCategoryId] || 0) + 1
      }));
      setLastRequestedCategoryId(null);
    }
  };

  const primaryPrompt = SAMPLE_QUESTIONS_CATEGORIZED.popular[0]?.text || 'Two Sum problem';

  return (
    <div className="app-wrapper">
      {toast && <div className="toast">{toast}</div>}

      <Header
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
      />

      <div className="dashboard-shell">
        <Sidebar
          history={history}
          favorites={favorites}
          difficulty={difficulty}
          setQuestion={setQuestion}
          loadFromHistory={loadFromHistory}
          clearHistory={() => {
            clearHistory();
            showToast('History cleared.');
          }}
          toggleFavorite={toggleFavorite}
          xp={gamification.xp}
          streak={gamification.streak}
          badges={gamification.badges}
          currentLevel={gamification.currentLevel}
          xpProgress={gamification.xpProgress}
          xpForNextLevel={gamification.xpForNextLevel}
          curriculumProgress={curriculumProgress}
          onPracticeNext={handlePracticeNext}
          onResetCurriculum={handleResetCurriculum}
        />

        <main className="main-content">
          <section className="hero-panel">
            <div className="hero-copy">
              <span className="eyebrow">Study studio</span>
              <h1 className="hero-title">Practice smarter with a cleaner workspace.</h1>
              <p className="hero-subtitle">
                Ask a question, save the useful answers, and work through core DSA topics without
                the page feeling noisy or overdesigned.
              </p>
            </div>
            <div className="hero-actions">
              <button className="hero-primary-action" onClick={() => setQuestion(primaryPrompt)}>
                Start with a classic prompt
              </button>
              <div className="hero-meta">
                <span className="meta-chip">{history.length} saved answers</span>
                <span className="meta-chip">{favorites.length} favorites</span>
                <span className="meta-chip">Level {gamification.currentLevel}</span>
              </div>
            </div>
          </section>

          <section className="hero-feature-grid">
            {HERO_FEATURES.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h2>{feature.title}</h2>
                <p>{feature.description}</p>
              </article>
            ))}
          </section>

          <ChatInput
            question={question}
            setQuestion={setQuestion}
            loading={loading}
            handleGenerateClick={handleGenerateClick}
            toggleFavorite={toggleFavorite}
            favorites={favorites}
          />

          {loading && (
            <div className="loading">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="loading-text">Generating your answer...</span>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <AnswerCard
            answer={answer}
            toggleFavorite={toggleFavorite}
            question={question}
            favorites={favorites}
            showToast={showToast}
            generateQuiz={generateQuiz}
          />
        </main>
      </div>

      <button
        className="fab"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Scroll to top"
      >
        Top
      </button>
    </div>
  );
}
