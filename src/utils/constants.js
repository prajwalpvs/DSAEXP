export const STORAGE_KEYS = {
  QUESTION_HISTORY: 'questionHistory',
  FAVORITES: 'favorites',
  DARK_MODE: 'darkMode',
  DIFFICULTY: 'difficulty',
  LANGUAGE: 'language',
  USER_XP: 'userXp',
  STREAK: 'streak',
  BADGES: 'badges',
  CURRICULUM_PROGRESS: 'curriculumProgress'
};

export const BADGES_MAP = [
  { id: 'novice', name: 'Starter', icon: '🐣', requiredXp: 0 },
  { id: 'solver', name: 'Problem Solver', icon: '🧠', requiredXp: 50 },
  { id: 'consistent', name: 'Consistent', icon: '🔥', requiredXp: 150 },
  { id: 'hacker', name: 'Hacker', icon: '💻', requiredXp: 300 },
  { id: 'master', name: 'DSA Master', icon: '👑', requiredXp: 1000 },
];

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent';
export const API_REQUEST_TIMEOUT = 30000; // 30 seconds
export const API_RATE_LIMIT_MS = 60000; // 1 minute between requests

// Organized by difficulty and category for better UX
export const SAMPLE_QUESTIONS_CATEGORIZED = {
  popular: [
    { text: "Two Sum problem", emoji: "🔥" },
    { text: "Reverse linked list", emoji: "🔥" },
    { text: "Binary tree traversals", emoji: "🔥" },
    { text: "Climbing stairs DP", emoji: "🔥" },
    { text: "Valid parentheses", emoji: "🔥" }
  ]
};

export const BLIND_75_TOPICS = [
  { id: 'arrays_hashing', name: 'Arrays & Hashing', icon: '🔢', total: 9 },
  { id: 'two_pointers', name: 'Two Pointers', icon: '↔️', total: 5 },
  { id: 'sliding_window', name: 'Sliding Window', icon: '🪟', total: 6 },
  { id: 'stack', name: 'Stack', icon: '🥞', total: 7 },
  { id: 'binary_search', name: 'Binary Search', icon: '🔍', total: 7 },
  { id: 'linked_list', name: 'Linked List', icon: '🔗', total: 11 },
  { id: 'trees', name: 'Trees', icon: '🌲', total: 15 },
  { id: 'tries', name: 'Tries', icon: '🌳', total: 3 },
  { id: 'heap', name: 'Heap / Priority Queue', icon: '⛰️', total: 7 },
  { id: 'backtracking', name: 'Backtracking', icon: '🔙', total: 9 },
  { id: 'graphs', name: 'Graphs', icon: '🕸️', total: 13 },
  { id: 'dp', name: '1D DP', icon: '📊', total: 12 },
];
