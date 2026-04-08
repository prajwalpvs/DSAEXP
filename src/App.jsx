import { useState, useEffect, useRef } from 'react';
import { useAppState } from './hooks/useAppState';
import { useGeminiAPI } from './hooks/useGeminiAPI';
import { useGamification } from './hooks/useGamification';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import AnswerCard from './components/AnswerCard';
import Sidebar from './components/Sidebar';
import './App.css';

export default function App() {
  const [question, setQuestion] = useState('');
  const [toast, setToast] = useState('');
  const toastRef = useRef(null);

  const {
    history, favorites, darkMode, difficulty, language, curriculumProgress,
    setDarkMode, setDifficulty, setLanguage, setCurriculumProgress,
    saveToHistory, clearHistory, toggleFavorite
  } = useAppState();

  const {
    generateAnswer, generateQuiz, answer, setAnswer, loading, error, setError
  } = useGeminiAPI();

  const { xp, currentLevel, xpProgress, xpForNextLevel, badges, streak, addXp } = useGamification();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const showToast = (message) => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setToast(message);
    toastRef.current = setTimeout(() => setToast(''), 3000);
  };

  const handleGenerateClick = async () => {
    const trimmed = question.trim();
    if (!trimmed) { setError('Please enter a DSA or LeetCode question.'); return; }
    if (trimmed.length < 5) { setError('Question must be at least 5 characters.'); return; }
    if (trimmed.length > 2000) { setError(`Question too long (${trimmed.length}/2000 chars).`); return; }

    const result = await generateAnswer(trimmed, difficulty, language);
    if (result) {
      saveToHistory(trimmed, result);
      const newBadges = addXp(10);
      if (newBadges.length > 0) {
        showToast(`Badge unlocked: ${newBadges[0].name}!`);
      } else {
        showToast('Answer generated successfully!');
      }
    }
  };

  const loadFromHistory = (q, a) => {
    setQuestion(q);
    setAnswer(a);
  };

  const handlePracticeNext = (topic) => {
    const completed = curriculumProgress?.[topic.id] || 0;
    if (completed < topic.total) {
      setCurriculumProgress({ ...curriculumProgress, [topic.id]: completed + 1 });
    }
    setQuestion(`Explain problem ${completed + 1} in ${topic.name}`);
  };

  const handleResetCurriculum = () => {
    setCurriculumProgress({});
    showToast('Curriculum progress reset.');
  };

  const handleQuizComplete = (score) => {
    const newBadges = addXp(score * 25);
    if (newBadges.length > 0) {
      showToast(`+${score * 25} XP! Badge unlocked: ${newBadges[0].name}!`);
    } else {
      showToast(`Quiz done! +${score * 25} XP earned.`);
    }
  };

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
      <div className="app-layout">
        <Sidebar
          history={history}
          favorites={favorites}
          difficulty={difficulty}
          setQuestion={setQuestion}
          loadFromHistory={loadFromHistory}
          clearHistory={clearHistory}
          toggleFavorite={toggleFavorite}
          xp={xp}
          streak={streak}
          badges={badges}
          currentLevel={currentLevel}
          xpProgress={xpProgress}
          xpForNextLevel={xpForNextLevel}
          curriculumProgress={curriculumProgress}
          onPracticeNext={handlePracticeNext}
          onResetCurriculum={handleResetCurriculum}
        />
        <main className="main-content">
          <ChatInput
            question={question}
            setQuestion={setQuestion}
            loading={loading}
            handleGenerateClick={handleGenerateClick}
            toggleFavorite={toggleFavorite}
            favorites={favorites}
          />
          {loading && <div className="loading">Generating answer...</div>}
          {error && <div className="error">{error}</div>}
          <AnswerCard
            answer={answer}
            question={question}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            showToast={showToast}
            generateQuiz={generateQuiz}
            onQuizComplete={handleQuizComplete}
          />
        </main>
      </div>
      <button
        className="fab"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Scroll to top"
      >
        ^
      </button>
    </div>
  );
}
