import React, { useState } from 'react';

export default function QuizModal({ quizData, onClose, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleOptionSelect = (index) => {
    if (showExplanation) {
      return;
    }

    setSelectedOption(index);
    setShowExplanation(true);
    if (index === quizData[currentQuestion].correctAnswer) {
      setScore((previous) => previous + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="modal-overlay">
        <div className="card modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px' }}>Quiz finished</h2>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>
            {score === quizData.length ? 'A+' : 'Nice'}
          </div>
          <p style={{ marginBottom: '24px', fontSize: '1.1rem' }}>
            Your score: <strong>{score} / {quizData.length}</strong>
          </p>
          <button className="export-btn" onClick={() => onComplete(score)} style={{ width: '100%' }}>
            Close quiz
          </button>
        </div>
      </div>
    );
  }

  const question = quizData[currentQuestion];

  return (
    <div className="modal-overlay">
      <div className="card modal-content" style={{ maxWidth: '500px' }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-title">Concept Check ({currentQuestion + 1}/{quizData.length})</span>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>x</button>
        </div>

        <div className="quiz-body" style={{ padding: '20px 0' }}>
          <h3 style={{ marginBottom: '20px', lineHeight: '1.4' }}>{question.question}</h3>

          <div className="quiz-options" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.options.map((option, idx) => {
              let bgColor = 'var(--surface-color)';
              let borderColor = 'var(--border-color)';

              if (showExplanation) {
                if (idx === question.correctAnswer) {
                  bgColor = 'rgba(16, 185, 129, 0.1)';
                  borderColor = '#10b981';
                } else if (idx === selectedOption) {
                  bgColor = 'rgba(239, 68, 68, 0.1)';
                  borderColor = '#ef4444';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    cursor: showExplanation ? 'default' : 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.95rem'
                  }}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', background: 'var(--accent-subtle)', border: '1px solid var(--primary-light)' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '8px', color: selectedOption === question.correctAnswer ? '#10b981' : '#ef4444' }}>
                {selectedOption === question.correctAnswer ? 'Correct' : 'Incorrect'}
              </p>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{question.explanation}</p>
              <button
                className="export-btn"
                onClick={handleNext}
                style={{ marginTop: '16px', width: '100%', background: 'var(--primary)', color: 'white' }}
              >
                {currentQuestion < quizData.length - 1 ? 'Next question' : 'See results'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
