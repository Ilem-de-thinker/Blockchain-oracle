import React from 'react';
import { QuizResult, Quiz } from '../../src/api/quizzes';

interface QuizResultsProps {
  quiz: Quiz;
  result: QuizResult;
  onBack: () => void;
  onRetake?: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ quiz, result, onBack, onRetake }) => {
  const score = parseFloat(result.score);
  const passed = result.is_passed ?? score >= 60;

  const getScoreColor = () => {
    if (score >= 80) return 'from-emerald-500 to-teal-500';
    if (score >= 60) return 'from-blue-500 to-indigo-500';
    if (score >= 50) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreMessage = () => {
    if (score >= 90) return 'Outstanding! 🎉';
    if (score >= 80) return 'Excellent work! 👏';
    if (score >= 70) return 'Great job! 👍';
    if (score >= 60) return 'Good effort! 💪';
    if (score >= 60) return 'You passed! ✅';
    return 'Keep studying! 📚';
  };

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Score Header */}
        <div className={`bg-gradient-to-r ${getScoreColor()} rounded-2xl p-8 text-white mb-6 text-center shadow-xl`}>
          <div className="mb-4">
            <i className="fas fa-trophy text-5xl opacity-30"></i>
          </div>
          <h1 className="text-3xl font-black mb-2">Quiz Complete!</h1>
          <p className="text-lg opacity-90 mb-6">{getScoreMessage()}</p>
          
          {/* Score Circle */}
          <div className="inline-flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - score / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">{score.toFixed(1)}%</span>
                <span className="text-sm opacity-75">Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Info */}
        <div className="bg-surface rounded-xl border border-border p-6 mb-6">
          <h2 className="text-xl font-bold text-text mb-2">{quiz.title}</h2>
          <p className="text-sm text-text-secondary mb-4">{quiz.description}</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-bg rounded-lg">
              <p className="text-xs text-text-muted mb-1">Completed At</p>
              <p className="text-sm font-semibold text-text">
                {new Date(result.completed_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div className="p-4 bg-bg rounded-lg">
              <p className="text-xs text-text-muted mb-1">Status</p>
              <p className={`text-sm font-semibold ${passed ? 'text-emerald-600' : 'text-red-600'}`}>
                <i className={`fas ${passed ? 'fa-check-circle' : 'fa-times-circle'} mr-1`}></i>
                {passed ? 'Passed' : 'Not Passed'}
              </p>
            </div>
          </div>
        </div>

        {/* Message for failing scores */}
        {!passed && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <i className="fas fa-info-circle text-amber-600 text-xl mt-0.5"></i>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Don't Give Up!</h3>
                <p className="text-sm text-amber-800">
                  You need 60% to pass this quiz and unlock the next module. Review the course materials and try again when ready.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success message */}
        {passed && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <i className="fas fa-check-circle text-emerald-600 text-xl mt-0.5"></i>
              <div>
                <h3 className="font-bold text-emerald-900 mb-2">Congratulations!</h3>
                <p className="text-sm text-emerald-800">
                  You've successfully completed this quiz attempt. Your module progression has been updated.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          {onRetake && (
            <button
              onClick={onRetake}
              className="w-full px-6 py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
            >
              <i className="fas fa-redo mr-2"></i>
              Retake Quiz
            </button>
          )}
          <button
            onClick={onBack}
            className="w-full px-6 py-4 bg-surface border border-border text-text font-black uppercase tracking-widest text-xs rounded-xl hover:bg-surface-alt transition-all active:scale-95"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Module
          </button>
        </div>
      </div>
    </div>
  );
};
