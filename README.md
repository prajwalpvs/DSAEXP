# DSA Helper React

A React + Vite study app for learning data structures, algorithms, and common LeetCode patterns with Gemini-powered explanations.

## What the app does

- Ask DSA or LeetCode questions in plain English.
- Generate structured explanations with code examples.
- Save recent prompts and favorite questions locally.
- Switch explanation difficulty and preferred code language.
- Export answers as PDF or Markdown.
- Generate short concept-check quizzes from the current answer.
- Track lightweight study progress such as XP, streaks, badges, and curriculum progress in local storage.

## Tech stack

- React 18
- Vite 5
- Google Gemini API
- `react-markdown` + `remark-gfm` + `rehype-raw`
- `react-syntax-highlighter`
- `jspdf`
- `html2canvas`

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Gemini API key

Create a `.env` file in the project root:

```bash
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

The app reads the key from `import.meta.env.VITE_GEMINI_API_KEY`.

### 3. Run the app locally

```bash
npm run dev
```

Vite will print the local URL in the terminal, usually:

```text
http://localhost:5173
```

## Available scripts

```bash
npm run dev
npm run build
npm run preview
```

- `npm run dev`: start the local development server
- `npm run build`: create a production build in `dist/`
- `npm run preview`: preview the production build locally

## Project structure

```text
dsa-helper-react/
├── public/
├── src/
│   ├── components/
│   │   ├── AnswerCard.jsx
│   │   ├── ChatInput.jsx
│   │   ├── FormattedResponseRenderer.jsx
│   │   ├── Header.jsx
│   │   ├── QuizModal.jsx
│   │   └── Sidebar.jsx
│   ├── hooks/
│   │   ├── useAppState.js
│   │   ├── useGamification.js
│   │   ├── useGeminiAPI.js
│   │   └── useLocalStorage.js
│   ├── utils/
│   │   └── constants.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── docs/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Main features

### AI explanation flow

- Sends study prompts to Gemini.
- Supports streamed answer rendering.
- Shows syntax-highlighted code blocks.
- Renders markdown-style explanations in a readable answer card.

### Study workflow

- Trending sample prompts for quick testing.
- Question history and favorites stored in local storage.
- Difficulty selection for beginner, intermediate, and advanced explanations.
- Language selection for code examples.

### Review and retention

- Quiz generation from the current answer.
- Export to PDF and Markdown.
- Curriculum sidebar for practice-by-topic flow.
- Basic gamification with XP, streaks, and badge milestones.

## Environment notes

- This project is a client-side app, so the Gemini key is injected at build/dev time through Vite.
- For a production-grade deployment, move Gemini calls behind a backend so the API key is not exposed to the browser.

## Troubleshooting

### API key not configured

- Confirm `.env` exists in the project root.
- Confirm the variable name is exactly `VITE_GEMINI_API_KEY`.
- Restart the dev server after editing `.env`.

### Port already in use

- Vite will usually move to the next available port automatically.
- Check the terminal output for the actual local URL.

### Build issues on Windows or OneDrive

- If Vite or esbuild fails to refresh cache files, stop the dev server and run the command again.
- In some locked-down environments, you may need elevated permissions for `npm run dev` or `npm run build`.

## Example prompts

```text
Explain binary search in simple words with a step-by-step example and Python code.
```

```text
Explain the Two Sum problem for a beginner and compare the brute-force and hash map approaches.
```

```text
How do I detect a cycle in a linked list? Include intuition, complexity, and code.
```

## Future improvements

- Move Gemini requests to a backend service.
- Split large client bundles for faster first load.
- Add tests for core hooks and renderer behavior.
- Add persistent curriculum milestones beyond local storage.
