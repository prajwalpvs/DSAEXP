import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import FormattedResponseRenderer from './FormattedResponseRenderer';
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
      showToast('Answer copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Failed to copy. Try again.');
      console.error('Clipboard error:', err);
    }
  };

  const exportAsPDF = async () => {
    try {
      const element = document.querySelector('.result');
      if (!element) {
        return;
      }

      const canvas = await html2canvas(element);
      const pdf = new jsPDF();
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`dsa-answer-${Date.now()}.pdf`);
      showToast('PDF downloaded successfully.');
    } catch (err) {
      showToast('Error exporting PDF.');
      console.error(err);
    }
  };

  const exportAsMarkdown = () => {
    const content = `# ${question}\n\n${answer}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dsa-answer-${Date.now()}.md`;
    anchor.click();
    showToast('Markdown file downloaded.');
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

  if (!answer) {
    return null;
  }

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
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button className="export-btn" onClick={exportAsPDF}>
          PDF
        </button>
        <button className="export-btn" onClick={exportAsMarkdown}>
          Markdown
        </button>
        <button
          className="export-btn quiz-action-btn"
          onClick={handleStartQuiz}
          disabled={quizLoading}
        >
          {quizLoading ? 'Preparing quiz...' : 'Test knowledge'}
        </button>
        <button
          className="heart-btn-main"
          onClick={() => toggleFavorite(question)}
        >
          {favorites.includes(question) ? 'Saved to favorites' : 'Save to favorites'}
        </button>
      </div>
      <div className="result">
        <FormattedResponseRenderer content={answer} />
      </div>

      {showQuiz && quizData && (
        <QuizModal
          quizData={quizData}
          onClose={() => setShowQuiz(false)}
          onComplete={() => setShowQuiz(false)}
        />
      )}
    </div>
  );
}
