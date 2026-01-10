import { useState, useEffect, useCallback, useRef } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

// ============================================
// RESPONSE FORMATTER FUNCTION
// ============================================
// This function converts Gemini API markdown-style responses
// to properly formatted HTML elements
function formatGeminiResponse(text) {
  if (!text) return [];

  const lines = text.split('\n');
  const elements = [];
  let codeBlock = '';
  let codeLanguage = '';
  let inCodeBlock = false;
  let listItems = [];
  let isInList = false;

  lines.forEach((line) => {
    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        elements.push({
          type: 'code',
          language: codeLanguage || 'python',
          code: codeBlock.trim()
        });
        codeBlock = '';
        codeLanguage = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLanguage = line.replace('```', '').trim() || 'python';
      }
      return;
    }

    if (inCodeBlock) {
      codeBlock += line + '\n';
      return;
    }

    // Close list if line doesn't start with *
    if (isInList && !line.trim().startsWith('*')) {
      if (listItems.length > 0) {
        elements.push({
          type: 'list',
          items: listItems
        });
        listItems = [];
      }
      isInList = false;
    }

    // Handle bullet lists
    if (line.trim().startsWith('* ')) {
      isInList = true;
      const item = line.replace(/^\*\s+/, '').trim();
      // Remove bold markers from list items
      const cleanItem = item.replace(/\*\*/g, '');
      listItems.push(cleanItem);
      return;
    }

    // Handle headings (### or ## style)
    if (line.startsWith('### ')) {
      elements.push({
        type: 'h3',
        text: line.replace('### ', '').trim()
      });
      return;
    }

    if (line.startsWith('## ')) {
      elements.push({
        type: 'h2',
        text: line.replace('## ', '').trim()
      });
      return;
    }

    if (line.startsWith('# ')) {
      elements.push({
        type: 'h1',
        text: line.replace('# ', '').trim()
      });
      return;
    }

    // Handle regular paragraphs with bold text
    if (line.trim().length > 0) {
      elements.push({
        type: 'paragraph',
        text: line.trim()
      });
    }
  });

  // Close any unclosed list
  if (listItems.length > 0) {
    elements.push({
      type: 'list',
      items: listItems
    });
  }

  // Close any unclosed code block
  if (inCodeBlock && codeBlock) {
    elements.push({
      type: 'code',
      language: codeLanguage || 'python',
      code: codeBlock.trim()
    });
  }

  return elements;
}

// Helper function to convert **text** to <strong>text</strong>
function formatBoldText(text) {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// ============================================
// CONSTANTS
// ============================================
const STORAGE_KEYS = {
  QUESTION_HISTORY: 'questionHistory',
  FAVORITES: 'favorites',
  DARK_MODE: 'darkMode',
  DIFFICULTY: 'difficulty'
};

// Get the API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const API_REQUEST_TIMEOUT = 30000; // 30 seconds
const API_RATE_LIMIT_MS = 1000; // 1 second between requests

const BLIND_75_QUESTIONS = [
  // Arrays & Hashing
  { text: "Contains Duplicate", difficulty: "Easy", category: "Arrays & Hashing", id: "217" },
  { text: "Valid Anagram", difficulty: "Easy", category: "Arrays & Hashing", id: "242" },
  { text: "Two Sum", difficulty: "Easy", category: "Arrays & Hashing", id: "1" },
  { text: "Group Anagrams", difficulty: "Medium", category: "Arrays & Hashing", id: "49" },
  { text: "Top K Frequent Elements", difficulty: "Medium", category: "Arrays & Hashing", id: "347" },
  { text: "Product of Array Except Self", difficulty: "Medium", category: "Arrays & Hashing", id: "238" },
  { text: "Valid Sudoku", difficulty: "Medium", category: "Arrays & Hashing", id: "36" },
  { text: "Encode and Decode Strings", difficulty: "Medium", category: "Arrays & Hashing", id: "271" },
  { text: "Longest Consecutive Sequence", difficulty: "Medium", category: "Arrays & Hashing", id: "128" },

  // Two Pointers
  { text: "Valid Palindrome", difficulty: "Easy", category: "Two Pointers", id: "125" },
  { text: "3Sum", difficulty: "Medium", category: "Two Pointers", id: "15" },
  { text: "Container With Most Water", difficulty: "Medium", category: "Two Pointers", id: "11" },

  // Sliding Window
  { text: "Best Time to Buy and Sell Stock", difficulty: "Easy", category: "Sliding Window", id: "121" },
  { text: "Longest Substring Without Repeating Characters", difficulty: "Medium", category: "Sliding Window", id: "3" },
  { text: "Longest Repeating Character Replacement", difficulty: "Medium", category: "Sliding Window", id: "424" },
  { text: "Minimum Window Substring", difficulty: "Hard", category: "Sliding Window", id: "76" },

  // Stack
  { text: "Valid Parentheses", difficulty: "Easy", category: "Stack", id: "20" },
  { text: "Min Stack", difficulty: "Medium", category: "Stack", id: "155" },
  { text: "Evaluate Reverse Polish Notation", difficulty: "Medium", category: "Stack", id: "150" },
  { text: "Generate Parentheses", difficulty: "Medium", category: "Stack", id: "22" },
  { text: "Daily Temperatures", difficulty: "Medium", category: "Stack", id: "739" },

  // Binary Search
  { text: "Binary Search", difficulty: "Easy", category: "Binary Search", id: "704" },
  { text: "Search a 2D Matrix", difficulty: "Medium", category: "Binary Search", id: "74" },
  { text: "Koko Eating Bananas", difficulty: "Medium", category: "Binary Search", id: "875" },
  { text: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", id: "153" },
  { text: "Search in Rotated Sorted Array", difficulty: "Medium", category: "Binary Search", id: "33" },

  // Linked List
  { text: "Reverse Linked List", difficulty: "Easy", category: "Linked List", id: "206" },
  { text: "Merge Two Sorted Lists", difficulty: "Easy", category: "Linked List", id: "21" },
  { text: "Reorder List", difficulty: "Medium", category: "Linked List", id: "143" },
  { text: "Remove Nth Node From End of List", difficulty: "Medium", category: "Linked List", id: "19" },
  { text: "Linked List Cycle", difficulty: "Easy", category: "Linked List", id: "141" },
  { text: "Merge k Sorted Lists", difficulty: "Hard", category: "Linked List", id: "23" },

  // Trees
  { text: "Invert Binary Tree", difficulty: "Easy", category: "Trees", id: "226" },
  { text: "Maximum Depth of Binary Tree", difficulty: "Easy", category: "Trees", id: "104" },
  { text: "Diameter of Binary Tree", difficulty: "Easy", category: "Trees", id: "543" },
  { text: "Balanced Binary Tree", difficulty: "Easy", category: "Trees", id: "110" },
  { text: "Same Tree", difficulty: "Easy", category: "Trees", id: "100" },
  { text: "Subtree of Another Tree", difficulty: "Easy", category: "Trees", id: "572" },
  { text: "Lowest Common Ancestor of a BST", difficulty: "Medium", category: "Trees", id: "235" },
  { text: "Binary Tree Level Order Traversal", difficulty: "Medium", category: "Trees", id: "102" },
  { text: "Validate Binary Search Tree", difficulty: "Medium", category: "Trees", id: "98" },
  { text: "Kth Smallest Element in a BST", difficulty: "Medium", category: "Trees", id: "230" },
  { text: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", category: "Trees", id: "105" },
  { text: "Binary Tree Maximum Path Sum", difficulty: "Hard", category: "Trees", id: "124" },
  { text: "Serialize and Deserialize Binary Tree", difficulty: "Hard", category: "Trees", id: "297" },

  // Tries
  { text: "Implement Trie (Prefix Tree)", difficulty: "Medium", category: "Tries", id: "208" },
  { text: "Design Add and Search Words Data Structure", difficulty: "Medium", category: "Tries", id: "211" },
  { text: "Word Search II", difficulty: "Hard", category: "Tries", id: "212" },

  // Heap / Priority Queue
  { text: "Kth Largest Element in a Stream", difficulty: "Easy", category: "Heap", id: "703" },
  { text: "Last Stone Weight", difficulty: "Easy", category: "Heap", id: "1046" },
  { text: "K Closest Points to Origin", difficulty: "Medium", category: "Heap", id: "973" },
  { text: "Find Median from Data Stream", difficulty: "Hard", category: "Heap", id: "295" },

  // Graphs
  { text: "Number of Islands", difficulty: "Medium", category: "Graphs", id: "200" },
  { text: "Clone Graph", difficulty: "Medium", category: "Graphs", id: "133" },
  { text: "Max Area of Island", difficulty: "Medium", category: "Graphs", id: "695" },
  { text: "Pacific Atlantic Water Flow", difficulty: "Medium", category: "Graphs", id: "417" },
  { text: "Surrounded Regions", difficulty: "Medium", category: "Graphs", id: "130" },
  { text: "Rotting Oranges", difficulty: "Medium", category: "Graphs", id: "994" },
  { text: "Course Schedule", difficulty: "Medium", category: "Graphs", id: "207" },
  { text: "Graph Valid Tree", difficulty: "Medium", category: "Graphs", id: "261" },
  { text: "Number of Connected Components in an Undirected Graph", difficulty: "Medium", category: "Graphs", id: "323" },

  // Dynamic Programming
  { text: "Climbing Stairs", difficulty: "Easy", category: "DP", id: "70" },
  { text: "Min Cost Climbing Stairs", difficulty: "Easy", category: "DP", id: "746" },
  { text: "House Robber", difficulty: "Medium", category: "DP", id: "198" },
  { text: "House Robber II", difficulty: "Medium", category: "DP", id: "213" },
  { text: "Longest Palindromic Substring", difficulty: "Medium", category: "DP", id: "5" },
  { text: "Palindromic Substrings", difficulty: "Medium", category: "DP", id: "647" },
  { text: "Decode Ways", difficulty: "Medium", category: "DP", id: "91" },
  { text: "Coin Change", difficulty: "Medium", category: "DP", id: "322" },
  { text: "Maximum Product Subarray", difficulty: "Medium", category: "DP", id: "152" },
  { text: "Word Break", difficulty: "Medium", category: "DP", id: "139" },
  { text: "Longest Increasing Subsequence", difficulty: "Medium", category: "DP", id: "300" },
  { text: "Unique Paths", difficulty: "Medium", category: "DP", id: "62" },
  { text: "Longest Common Subsequence", difficulty: "Medium", category: "DP", id: "1143" },
  { text: "Maximum Subarray", difficulty: "Medium", category: "DP", id: "53" },
  { text: "Jump Game", difficulty: "Medium", category: "DP", id: "55" }
];

const CATEGORIES = ['All', ...new Set(BLIND_75_QUESTIONS.map(q => q.category))];
export default function App() {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Search history and favorites with error handling
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTION_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error loading history:', err);
      localStorage.removeItem(STORAGE_KEYS.QUESTION_HISTORY);
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Error loading favorites:', err);
      localStorage.removeItem(STORAGE_KEYS.FAVORITES);
      return [];
    }
  });

  // UI states
  const [showHistory, setShowHistory] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimeoutRef = useRef(null);
  const [lastApiCall, setLastApiCall] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      return saved ? JSON.parse(saved) : false;
    } catch (err) {
      return false;
    }
  });
  const [difficulty, setDifficulty] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DIFFICULTY);
      return saved || 'beginner';
    } catch (err) {
      return 'beginner';
    }
  });

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Apply dark mode to document
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Save difficulty level
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIFFICULTY, difficulty);
  }, [difficulty]);

  // Show toast notification with proper cleanup
  const showToast = useCallback((message) => {
    // Clear previous timeout if exists
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    setToast(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToast('');
    }, 3000);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

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
      localStorage.setItem(STORAGE_KEYS.QUESTION_HISTORY, JSON.stringify(updated));
    } catch (err) {
      if (err.name === 'QuotaExceededError') {
        showToast('⚠️ Storage full. Clearing old history.');
        setHistory([]);
        localStorage.removeItem(STORAGE_KEYS.QUESTION_HISTORY);
      } else {
        console.error('Error saving to history:', err);
      }
    }
  };

  // Clear history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEYS.QUESTION_HISTORY);
      showToast('🗑️ History cleared');
      setShowHistory(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = useCallback((q) => {
    setFavorites(prev => {
      const updated = prev.includes(q)
        ? prev.filter(fav => fav !== q)
        : [...prev, q];

      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Copy answer to clipboard with fallback for older browsers
  const copyToClipboard = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(answer);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = answer;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      showToast('✅ Answer copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('❌ Failed to copy. Try again.');
      console.error('Clipboard error:', err);
    }
  };

  // Export as PDF
  const exportAsPDF = async () => {
    try {
      const element = document.querySelector('.result');
      if (!element) return;

      const canvas = await html2canvas(element);
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`dsa-answer-${Date.now()}.pdf`);
      showToast('📥 PDF downloaded successfully!');
    } catch (err) {
      showToast('❌ Error exporting PDF');
      console.error(err);
    }
  };

  // Export as Markdown
  const exportAsMarkdown = useCallback(() => {
    const content = `# ${question}\n\n${answer}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-answer-${Date.now()}.md`;
    a.click();

    // Cleanup: revoke the object URL to prevent memory leak
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    showToast('📄 Markdown file downloaded!');
  }, [question, answer]);

  // Load from history
  const loadFromHistory = useCallback((q, a) => {
    setQuestion(q);
    setAnswer(a);
    setShowHistory(false);
  }, []);

  // Toggle history dropdown
  const handleHistoryToggle = useCallback(() => {
    setShowHistory(prev => !prev);
    setShowFavorites(false);
  }, []);

  // Toggle favorites dropdown
  const handleFavoritesToggle = useCallback(() => {
    setShowFavorites(prev => !prev);
    setShowHistory(false);
  }, []);

  // BUILD THE SYSTEM PROMPT
  // ============================================
  // This prompt tells Gemini how to answer questions based on difficulty level
  const buildSystemPrompt = () => {
    const difficultyGuides = {
      beginner: `Use very simple language. Avoid jargon. Use analogies with everyday objects.`,
      intermediate: `Explain technical details. Include complexity analysis (Big O). Discuss trade-offs.`,
      advanced: `Include optimization techniques. Discuss edge cases. Compare different approaches.`
    };

    return `You are an expert technical interview coach explaining data structures and algorithms.
Difficulty level: ${difficulty.toUpperCase()} - ${difficultyGuides[difficulty]}

FORMATTING RULES - STRICTLY ENFORCE:
1. Do NOT use asterisks, bullet points, markdown symbols, or emojis
2. Use plain text headings with consistent spacing
3. Use numbers (1, 2, 3) or letters (a, b, c) for lists
4. Create clean ASCII-style diagrams using arrows (→), pipes (|), and dashes (-)
5. Use professional, concise language - no filler or conversational phrases
6. No grammatical errors or redundant phrasing
7. Suitable for React UI rendering and PDF export

VISUAL DIAGRAM REQUIREMENTS:
1. Show the initial state of data structures clearly
2. Illustrate step-by-step transformations with labeled diagrams
3. Use arrows to show pointer, index, or variable movements
4. Show the final state or result
5. Maintain consistent alignment and spacing
6. Example format:
   Step 1: Initial Array
   [1, 2, 3, 4, 5]
    ↑
   left = 0

EXPLANATION STRUCTURE:
1. Place concise explanation directly below each diagram
2. Explain what occurs in that step and why it is necessary
3. Use correct technical terminology
4. Focus on the optimal approach for interviews
5. Address important edge cases explicitly

CONTENT REQUIREMENTS:
1. Provide Python code examples that are clean and well-commented
2. Wrap code in triple backticks with language identifier: \`\`\`python
3. Include Big O complexity analysis for Time and Space
4. Mention why the chosen approach is preferred over alternatives
5. Cover edge cases: empty input, single element, duplicates, etc.

OUTPUT FORMAT:
Problem Understanding
(Brief problem restatement)

Approach
(Explain the algorithm strategy)

Step-by-Step Walkthrough
(Detailed steps with ASCII diagrams)

Python Implementation
(Clean, commented code)

Complexity Analysis
- Time Complexity: O(?) and explanation
- Space Complexity: O(?) and explanation

Edge Cases
(List important edge cases to consider)

Key Insights
(Interview tips and why this approach is optimal)`;
  };

  // ============================================
  // SEND REQUEST TO GEMINI API
  // ============================================
  const handleGenerateClick = async () => {
    // Validate: Check if the user entered a question
    const trimmedQuestion = (question || '').trim();

    if (trimmedQuestion.length === 0) {
      setError('❌ Please enter a DSA or LeetCode question.');
      return;
    }

    // Validate question length
    if (trimmedQuestion.length < 5) {
      setError('❌ Question must be at least 5 characters long.');
      return;
    }

    if (trimmedQuestion.length > 2000) {
      setError(`❌ Question must be less than 2000 characters. Current: ${trimmedQuestion.length}`);
      return;
    }

    // Validate: Check if the API key was set
    if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      setError(
        '⚠️ API Key not configured. Please create a .env file in your project root and add: VITE_GEMINI_API_KEY=your_actual_api_key'
      );
      return;
    }

    // Rate limiting: Prevent API spam
    const now = Date.now();
    if (now - lastApiCall < API_RATE_LIMIT_MS) {
      setError('⏳ Please wait a moment before making another request.');
      return;
    }
    setLastApiCall(now);

    // Clear previous results and errors
    setError('');
    setAnswer('');
    setLoading(true);

    try {
      // Build the prompt that tells Gemini how to answer
      const systemPrompt = buildSystemPrompt();
      const fullPrompt = systemPrompt + '\n\nUser Question: ' + trimmedQuestion;

      // Prepare the request body for the Gemini API
      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
      };

      // Setup timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT);

      let response;
      try {
        // Make the fetch request to the Gemini API with timeout
        response = await fetch(
          `${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);
      } catch (networkErr) {
        clearTimeout(timeoutId);
        if (networkErr.name === 'AbortError') {
          throw new Error(
            `Request timeout(${API_REQUEST_TIMEOUT / 1000}s). The API took too long to respond. Please try again.`
          );
        }
        throw new Error(
          `Network Error: Unable to reach API. Check your internet connection. ${networkErr.message}`
        );
      }

      // Check if the response is successful
      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.error?.code || errorMessage;
        } catch (e) {
          // If response isn't JSON, use status text
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }

        throw new Error(`API Error ${response.status}: ${errorMessage}`);
      }

      // Parse the response JSON
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseErr) {
        throw new Error('Failed to parse API response. Invalid JSON received.');
      }

      // Extract the text from the API response
      const assistantAnswer = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!assistantAnswer) {
        throw new Error('No response received from the API. Please try again.');
      }

      // Display the answer
      setAnswer(assistantAnswer);

      // Save to history
      saveToHistory(trimmedQuestion, assistantAnswer);
      showToast('✅ Answer generated successfully!');
    } catch (err) {
      // Handle any errors that occurred during the API call
      console.error('Error:', err);
      setError(
        `❌ Error: ${err.message} \n\nPlease check your API key and try again.`
      );
    } finally {
      // Hide loading message
      setLoading(false);
    }
  };

  // ============================================
  // RENDER THE COMPONENT
  // ============================================
  return (
    <div className="app-wrapper">
      {/* Toast Notification */}
      {toast && <div className="toast">{toast}</div>}

      <div className="container">
        {/* Header with title and actions */}
        <div className="header">
          <h1><span className="text-gradient-animated">🧠 DSA / LeetCode Helper</span></h1>
          <div className="header-actions">
            <button
              className="history-btn"
              onClick={handleHistoryToggle}
            >
              📚 History ({history.length})
            </button>
            <button
              className="favorites-btn"
              onClick={handleFavoritesToggle}
            >
              ❤️ Favorites ({favorites.length})
            </button>
            <select
              className="difficulty-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              aria-label="Select difficulty level for explanation"
            >
              <option value="beginner">🌱 Beginner</option>
              <option value="intermediate">⚡ Intermediate</option>
              <option value="advanced">🚀 Advanced</option>
            </select>
            <button
              className="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <p className="subtitle">Ask any DSA or LeetCode question, and get a beginner-friendly explanation</p>

        {/* History Dropdown */}
        {showHistory && history.length > 0 && (
          <div className="history-dropdown">
            <div className="history-header">
              <h3>📜 Recent Questions</h3>
              <button className="clear-btn" onClick={clearHistory}>🗑️ Clear</button>
            </div>
            <div className="history-list">
              {history.map(item => (
                <div key={item.id} className="history-item">
                  <div className="history-content" onClick={() => loadFromHistory(item.question, item.answer)}>
                    <p className="history-question">{item.question}</p>
                    <small className="history-time">{item.timestamp}</small>
                  </div>
                  <button
                    className="heart-btn"
                    onClick={() => toggleFavorite(item.question)}
                  >
                    {favorites.includes(item.question) ? '❤️' : '🤍'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Dropdown */}
        {showFavorites && favorites.length > 0 && (
          <div className="favorites-dropdown">
            <h3>❤️ Your Favorites</h3>
            <div className="favorites-list">
              {favorites.map((fav) => (
                <div key={fav} className="favorite-item">
                  <div className="favorite-content" onClick={() => { setQuestion(fav); setShowFavorites(false); }}>
                    <p className="favorite-question">{fav}</p>
                  </div>
                  <button
                    className="heart-btn"
                    onClick={() => toggleFavorite(fav)}
                  >
                    ❤️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Blind 75 Section */}
        <div className="samples-section">
          <div className="section-header-row">
            <p className="section-label">🦁 Blind 75 Questions 🦁</p>
            <div className="category-filters">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`category-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="samples-grid filtered-grid">
            {BLIND_75_QUESTIONS
              .filter(q => selectedCategory === 'All' || q.category === selectedCategory)
              .map((q) => (
                <button
                  key={q.id}
                  className={`sample-btn difficulty-${q.difficulty.toLowerCase()}`}
                  onClick={() => setQuestion(`${q.text} (LeetCode ${q.id}) - ${q.difficulty} level ${q.category} problem in Python`)}
                  title={`LeetCode #${q.id}: ${q.text}`}
                >
                  <div className="btn-top">
                    <span className={`difficulty - badge ${q.difficulty.toLowerCase()} `}>
                      {q.difficulty}
                    </span>
                    <span className="id-badge">#{q.id}</span>
                  </div>
                  <span className="question-text">{q.text}</span>
                </button>
              ))}
          </div>
        </div>

        {/* Colorful Info Grid - Jungle Theme */}
        <div className="section-grid">
          <div className="section-card card-history">
            <div className="section-title">
              <span className="section-icon">📚</span>
              Quick Tips
            </div>
            <p style={{ fontSize: '0.9em', margin: 0 }}>Save questions to history and build your personal learning library.</p>
          </div>
          <div className="section-card card-favorites">
            <div className="section-title">
              <span className="section-icon">❤️</span>
              Favorites
            </div>
            <p style={{ fontSize: '0.9em', margin: 0 }}>Star your favorite questions for quick access later.</p>
          </div>
          <div className="section-card card-input">
            <div className="section-title">
              <span className="section-icon">🎯</span>
              Ask Anything
            </div>
            <p style={{ fontSize: '0.9em', margin: 0 }}>Choose your difficulty level for better explanations.</p>
          </div>
          <div className="section-card card-result">
            <div className="section-title">
              <span className="section-icon">🚀</span>
              Export
            </div>
            <p style={{ fontSize: '0.9em', margin: 0 }}>Download answers as PDF or Markdown files.</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <label htmlFor="question">🦒 Your Question: 🦒</label>
          <textarea
            id="question"
            placeholder="🐢 Example: Explain binary search with a Python example... 🐢" aria-label="Enter your DSA or LeetCode question" rows="5"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <div className="button-group">
            <button
              onClick={handleGenerateClick}
              disabled={loading}
              className="generate-btn"
            >
              {loading ? 'Generating Answer...' : 'Generate Answer'}
            </button>
            {question && (
              <button
                className="heart-btn-main"
                onClick={() => toggleFavorite(question)}
                title={favorites.includes(question) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.includes(question) ? '❤️ Favorited' : '🤍 Add to Favorites'}
              </button>
            )}
          </div>
        </div>

        {/* Loading Message */}
        {loading && (
          <div className="loading">
            Loading your answer...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {/* Result Section */}
        {answer && (
          <div className="result-wrapper">
            <div className="result-actions">
              <button
                className="copy-btn"
                onClick={copyToClipboard}
                aria-label="Copy answer to clipboard"
              >
                {copied ? '✅ Copied!' : '📋 Copy Answer'}
              </button>
              <button className="export-btn" onClick={exportAsPDF}>
                📥 Download PDF
              </button>
              <button className="export-btn" onClick={exportAsMarkdown}>
                📄 Download Markdown
              </button>
              <button
                className="heart-btn-main"
                onClick={() => toggleFavorite(question)}
              >
                {favorites.includes(question) ? '❤️ Favorited' : '🤍 Add to Favorites'}
              </button>
            </div>
            <div className="result">
              <FormattedResponseRenderer content={answer} />
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        className="fab"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Scroll to top"
      >
        ⬆️
      </button>
    </div>
  );
}

// ============================================
// FORMATTED RESPONSE RENDERER COMPONENT
// ============================================
function FormattedResponseRenderer({ content }) {
  const elements = formatGeminiResponse(content);

  return (
    <div className="formatted-response">
      {elements.map((element, index) => {
        switch (element.type) {
          case 'h1':
            return (
              <h1 key={index} className="response-h1">
                {element.text}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={index} className="response-h2">
                {element.text}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={index} className="response-h3">
                {element.text}
              </h3>
            );
          case 'paragraph':
            return (
              <p
                key={index}
                className="response-paragraph"
                dangerouslySetInnerHTML={{
                  __html: formatBoldText(element.text)
                }}
              />
            );
          case 'list':
            return (
              <ul key={index} className="response-list">
                {element.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    dangerouslySetInnerHTML={{
                      __html: formatBoldText(item)
                    }}
                  />
                ))}
              </ul>
            );
          case 'code':
            return (
              <div key={index} className="code-container">
                <SyntaxHighlighter
                  language={element.language}
                  style={atomOneDark}
                  showLineNumbers={true}
                  customStyle={{
                    borderRadius: '8px',
                    padding: '15px',
                    fontSize: '0.95em',
                    lineHeight: '1.5',
                    margin: '15px 0'
                  }}
                >
                  {element.code}
                </SyntaxHighlighter>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
