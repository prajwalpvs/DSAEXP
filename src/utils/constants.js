export const STORAGE_KEYS = {
  QUESTION_HISTORY: 'questionHistory',
  FAVORITES: 'favorites',
  DARK_MODE: 'darkMode',
  DIFFICULTY: 'difficulty'
};

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
export const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
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

export const DSA_TOPICS = [
  { name: 'Arrays', icon: '🔢' },
  { name: 'Strings', icon: '🔤' },
  { name: 'Linked Lists', icon: '🔗' },
  { name: 'Trees', icon: '🌲' },
  { name: 'Graphs', icon: '🕸️' },
  { name: 'Dynamic Programming', icon: '📊' },
  { name: 'Sorting', icon: '📶' },
  { name: 'Stacks & Queues', icon: '📚' },
  { name: 'Binary Search', icon: '🔍' },
  { name: 'Hashing', icon: '#️⃣' },
  { name: 'Recursion', icon: '🔄' },
  { name: 'Greedy', icon: '💰' },
  { name: 'Bit Manipulation', icon: '⚙️' },
  { name: 'Heap', icon: '⛰️' }
];
