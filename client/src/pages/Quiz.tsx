/**
 * @fileoverview Quiz page — 10 MCQ questions with scoring and Firebase save.
 */

import React, { useState, useEffect, useCallback } from 'react';
import quizData from '../data/quiz.json';
import { useLanguage } from '../contexts/LanguageContext';
import { trackQuizStarted, trackQuizCompleted } from '../utils/analytics';
import { auth, db, googleProvider } from '../utils/firebase';
import './Quiz.css';

interface QuizQuestion {
  id: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface GradeResult {
  label: string;
  emoji: string;
}

const typedQuizData = quizData as QuizQuestion[];

/**
 * Get grade based on score.
 * @param score - Number of correct answers.
 * @returns Object with label and emoji.
 */
export function getGrade(score: number): GradeResult {
  if (score >= 8) return { label: 'Democracy Champion — you\'re a civic hero!', emoji: '🏆' };
  if (score >= 5) return { label: 'Voter Ready — solid knowledge!', emoji: '🗳️' };
  return { label: 'Civic Novice — keep learning!', emoji: '📚' };
}

/**
 * Quiz page component.
 */
export default function Quiz(): React.JSX.Element {
  const { translate } = useLanguage();
  const [currentQ, setCurrentQ] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [finished, setFinished] = useState<boolean>(false);

  useEffect(() => {
    trackQuizStarted();
  }, []);

  const question = typedQuizData[currentQ];

  const handleSelect = useCallback((index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setShowResult(true);
    if (index === question.correctIndex) {
      setScore((prev) => prev + 1);
    }
  }, [selected, question]);

  const saveScore = async (finalScore: number): Promise<void> => {
    try {
      if (db && auth?.currentUser) {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'scores', auth.currentUser.uid), {
          score: finalScore,
          total: typedQuizData.length,
          grade: getGrade(finalScore).label,
          timestamp: new Date().toISOString(),
          userId: auth.currentUser.uid,
          displayName: auth.currentUser.displayName || 'Anonymous Voter',
        });
      }
    } catch (err) {
      console.error('Score save error:', err);
    }
  };

  const handleNext = useCallback(() => {
    if (currentQ < typedQuizData.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      const finalScore = selected === question.correctIndex ? score + 1 : score;
      setFinished(true);
      const grade = getGrade(finalScore);
      trackQuizCompleted(finalScore, grade.label);
      saveScore(finalScore).catch(() => {});
    }
  }, [currentQ, selected, score, question]);

  const handleSignIn = async (): Promise<void> => {
    try {
      if (auth && googleProvider) {
        const { signInWithPopup } = await import('firebase/auth');
        await signInWithPopup(auth, googleProvider);
        await saveScore(score);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  const handleRestart = useCallback((): void => {
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setFinished(false);
    trackQuizStarted();
  }, []);

  const handleShare = useCallback((): void => {
    const grade = getGrade(score);
    const text = `🧠 I scored ${score}/${typedQuizData.length} on VoteSchool Quiz!\n${grade.emoji} ${grade.label}\n\nTest your election knowledge:`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }, [score]);

  if (finished) {
    const grade = getGrade(score);
    return (
      <div className="quiz-page section">
        <div className="container">
          <div className="quiz-results animate-fade-in-up">
            <span className="results-emoji" aria-hidden="true">{grade.emoji}</span>
            <h1 className="results-score">{score}/{typedQuizData.length}</h1>
            <p className="results-grade">{grade.label}</p>
            <div className="results-actions">
              <button className="btn btn-primary" onClick={handleRestart} aria-label="Retake the quiz" type="button">
                🔄 Retake Quiz
              </button>
              <button className="btn btn-accent" onClick={handleShare} aria-label="Share your score" type="button">
                📲 Share Score
              </button>
            </div>
            {!auth?.currentUser && (
              <button className="btn btn-outline results-signin" onClick={handleSignIn} aria-label="Sign in with Google to save your score" type="button">
                Sign in with Google to save your score
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page section">
      <div className="container">
        <div className="section-title">
          <h1>{translate('quiz_title', 'Test Your Knowledge')}</h1>
        </div>

        <div className="quiz-progress">
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${((currentQ + 1) / typedQuizData.length) * 100}%` }} />
          </div>
          <span className="quiz-progress-text">Question {currentQ + 1} of {typedQuizData.length}</span>
        </div>

        <div className="quiz-card card animate-fade-in">
          <span className={`quiz-difficulty badge badge-${question.difficulty === 'Easy' ? 'primary' : 'accent'}`}>
            {question.difficulty}
          </span>
          <h2 className="quiz-question">{translate(`q_${question.id}`, question.question)}</h2>

          <div className="quiz-options" role="radiogroup" aria-label="Answer options">
            {question.options.map((opt, i) => {
              let cls = 'quiz-option';
              if (showResult) {
                if (i === question.correctIndex) cls += ' quiz-option--correct';
                else if (i === selected) cls += ' quiz-option--wrong';
              } else if (i === selected) {
                cls += ' quiz-option--selected';
              }

              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => handleSelect(i)}
                  disabled={showResult}
                  aria-label={`Option ${i + 1}: ${opt}`}
                  role="radio"
                  aria-checked={selected === i}
                  type="button"
                >
                  <span className="option-letter" aria-hidden="true">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="option-text">{opt}</span>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className={`quiz-explanation ${selected === question.correctIndex ? 'quiz-explanation--correct' : 'quiz-explanation--wrong'}`}>
              <span aria-hidden="true">{selected === question.correctIndex ? '✓' : '✗'}</span>
              <p>{question.explanation}</p>
            </div>
          )}

          {showResult && (
            <button className="btn btn-primary quiz-next" onClick={handleNext} aria-label={currentQ < typedQuizData.length - 1 ? 'Next question' : 'See results'} type="button">
              {currentQ < typedQuizData.length - 1 ? 'Next Question →' : 'See Results 🎉'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
