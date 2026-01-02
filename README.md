# 🧠 DSA / LeetCode Helper - React App

A beautiful, beginner-friendly web app that helps you understand **Data Structures & Algorithms** and **LeetCode problems** using the **Google Gemini AI API**.

**Live Preview:** Type any DSA question → Get instant, beginner-friendly explanations with Python code examples!

## ✨ Features

✅ **Beautiful UI** - Modern gradient background with smooth animations  
✅ **Simple Questions** - Type any DSA or LeetCode question  
✅ **AI Explanations** - Get beginner-friendly answers from Google Gemini  
✅ **Code Examples** - Syntax-highlighted Python code examples  
✅ **Step-by-Step Breakdown** - Clear, sequential explanations  
✅ **Responsive Design** - Works perfectly on desktop and mobile  
✅ **Loading Animations** - Professional spinner during API calls  
✅ **Error Handling** - Helpful error messages if something goes wrong  

## 🎨 Design Highlights

- **Gradient Background**: Purple-to-blue modern gradient
- **Smooth Animations**: Fade-in effects, button ripple animations, loading spinner
- **Professional Card Layout**: Centered, rounded container with shadow
- **Accessible**: High contrast colors, clear typography
- **Mobile-Optimized**: Responsive breakpoints for all screen sizes
✅ **Diagrams** - ASCII diagrams when helpful  

## Tech Stack

- **React** - Frontend library
- **Vite** - Fast build tool
- **Gemini API** - AI explanations
- **CSS3** - Modern styling

## Setup Instructions

### Part 1: Create and Run the React App Locally

#### Step 1: Create the React Project

Open **PowerShell** or **Command Prompt** and run:

```bash
npm create vite@latest dsa-helper-react -- --template react
cd dsa-helper-react
npm install
```

#### Step 2: Add Your Files

1. Open the `dsa-helper-react` folder in VS Code:
   ```
   File → Open Folder → Select dsa-helper-react
   ```

2. Replace the following files with the code provided:
   - `src/App.jsx` - Main React component
   - `src/App.css` - Styling
   - `index.html` - HTML structure
   - `vite.config.js` - Vite configuration

3. Create these new files:
   - `.env.example` - Template for environment variables
   - `.gitignore` - Git configuration

#### Step 3: Set Up Your Gemini API Key

**IMPORTANT: Using Environment Variables for Security**

1. Get your free API key from [https://ai.google.dev/](https://ai.google.dev/)
   - Click "Get API Key"
   - Sign in with Google
   - Copy your API key

2. In the `dsa-helper-react` folder, create a new file called `.env` (not `.env.example`):
   ```
   VITE_GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```
   Replace `YOUR_ACTUAL_API_KEY_HERE` with your real API key.

3. **NEVER commit the `.env` file to GitHub!** It's already in `.gitignore`, so Git will ignore it.

#### Step 4: Run the App

In the terminal (inside the `dsa-helper-react` folder), run:

```bash
npm run dev
```

You'll see output like:
```
  VITE v5.0.8  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

**Open http://localhost:5173 in your browser** and you're done! 🎉

### Part 2: Push to GitHub

#### Step 1: Create a New Repository on GitHub

1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name**: `dsa-helper-react`
3. **Description**: "DSA / LeetCode helper app using React and Gemini API"
4. Select **Public** (so others can see it)
5. **DO NOT** check "Initialize this repository with a README"
6. Click **Create repository**

#### Step 2: Push Your Code to GitHub

In your terminal (inside the `dsa-helper-react` folder):

```bash
git init
git add .
git commit -m "Initial commit: DSA helper React app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dsa-helper-react.git
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username.

#### Step 3: Verify on GitHub

1. Go to https://github.com/YOUR_USERNAME/dsa-helper-react
2. You should see all your files (except `.env`!)
3. Check that `.gitignore` is working - you should NOT see:
   - `node_modules` folder
   - `.env` file
   - `dist` folder

### Part 3: Clone and Run on Another Machine

If you want to clone this repo on another computer:

```bash
git clone https://github.com/YOUR_USERNAME/dsa-helper-react.git
cd dsa-helper-react
npm install
```

Then create your `.env` file with your API key:
```
VITE_GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

Then run:
```bash
npm run dev
```

## Why API Keys in JavaScript Code Aren't Safe

### ❌ NOT SAFE (Don't do this):
```javascript
const GEMINI_API_KEY = "AIzaSy...abc123...";  // EXPOSED to everyone!
```

**Why it's bad:**
- Anyone can open "Inspect → Sources" in the browser and see your key
- Attackers can steal your key and use it to make expensive API calls
- You can't revoke it without breaking the app

### ✅ SAFE (What we do):
```javascript
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;  // From .env file
```

**Why it's better:**
- Your API key stays in a `.env` file (not in Git)
- The key is only on your machine and your server
- Users can't see it in the browser
- You can safely share your code on GitHub

### 🔐 For Real Production Apps:
- Keep the API key on a **backend server** (Node.js, Python, etc.)
- Frontend sends questions to your backend
- Backend sends questions to Gemini, gets the answer, sends it back
- This way, your API key is completely hidden

## Test Prompts

Try these questions to test your app:

### Prompt 1: Binary Search
```
Explain binary search in simple words with a step-by-step example and Python code.
```

### Prompt 2: Two Sum LeetCode Problem
```
Explain the Two Sum LeetCode problem for a beginner. Show a simple solution with Python code and explain the approach.
```

### Prompt 3: Floyd's Cycle Detection
```
Explain how to detect a cycle in a linked list using Floyd's cycle detection algorithm. Include a simple diagram and Python code.
```

## Project Structure

```
dsa-helper-react/
├── src/
│   ├── App.jsx           # Main React component
│   ├── App.css           # Styling
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles
├── public/               # Static files
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite config
├── .env.example          # Example environment variables
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## Next Steps

1. ✅ Create the app
2. ✅ Add your API key to `.env`
3. ✅ Run with `npm run dev`
4. ✅ Test with sample prompts
5. ✅ Push to GitHub
6. ✅ Share with friends!

## Troubleshooting

**"API Key not configured" error?**
- Make sure you created `.env` file (not `.env.example`)
- Add your real API key: `VITE_GEMINI_API_KEY=your_key_here`
- Restart the dev server: Stop it (Ctrl+C) and run `npm run dev` again

**"Command not found: npm"?**
- Make sure you installed Node.js from [nodejs.org](https://nodejs.org)

**Port 5173 already in use?**
- Vite will automatically use the next available port
- Check the terminal output for the actual URL

## Learn More

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Google Gemini API](https://ai.google.dev)
- [JavaScript Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

Happy learning! 🚀
