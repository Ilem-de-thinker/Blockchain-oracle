import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuizCard } from '../components/quiz/QuizCard';
import { QuizTaker } from '../components/quiz/QuizTaker';
import { QuizResults } from '../components/quiz/QuizResults';
import { quizzesApi, Quiz, QuizResult, QuizAnswer, QuizAttempt } from '../src/api/quizzes';
import { coursesApi, Course } from '../src/api/courses';

type QuizViewMode = 'list' | 'taking' | 'results';

const QuizPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [viewMode, setViewMode] = useState<QuizViewMode>('list');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [myResults, setMyResults] = useState<QuizResult[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<QuizAttempt | null>(null);
  const [currentResult, setCurrentResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuizzes();
  }, [courseId]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);

      const resultsData = await quizzesApi.getMyQuizResults().catch(() => []);
      setMyResults(resultsData);

      if (courseId) {
        try {
          const courseData = await coursesApi.getCourse(parseInt(courseId));
          setCourse(courseData);

          const moduleIds = courseData.modules?.map((module) => module.id) || [];
          const moduleQuizLists = await Promise.all(
            moduleIds.map((moduleId) => quizzesApi.getQuizzes(moduleId).catch(() => []))
          );
          setQuizzes(moduleQuizLists.flat());
        } catch (err) {
          console.error('Failed to load course:', err);
          setQuizzes([]);
        }
      } else {
        const quizzesData = await quizzesApi.getQuizzes().catch(() => []);
        setQuizzes(quizzesData);
      }
    } catch (err: any) {
      console.error('Failed to load quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = async (quizId: number) => {
    try {
      const [quiz, attempt] = await Promise.all([
        quizzesApi.getQuiz(quizId),
        quizzesApi.startQuizAttempt(quizId),
      ]);
      setCurrentQuiz({
        ...quiz,
        questions: attempt.selected_questions,
      });
      setCurrentAttempt(attempt);
      setViewMode('taking');
    } catch (err: any) {
      console.error('Failed to load quiz:', err);
      setError(err.message || 'Failed to load quiz');
    }
  };

  const handleSubmitQuiz = async (answers: QuizAnswer[]) => {
    if (!currentAttempt) return;

    try {
      setIsSubmitting(true);
      const result = await quizzesApi.submitQuizAttempt(currentAttempt.id, answers);
      setCurrentResult(result);
      setViewMode('results');
      
      // Refresh results list
      const resultsData = await quizzesApi.getMyQuizResults();
      setMyResults(resultsData);
    } catch (err: any) {
      console.error('Failed to submit quiz:', err);
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewResults = async (quizId: number) => {
    try {
      const [quiz, results] = await Promise.all([
        quizzesApi.getQuiz(quizId),
        quizzesApi.getMyQuizResults(),
      ]);
      
      setCurrentQuiz(quiz);
      const result = results
        .filter((entry) => entry.quiz === quizId)
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];
      if (result) {
        setCurrentResult(result);
        setViewMode('results');
      }
    } catch (err: any) {
      console.error('Failed to load quiz results:', err);
      setError(err.message || 'Failed to load results');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentQuiz(null);
    setCurrentAttempt(null);
    setCurrentResult(null);
  };

  const isQuizCompleted = (quizId: number) => {
    return myResults.some(result => result.quiz === quizId);
  };

  // Taking Quiz View
  if (viewMode === 'taking' && currentQuiz) {
    return (
      <QuizTaker
        quiz={currentQuiz}
        onSubmit={handleSubmitQuiz}
        onCancel={handleBackToList}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Results View
  if (viewMode === 'results' && currentQuiz && currentResult) {
    return (
      <QuizResults
        quiz={currentQuiz}
        result={currentResult}
        onBack={handleBackToList}
      />
    );
  }

  // List View
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </button>
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            {course ? `${course.title} - Quizzes` : 'Available Quizzes'}
          </h1>
          <p className="text-gray-600">
            {course ? 'Test your knowledge of the course material' : 'Test your knowledge across all courses'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
            <i className="fas fa-exclamation-circle mt-0.5"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : quizzes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {quizzes.map((quiz) => {
              const completed = isQuizCompleted(quiz.id);
              const result = myResults
                .filter((entry) => entry.quiz === quiz.id)
                .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];
              
              return (
                <QuizCard
                  key={quiz.id}
                  id={quiz.id}
                  title={quiz.title}
                  description={quiz.description}
                  questionCount={quiz.questions?.length}
                  courseTitle={course?.title}
                  score={result?.score}
                  completed={completed}
                  onTakeQuiz={() => handleTakeQuiz(quiz.id)}
                  onViewResults={() => handleViewResults(quiz.id)}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <i className="fas fa-question-circle text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Quizzes Available</h3>
            <p className="text-gray-600">
              {courseId
                ? 'No quizzes have been created for this course modules yet.'
                : 'No quizzes are currently available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
