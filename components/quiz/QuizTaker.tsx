import React, { useState } from 'react';
import { Quiz, QuizAnswer } from '../../src/api/quizzes';

interface QuizTakerProps {
  quiz: Quiz;
  onSubmit: (answers: QuizAnswer[]) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({
  quiz,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const selectedOption = answers.get(currentQuestion?.id);

  const handleSelectOption = (optionId: number) => {
    if (!currentQuestion) return;
    setAnswers(new Map(answers).set(currentQuestion.id, optionId));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const quizAnswers: QuizAnswer[] = Array.from(answers.entries()).map(
      ([questionId, optionId]) => ({
        question_id: questionId,
        option_id: optionId,
      })
    );
    onSubmit(quizAnswers);
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = answers.size;

  return (
    <div className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-surface rounded-xl border border-border p-6 mb-6">
          <div className="mb-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
            <div className="flex items-start gap-3">
              <i className="fas fa-shuffle text-emerald-600 text-xl mt-0.5"></i>
              <div>
                <p className="text-sm font-bold text-emerald-900 mb-1">Attempt-Based Quiz Session</p>
                <p className="text-xs text-emerald-800">
                  This attempt contains a randomized set of questions from the module pool. You can retry later if needed,
                  but you need at least 60% to pass and unlock the next module.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h1 className="text-2xl font-black text-text mb-2">{quiz.title}</h1>
            <p className="text-sm text-text-secondary">{quiz.description}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-text-muted">
                {answeredCount} of {questions.length} answered
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Question Navigation Dots */}
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = answers.has(q.id!);
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-lg scale-110'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                      : 'bg-surface-hover text-text-muted border-2 border-border hover:border-border'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-surface rounded-xl border border-border p-6 mb-6">
            <h2 className="text-lg font-bold text-text mb-6">
              {currentQuestion.text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => {
                const isSelected = selectedOption === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleSelectOption(option.id!)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                        : 'border-border hover:border-border hover:bg-bg'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-border'
                        }`}
                      >
                        {isSelected && (
                          <i className="fas fa-check text-white text-xs"></i>
                        )}
                      </div>
                      <span className="text-sm font-medium text-text">
                        {option.text}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-surface border border-border rounded-lg hover:bg-bg transition-colors disabled:opacity-50"
          >
            <i className="fas fa-times mr-2"></i>
            Cancel
          </button>

          <div className="flex gap-3">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isSubmitting}
              className="px-6 py-3 text-sm font-semibold text-gray-700 bg-surface border border-border rounded-lg hover:bg-bg transition-colors disabled:opacity-50"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Previous
            </button>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!selectedOption || isSubmitting}
                className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                Next
                <i className="fas fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmSubmit(true)}
                disabled={answeredCount < questions.length || isSubmitting}
                className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Submit Quiz
              </button>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-2xl p-6 max-w-md w-full">
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <i className="fas fa-info-circle text-amber-600 mt-0.5"></i>
                  <p className="text-xs font-semibold text-amber-900">
                    This attempt will be graded immediately and counted toward module unlock progression.
                  </p>
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-check-circle text-3xl text-emerald-600"></i>
                </div>
                <h3 className="text-xl font-bold text-text mb-2">
                  Submit Quiz?
                </h3>
                <p className="text-sm text-text-secondary">
                  You've answered {answeredCount} of {questions.length} questions.
                  {answeredCount < questions.length && (
                    <span className="block mt-2 text-amber-600 font-semibold">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      You have {questions.length - answeredCount} unanswered questions!
                    </span>
                  )}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-surface border border-border rounded-lg hover:bg-bg transition-colors"
                >
                  Review Answers
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
