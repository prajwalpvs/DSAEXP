import { useState, useEffect } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './App.css';

// Get the API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

// Gemini API endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
  
  // Search history and favorites
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('questionHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  // UI states
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  // Show toast notification
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  // Save to history
  const saveToHistory = (q, a) => {
    const newEntry = {
      id: Date.now(),
      question: q,
      answer: a,
      timestamp: new Date().toLocaleString()
    };
    
    const updated = [newEntry, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('questionHistory', JSON.stringify(updated));
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

  // Copy answer to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(answer).then(() => {
      setCopied(true);
      showToast('✅ Answer copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    });
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
  // This prompt tells Gemini how to answer questions like a teacher for beginners
  const buildSystemPrompt = () => {
    return `You are an expert teacher explaining DSA and LeetCode problems to complete beginners.

Important instructions:
1. Use simple, easy-to-understand language. Avoid jargon when possible.
2. Break down the concept step-by-step.
3. Always provide at least one Python code example that is clear and well-commented.
4. Include a simple ASCII diagram or text visualization when it helps explain the concept.
5. Format your response with clear headings and bullet points.
6. Start with a simple explanation, then go deeper.

Format your answer like this:
- A brief simple explanation (1-2 sentences)
- Step-by-step breakdown (numbered or bulleted)
- A Python code example (wrap in triple backticks: \`\`\`python)
- A simple diagram or visualization when helpful
- Key takeaways or tips`;
  };

  // ============================================
  // SEND REQUEST TO GEMINI API
  // ============================================
  const handleGenerateClick = async () => {
    // Validate: Check if the user entered a question
    if (!question.trim()) {
      setError('Please enter a DSA or LeetCode question.');
      return;
    }

    // Validate: Check if the API key was set
    if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE') {
      setError(
        '⚠️ API Key not configured. Please create a .env file in your project root and add: VITE_GEMINI_API_KEY=your_actual_api_key'
      );
      return;
    }

    // Clear previous results and errors
    setError('');
    setAnswer('');

    // Show loading message
    setLoading(true);

    try {
      // Build the prompt that tells Gemini how to answer
      const systemPrompt = buildSystemPrompt();
      const fullPrompt = systemPrompt + '\n\nUser Question: ' + question;

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

      // Make the fetch request to the Gemini API
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `API Error ${response.status}: ${errorData.error?.message || 'Unknown error'}`
        );
      }

      // Parse the response JSON
      const responseData = await response.json();

      // Extract the text from the API response
      const assistantAnswer = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!assistantAnswer) {
        throw new Error('No response received from the API.');
      }

      // Display the answer
      setAnswer(assistantAnswer);
      
      // Save to history
      saveToHistory(question, assistantAnswer);
    } catch (err) {
      // Handle any errors that occurred during the API call
      console.error('Error:', err);
      setError(
        `❌ Error: ${err.message}\n\nMake sure your API key is correct and you have internet connection.`
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
              onClick={() => setShowHistory(!showHistory)}
            >
              📚 History ({history.length})
            </button>
            <button 
              className="favorites-btn"
              onClick={() => setShowHistory(false)}
            >
              ❤️ Favorites ({favorites.length})
            </button>
          </div>
        </div>

        <p className="subtitle">Ask any DSA or LeetCode question, and get a beginner-friendly explanation</p>

        {/* History Dropdown */}
        {showHistory && history.length > 0 && (
          <div className="history-dropdown">
            <h3>📜 Recent Questions</h3>
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

        {/* Sample Questions Section */}
        <div className="samples-section">
          <p>💡 Try these popular questions:</p>
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

        {/* Input Section */}
        <div className="input-section">
          <label htmlFor="question">Your Question:</label>
          <textarea
            id="question"
            placeholder="Example: Explain binary search with a Python example..."
            rows="5"
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
              <button className="copy-btn" onClick={copyToClipboard}>
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
              <MarkdownRenderer content={answer} />
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
// MARKDOWN RENDERER COMPONENT WITH SYNTAX HIGHLIGHTING
// ============================================
// This component converts markdown-style text to styled React elements
function MarkdownRenderer({ content }) {
  const lines = content.split('\n');
  const elements = [];
  let codeBlock = '';
  let codeLanguage = '';
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    // Check if this line starts a code block
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block - render with syntax highlighting
        inCodeBlock = false;
        elements.push(
          <div key={`code-${index}`} className="code-container">
            <SyntaxHighlighter 
              language={codeLanguage || 'python'} 
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
              {codeBlock.trim()}
            </SyntaxHighlighter>
          </div>
        );
        codeBlock = '';
        codeLanguage = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLanguage = line.replace('```', '').trim() || 'python';
      }
      return;
    }

    // If we're inside a code block, accumulate the code
    if (inCodeBlock) {
      codeBlock += line + '\n';
      return;
    }

    // Handle headings (markdown style)
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`}>{line.replace('### ', '')}</h3>
      );
      return;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${index}`}>{line.replace('## ', '')}</h2>
      );
      return;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${index}`}>{line.replace('# ', '')}</h1>
      );
      return;
    }

    // Handle bullet points
    if (line.startsWith('- ')) {
      elements.push(
        <li key={`li-${index}`}>{line.replace('- ', '')}</li>
      );
      return;
    }

    // Handle numbered lists
    if (/^\d+\. /.test(line)) {
      elements.push(
        <li key={`li-${index}`}>{line.replace(/^\d+\. /, '')}</li>
      );
      return;
    }

    // Handle regular paragraphs
    if (line.trim()) {
      elements.push(
        <p key={`p-${index}`}>{line}</p>
      );
    }
  });

  // If there's an unclosed code block, close it
  if (inCodeBlock && codeBlock) {
    elements.push(
      <div key="code-final" className="code-container">
        <SyntaxHighlighter 
          language={codeLanguage || 'python'} 
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
          {codeBlock.trim()}
        </SyntaxHighlighter>
      </div>
    );
  }

  return <>{elements}</>;
}
