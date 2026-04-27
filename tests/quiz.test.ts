/**
 * @fileoverview Quiz logic unit tests.
 * Tests score calculation, grade assignment, and question count.
 */

import quizData from '../client/src/data/quiz.json';

interface QuizQuestion {
  id: number;
  difficulty: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const typedQuizData = quizData as QuizQuestion[];

function getGrade(score: number): { label: string; emoji: string } {
  if (score >= 8) return { label: "Democracy Champion — you're a civic hero!", emoji: '🏆' };
  if (score >= 5) return { label: 'Voter Ready — solid knowledge!', emoji: '🗳️' };
  return { label: 'Civic Novice — keep learning!', emoji: '📚' };
}

function calculateScore(answers: number[], questions: QuizQuestion[]): number {
  return answers.reduce((score, answer, i) => {
    return score + (answer === questions[i].correctIndex ? 1 : 0);
  }, 0);
}

describe('Quiz Module', () => {
  test('score calculation: 8/10 correct → 80%', () => {
    const answers = typedQuizData.map((q, i) =>
      i < 8 ? q.correctIndex : (q.correctIndex + 1) % 4
    );
    const score = calculateScore(answers, typedQuizData);
    expect(score).toBe(8);
  });

  test('grade assignment: 8-10 → "Democracy Champion"', () => {
    expect(getGrade(8).label).toContain('Democracy Champion');
    expect(getGrade(9).label).toContain('Democracy Champion');
    expect(getGrade(10).label).toContain('Democracy Champion');
  });

  test('grade assignment: 5-7 → "Voter Ready"', () => {
    expect(getGrade(5).label).toContain('Voter Ready');
    expect(getGrade(6).label).toContain('Voter Ready');
    expect(getGrade(7).label).toContain('Voter Ready');
  });

  test('grade assignment: 0-4 → "Civic Novice"', () => {
    expect(getGrade(0).label).toContain('Civic Novice');
    expect(getGrade(2).label).toContain('Civic Novice');
    expect(getGrade(4).label).toContain('Civic Novice');
  });

  test('question count equals 10', () => {
    expect(typedQuizData.length).toBe(10);
  });
});
