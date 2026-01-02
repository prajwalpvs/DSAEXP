import { useState } from 'react';
import './App.css';

// Get the API key from environment variables
// In development, use the .env file in the project root
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

// Gemini API endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export default function App() {
  // State to store the user's question
  const [question, setQuestion] = useState('');
  
  // State to store the API response/answer
  const [answer, setAnswer] = useState('');
  
  // State to track if we're loading (waiting for API response)
  const [loading, setLoading] = useState(false);
  
  // State to store any error messages
  const [error, setError] = useState('');

  // ============================================
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
    <div className="container">
      {/* Header */}
      <h1>🧠 DSA / LeetCode Helper</h1>
      <p className="subtitle">Ask any DSA or LeetCode question, and get a beginner-friendly explanation</p>

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
        <button
          onClick={handleGenerateClick}
          disabled={loading}
          className="generate-btn"
        >
          {loading ? 'Generating Answer...' : 'Generate Answer'}
        </button>
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
        <div className="result">
          <MarkdownRenderer content={answer} />
        </div>
      )}
    </div>
  );
}

// ============================================
// MARKDOWN RENDERER COMPONENT
// ============================================
// This component converts markdown-style text to styled React elements
function MarkdownRenderer({ content }) {
  // Split the content by lines and process them
  const lines = content.split('\n');
  const elements = [];
  let codeBlock = '';
  let codeLanguage = '';
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    // Check if this line starts a code block
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        inCodeBlock = false;
        elements.push(
          <pre key={`code-${index}`} className={`code-block language-${codeLanguage}`}>
            <code>{codeBlock.trim()}</code>
          </pre>
        );
        codeBlock = '';
        codeLanguage = '';
      } else {
        // Start of code block
        inCodeBlock = true;
        // Extract language if specified (e.g., ```python)
        codeLanguage = line.replace('```', '').trim() || 'text';
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
      <pre key="code-final" className={`code-block language-${codeLanguage}`}>
        <code>{codeBlock.trim()}</code>
      </pre>
    );
  }

  return <>{elements}</>;
}
