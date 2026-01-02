import { useState, useEffect } from 'react';
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

  lines.forEach((line, index) => {
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

// Sample questions for quick access
const SAMPLE_QUESTIONS = [
  { text: "Explain binary search with example", emoji: "🔍" },
  { text: "What is a hash table and when to use it", emoji: "🗂️" },
  { text: "Explain recursion simply with Python code", emoji: "🔄" },
  { text: "What is dynamic programming (DP)?", emoji: "📊" },
  { text: "Detect cycle in linked list - Floyd's algorithm", emoji: "🔗" }
];

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
  const [toastTimeout, setToastTimeout] = useState(null);
  const [lastApiCall, setLastApiCall] = useState(0);
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
      localStorage.removeItem('questionHistory');
      showToast('🗑️ History cleared');
      setShowHistory(false);
    }
  };

  // Toggle favorite
  const toggleFavorite = (q) => {
    if (favorites.includes(q)) {
      const updated = favorites.filter(fav => fav !== q);
      setFavorites(updated);
      localStorage.setItem('favorites', JSON.stringify(updated));
    } else {
      const updated = [...favorites, q];
      setFavorites(updated);
      localStorage.setItem('favorites', JSON.stringify(updated));
    }
  };

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
  const exportAsMarkdown = () => {
    const content = `# ${question}\n\n${answer}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-answer-${Date.now()}.md`;
    a.click();
    showToast('📄 Markdown file downloaded!');
  };

  // Load from history
  const loadFromHistory = (q, a) => {
    setQuestion(q);
    setAnswer(a);
    setShowHistory(false);
  };

  // BUILD THE SYSTEM PROMPT
  // ============================================
  // This prompt tells Gemini how to answer questions based on difficulty level
  const buildSystemPrompt = () => {
    const difficultyGuides = {
      beginner: `Use very simple language. Avoid jargon. Use analogies with everyday objects.`,
      intermediate: `Explain technical details. Include complexity analysis (Big O). Discuss trade-offs.`,
      advanced: `Include optimization techniques. Discuss edge cases. Compare different approaches.`
    };

    return `You are an expert teacher explaining DSA and LeetCode problems. 
Difficulty level: ${difficulty.toUpperCase()} - ${difficultyGuides[difficulty]}

Important instructions:
1. Match the difficulty level above.
2. Always provide Python code examples that are clear and well-commented.
3. Include a simple ASCII diagram when helpful.
4. Format with clear headings and bullet points.
5. Add Big O complexity analysis (Time & Space).

Format your answer:
- Brief explanation
- Step-by-step breakdown
- Python code example (wrap in \`\`\`python)
- Complexity Analysis (Time & Space)
- Key tips and edge cases`;
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
            `Request timeout (${API_REQUEST_TIMEOUT / 1000}s). The API took too long to respond. Please try again.`
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
        `❌ Error: ${err.message}\n\nPlease check your API key and try again.`
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
              onClick={() => {setShowHistory(!showHistory); setShowFavorites(false);}}
            >
              📚 History ({history.length})
            </button>
            <button 
              className="favorites-btn"
              onClick={() => {setShowFavorites(!showFavorites); setShowHistory(false);}}
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
              {favorites.map((fav, idx) => (
                <div key={idx} className="favorite-item">
                  <div className="favorite-content" onClick={() => {setQuestion(fav); setShowFavorites(false);}}>
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

        {/* Sample Questions Section */}
        <div className="samples-section">
          <p>🦁 🌿 Try these popular questions: 🦁 🌿</p>
          <div className="samples-grid">
            {SAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                className="sample-btn"
                onClick={() => setQuestion(q.text)}
              >
                <span className="emoji">{q.emoji}</span>
                <span>{q.text}</span>
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
            <p style={{fontSize: '0.9em', margin: 0}}>Save questions to history and build your personal learning library.</p>
          </div>
          <div className="section-card card-favorites">
            <div className="section-title">
              <span className="section-icon">❤️</span>
              Favorites
            </div>
            <p style={{fontSize: '0.9em', margin: 0}}>Star your favorite questions for quick access later.</p>
          </div>
          <div className="section-card card-input">
            <div className="section-title">
              <span className="section-icon">🎯</span>
              Ask Anything
            </div>
            <p style={{fontSize: '0.9em', margin: 0}}>Choose your difficulty level for better explanations.</p>
          </div>
          <div className="section-card card-result">
            <div className="section-title">
              <span className="section-icon">🚀</span>
              Export
            </div>
            <p style={{fontSize: '0.9em', margin: 0}}>Download answers as PDF or Markdown files.</p>
          </div>
        </div>

        {/* Input Section */}
        <div className="input-section">
          <label htmlFor="question">🦒 Your Question: 🦒</label>
          <textarea
            id="question"
            placeholder="🐢 Example: Explain binary search with a Python example... 🐢"            aria-label="Enter your DSA or LeetCode question"            rows="5"
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
