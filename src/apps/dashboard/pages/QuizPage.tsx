import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { quizzesApi, QuizResult } from '@/src/api/quizzes';
import { coursesApi } from '@/src/api/courses';
import QuizHistory from '../components/QuizHistory';
import QuizRules from '../components/QuizRules';

export default function QuizPage() {
  const { id: courseId, quizId } = useParams<{ id: string; quizId: string }>();
  const navigate = useNavigate();

  const [quizTitle, setQuizTitle] = useState('');
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'history' | 'rules'>('history');

  useEffect(() => {
    if (!quizId) return;
    (async () => {
      try {
        setLoading(true);
        const qId = parseInt(quizId);
        const [quizData, allResults] = await Promise.all([
          quizzesApi.getQuiz(qId).catch(() => null),
          quizzesApi.getMyQuizResults(),
        ]);
        setQuizTitle(quizData?.title ?? 'Module Quiz');
        const filtered = allResults.filter(r => r.quiz === qId);
        setResults(filtered);
        if (filtered.length === 0) setView('rules');
      } catch {
        setQuizTitle('Module Quiz');
        setView('rules');
      } finally {
        setLoading(false);
      }
    })();
  }, [quizId]);

  const handleBack = () => {
    if (courseId) {
      navigate(`/dashboard/course/${courseId}`);
    } else {
      navigate('/dashboard/courses');
    }
  };

  const handleRetake = () => setView('rules');

  const handleStartQuiz = () => {
    if (quizId) {
      navigate(`/dashboard/quiz/${quizId}/take`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RotateCcw className="h-8 w-8 animate-spin text-text-muted" />
      </div>
    );
  }

  if (view === 'history' && results.length > 0) {
    return (
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-text-muted hover:text-text font-bold transition-colors mb-6"
        >
          <ArrowLeft size={18} strokeWidth={3} />
          Back to Course
        </button>
        <QuizHistory
          quizTitle={quizTitle}
          results={results}
          onRetake={handleRetake}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-text-muted hover:text-text font-bold transition-colors mb-6"
      >
        <ArrowLeft size={18} strokeWidth={3} />
        Back to Course
      </button>
      <QuizRules
        quizTitle={quizTitle}
        onStart={handleStartQuiz}
        onBack={handleBack}
      />
    </div>
  );
}
