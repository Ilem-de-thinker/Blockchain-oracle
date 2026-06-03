import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesApi, Quiz, QuizAttempt, QuizResult, QuizAnswer } from '@/src/api/quizzes';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Badge } from '@/components/ui/badge';
import { 
  FileQuestion, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  Clock,
  Trophy,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TakeQuizPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useLocalStorage(`quiz_${quizId}_question`, 0);
  const [answers, setAnswers] = useLocalStorage<QuizAnswer[]>(`quiz_${quizId}_answers`, []);

  useEffect(() => {
    if (quizId) {
      startQuiz();
    }
  }, [quizId]);

  const startQuiz = async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      setError('');
      const attemptData = await quizzesApi.startQuizAttempt(Number(quizId));
      setAttempt(attemptData);
      
      // Fetch quiz details for title/description
      const quizData = await quizzesApi.getQuiz(Number(quizId));
      setQuiz(quizData);
      
      // Initialize answers array
      setAnswers(
        (attemptData.selected_questions || []).map(q => ({
          question_id: q.id!,
          option_id: 0,
        }))
      );
    } catch (err: any) {
      console.error('Failed to start quiz:', err);
      setError(err.message || 'Failed to start quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionId: number) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = {
        ...newAnswers[questionIndex],
        option_id: optionId,
      };
      return newAnswers;
    });
  };

  const handleSubmit = async () => {
    if (!attempt) return;
    
    // Validate all questions answered
    const unanswered = answers.findIndex(a => a.option_id === 0);
    if (unanswered !== -1) {
      setError(`Please answer question ${unanswered + 1}`);
      setCurrentQuestion(unanswered);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const resultData = await quizzesApi.submitQuizAttempt(attempt.id, answers);
      setResult(resultData);
      setAnswers([]);
      setCurrentQuestion(0);
    } catch (err: any) {
      console.error('Failed to submit quiz:', err);
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAttempt(null);
    setResult(null);
    setCurrentQuestion(0);
    setAnswers([]);
    startQuiz();
  };

  if (loading) {
    return (
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-8 text-center shadow-sm">
        <RotateCcw className="h-8 w-8 mx-auto text-text-muted animate-spin mb-3" />
        <p className="text-text-muted">Loading quiz...</p>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-8 text-center shadow-sm">
        <XCircle className="h-12 w-12 mx-auto text-red-500 mb-3" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="border-border/50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  // Show Results
  if (result) {
    const isPassed = result.is_passed;
    const correctCount = result.correct_answers || 0;
    const total = result.total_questions || 5;
    
    return (
      <div className="space-y-6">
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4 border-border/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>
          <div className="text-center">
            <div className={cn(
              "w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4",
              isPassed ? "bg-emerald-500/10" : "bg-red-500/10"
            )}>
              {isPassed ? (
                <Trophy className="h-10 w-10 text-emerald-500" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500" />
              )}
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-text mb-2">
              {isPassed ? 'Congratulations!' : 'Try Again'}
            </h2>
            <p className={cn(
              "text-lg font-bold",
              isPassed ? "text-emerald-600" : "text-red-600"
            )}>
              Score: {result.score}%
            </p>
            <p className="text-sm text-text-muted mt-2">
              {correctCount} out of {total} questions correct
            </p>
            {isPassed && (
              <p className="text-sm text-emerald-600 mt-2">
                Module unlocked! You can now proceed to the next module.
              </p>
            )}
          </div>
        </div>

        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm flex gap-3 justify-center">
          {!isPassed && (
            <Button onClick={handleRetake} className="bg-purple-600 hover:bg-purple-700 text-white">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate('/dashboard/quizzes')} className="border-border/50">
            All Quizzes
          </Button>
        </div>
      </div>
    );
  }

  // Quiz Taking Interface
  const questions = attempt?.selected_questions || [];
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4 border-border/50">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text">{quiz?.title}</h1>
            <p className="text-sm text-text-muted mt-1">
              Question {currentQuestion + 1} of {totalQuestions}
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {totalQuestions} Questions
          </Badge>
        </div>
        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-surface/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-md bg-red-50/80 border border-red-200/50 rounded-xl p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Current Question */}
      {questions[currentQuestion] && (
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-text mb-6">
            {questions[currentQuestion].text}
          </h2>
          
          <div className="space-y-3">
            {questions[currentQuestion].options?.map((option) => {
              const isSelected = answers[currentQuestion]?.option_id === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(currentQuestion, option.id!)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    isSelected 
                      ? "border-purple-600 bg-purple-600/10" 
                      : "border-border/50 bg-surface/50 hover:border-purple-600/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      isSelected ? "border-purple-600 bg-purple-600" : "border-border"
                    )}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-text">{option.text}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-4 shadow-sm flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="border-border/50"
        >
          Previous
        </Button>
        
        {currentQuestion < totalQuestions - 1 ? (
          <Button
            onClick={() => setCurrentQuestion(prev => Math.min(totalQuestions - 1, prev + 1))}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TakeQuizPage;
