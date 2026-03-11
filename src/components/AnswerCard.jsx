import React, { useState } from 'react';
import FormattedResponseRenderer from './FormattedResponseRenderer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QuizModal from './QuizModal';

export default function AnswerCard({
  answer,
  toggleFavorite,
  question,
  favorites,
  showToast,
  generateQuiz
}) {
  const [copied, setCopied] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Copy answer to clipboard
  const copyToClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(answer);
      } else {
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

  const handleStartQuiz = async () => {
    setQuizLoading(true);
    const data = await generateQuiz(question, answer);
    setQuizLoading(false);
    if (data) {
      setQuizData(data);
      setShowQuiz(true);
    }
  };

  const onQuizComplete = (score) => {
    setShowQuiz(false);
    // You could add logic here to reward XP based on score
  };

  if (!answer) return null;

  return (
    <div className="card result-wrapper">
      <div className="card-header">
        <span className="card-title">Answer</span>
      </div>
      <div className="result-actions">
        <button
          className="copy-btn"
          onClick={copyToClipboard}
          aria-label="Copy answer to clipboard"
        >
          {copied ? '✅ Copied!' : '📋 Copy'}
        </button>
        <button className="export-btn" onClick={exportAsPDF}>
          📥 PDF
        </button>
        <button className="export-btn" onClick={exportAsMarkdown}>
          📄 Markdown
        </button>
        <button 
          className="export-btn" 
          onClick={handleStartQuiz} 
          disabled={quizLoading}
          style={{ background: 'var(--accent-subtle)', color: 'var(--primary)' }}
        >
          {quizLoading ? '⏳ Loading...' : '🎓 Test Knowledge'}
        </button>
        <button
          className="heart-btn-main"
          onClick={() => toggleFavorite(question)}
        >
          {favorites.includes(question) ? '❤️ Favorited' : '🤍 Favorite'}
        </button>
      </div>
      <div className="result">
        <FormattedResponseRenderer content={answer} />
      </div>

      {showQuiz && quizData && (
        <QuizModal 
          quizData={quizData} 
          onClose={() => setShowQuiz(false)} 
          onComplete={onQuizComplete}
        />
      )}
    </div>
  );
}
