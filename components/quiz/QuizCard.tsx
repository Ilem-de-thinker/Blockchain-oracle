import React from 'react';

// Quiz Card component for quiz listing
interface QuizCardProps {
  id: number;
  title: string;
  description: string;
  questionCount?: number;
  courseTitle?: string;
  score?: string;
  completed?: boolean;
  onTakeQuiz?: () => void;
  onViewResults?: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  id,
  title,
  description,
  questionCount,
  courseTitle,
  score,
  completed = false,
  onTakeQuiz,
  onViewResults,
}) => {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-text mb-1">{title}</h3>
          {courseTitle && (
            <p className="text-xs text-emerald-600 font-semibold mb-2">
              <i className="fas fa-book mr-1"></i>
              {courseTitle}
            </p>
          )}
        </div>
        {completed && (
          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
            <i className="fas fa-check mr-1"></i>
            Completed
          </span>
        )}
      </div>

      <p className="text-sm text-text-secondary mb-4 line-clamp-2">{description}</p>

      {questionCount && (
        <div className="flex items-center gap-4 mb-4 text-xs text-text-muted">
          <span>
            <i className="fas fa-question-circle mr-1"></i>
            {questionCount} {questionCount === 1 ? 'Question' : 'Questions'}
          </span>
        </div>
      )}

      {/* Score Display (if completed) */}
      {completed && score && (
        <div className="mb-4 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-emerald-700">Your Score</span>
            <span className="text-2xl font-black text-emerald-800">{score}%</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {onTakeQuiz && !completed && (
          <button
            onClick={onTakeQuiz}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <i className="fas fa-play mr-2"></i>
            Take Quiz
          </button>
        )}
        {onViewResults && completed && (
          <button
            onClick={onViewResults}
            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-chart-bar mr-2"></i>
            View Details
          </button>
        )}
        {onTakeQuiz && completed && (
          <button
            onClick={onTakeQuiz}
            disabled
            className="flex-1 px-4 py-2 bg-gray-200 text-text-muted text-sm font-semibold rounded-lg cursor-not-allowed"
          >
            <i className="fas fa-check-circle mr-2"></i>
            Already Completed
          </button>
        )}
      </div>
    </div>
  );
};
