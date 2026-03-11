import { useState } from 'react';
import { GEMINI_API_KEY, GEMINI_API_URL, API_REQUEST_TIMEOUT, API_RATE_LIMIT_MS } from '../utils/constants';

export function useGeminiAPI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [lastApiCall, setLastApiCall] = useState(0);

  const generateAnswer = async (question, difficulty, language = 'python') => {
    // Validate API key
    if (GEMINI_API_KEY === 'YOUR_API_KEY_HERE' || !GEMINI_API_KEY) {
      setError('⚠️ API Key not configured. Please create a .env file and add VITE_GEMINI_API_KEY.');
      return null;
    }

    // Rate limit
    const now = Date.now();
    if (now - lastApiCall < API_RATE_LIMIT_MS) {
      setError('⏳ Please wait a moment before making another request.');
      return null;
    }
    setLastApiCall(now);

    setError('');
    setAnswer('');
    setLoading(true);

    try {
      const difficultyGuides = {
        beginner: `Use very simple language. Avoid jargon. Use analogies with everyday objects.`,
        intermediate: `Explain technical details. Include complexity analysis (Big O). Discuss trade-offs.`,
        advanced: `Include optimization techniques. Discuss edge cases. Compare different approaches.`
      };

      const capitalizedLanguage = language.charAt(0).toUpperCase() + language.slice(1);
      const systemPrompt = `You are an expert teacher explaining DSA and LeetCode problems. 
Difficulty level: ${difficulty.toUpperCase()} - ${difficultyGuides[difficulty] || difficultyGuides.beginner}

Important instructions:
1. Match the difficulty level above.
2. Always provide ${capitalizedLanguage} code examples that are clear and well-commented.
3. VISUAL AID REQUIREMENT: If the concept is visual (Trees, Graphs, Sorting, Arrays, Linked Lists), you MUST provide a professional SVG diagram.
4. SVG DIAGRAM RULES:
   - Use a simple, clean, modern style.
   - Set max-width to "100%" and height to "auto".
   - Use high-contrast colors suitable for both light and dark backgrounds (or use "currentColor").
   - Ensure nodes, labels, and arrows are clearly visible.
   - Wrap the SVG in its own block (not inside markdown triple backticks).
5. Format with clear headings and bullet points.
6. Add Big O complexity analysis (Time & Space).

Format your answer:
- Brief explanation
- SVG Diagram (if applicable)
- Step-by-step breakdown
- ${capitalizedLanguage} code example (wrap in \`\`\`${language.toLowerCase()})
- Complexity Analysis (Time & Space)
- Key tips and edge cases`;

      const fullPrompt = systemPrompt + '\n\nUser Question: ' + question;

      const requestBody = {
        contents: [{ parts: [{ text: fullPrompt }] }]
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT);

      const response = await fetch(`${GEMINI_API_URL}?alt=sse&key=${encodeURIComponent(GEMINI_API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Unknown error';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error?.message || errorData.error?.code || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        throw new Error(`API Error ${response.status}: ${errorMessage}`);
      }

      setLoading(false); // Stop asking the system to show 'loading', since we have the first byte.
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let streamedAnswer = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkString = decoder.decode(value, { stream: true });
          const lines = chunkString.split('\n').filter((line) => line.trim() !== '');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.replace('data: ', '');
              try {
                const parsedData = JSON.parse(data);
                const textChunk = parsedData.candidates?.[0]?.content?.parts?.[0]?.text;
                if (textChunk) {
                    streamedAnswer += textChunk;
                    setAnswer(streamedAnswer);
                }
              } catch (e) {
                // Not a valid JSON chunk, might just be standard event structure data
                console.warn('Could not parse Gemini chunk string:', data);
              }
            }
          }
        }
      }

      return streamedAnswer;
    } catch (err) {
      console.error('API Error:', err);
      if (err.name === 'AbortError') {
        setError(`Request timeout (${API_REQUEST_TIMEOUT / 1000}s). The API took too long to respond. Please try again.`);
      } else {
        setError(`❌ Error: ${err.message}\n\nPlease check your API key and try again.`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateQuiz = async (topic, solutionText) => {
    setLoading(true);
    setError('');
    try {
      const prompt = `Based on the following DSA solution for "${topic}", generate 3 multiple-choice questions to test the user's understanding of the time/space complexity and core logic.
      
      Solution Content:
      ${solutionText.substring(0, 1500)}

      Return ONLY a valid JSON array of objects with this structure:
      [
        {
          "question": "The question text",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0, // index of correct option
          "explanation": "Brief explanation of why this is correct"
        }
      ]`;

      const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          response_mime_type: "application/json",
        }
      };

      // Use the standard non-streaming URL for quiz generation (simpler to parse JSON)
      const nonStreamingUrl = GEMINI_API_URL.replace('streamGenerateContent', 'generateContent');
      
      const response = await fetch(`${nonStreamingUrl}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to generate quiz');

      const data = await response.json();
      const quizJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return JSON.parse(quizJson);
    } catch (err) {
      console.error('Quiz Error:', err);
      setError('Failed to generate quiz. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generateAnswer, generateQuiz, answer, setAnswer, loading, error, setError };
}
