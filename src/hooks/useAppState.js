import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS } from '../utils/constants';

export function useAppState() {
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.QUESTION_HISTORY, []);
  const [favorites, setFavorites] = useLocalStorage(STORAGE_KEYS.FAVORITES, []);
  const [darkMode, setDarkMode] = useLocalStorage(STORAGE_KEYS.DARK_MODE, false);
  const [difficulty, setDifficulty] = useLocalStorage(STORAGE_KEYS.DIFFICULTY, 'beginner');
  const [language, setLanguage] = useLocalStorage(STORAGE_KEYS.LANGUAGE, 'python');
  const [curriculumProgress, setCurriculumProgress] = useLocalStorage(
    STORAGE_KEYS.CURRICULUM_PROGRESS,
    {}
  );

  const saveToHistory = (question, answer) => {
    const nextEntry = {
      id: Date.now(),
      question,
      answer,
      timestamp: new Date().toLocaleString()
    };

    try {
      setHistory((previous) => [nextEntry, ...previous].slice(0, 10));
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        setHistory([]);
      } else {
        throw error;
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const toggleFavorite = (question) => {
    setFavorites((previous) =>
      previous.includes(question)
        ? previous.filter((favorite) => favorite !== question)
        : [...previous, question]
    );
  };

  return {
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
  };
}
