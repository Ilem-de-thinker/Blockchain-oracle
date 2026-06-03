import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { quizzesApi, Quiz, QuizResult } from '../../../src/api/quizzes';
import { coursesApi, Course } from '../../../src/api/courses';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  FileQuestion, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  ChevronRight,
  RotateCcw,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const QuizListPage: React.FC = () => {
  const { courseId: rawCourseId } = useParams<{ courseId?: string }>();
  const courseId = rawCourseId ? Number(rawCourseId) : NaN;
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [myResults, setMyResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [courseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      const resultsData = await quizzesApi.getMyQuizResults();
      setMyResults(resultsData);

      if (!isNaN(courseId)) {
        const [courseData, modulesData] = await Promise.all([
          coursesApi.getCourse(courseId),
          coursesApi.getModules(courseId),
        ]);
        setCourse(courseData);

        const inlineQuizzes = modulesData.flatMap((module) =>
          (module.quizzes || []).map((quiz) => ({
            id: quiz.id,
            module: module.id,
            title: quiz.title,
            description: quiz.description ?? '',
          }))
        );

        if (inlineQuizzes.length > 0) {
          setQuizzes(inlineQuizzes);
        } else {
          const quizLists = await Promise.all(
            modulesData.map((module) => quizzesApi.getQuizzes(module.id).catch(() => []))
          );
          setQuizzes(quizLists.flat());
        }
      } else {
        const quizzesData = await quizzesApi.getQuizzes();
        setQuizzes(quizzesData);
      }
    } catch (err: any) {
      console.error('Failed to load quizzes:', err);
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getQuizResult = (quizId: number): QuizResult | null => {
    const results = myResults.filter(r => r.quiz === quizId);
    if (results.length === 0) return null;
    return results.sort((a, b) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    )[0];
  };

  const getModuleTitle = (moduleId: number): string => {
    if (!course) return 'Unknown Module';
    const module = course.modules?.find(m => m.id === moduleId);
    return module?.title || 'Unknown Module';
  };

  const passedCount = quizzes.filter(q => {
    const result = getQuizResult(q.id);
    return result?.is_passed;
  }).length;

  if (loading) {
    return (
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-8 text-center shadow-md hover:shadow-xl">
        <RotateCcw className="h-8 w-8 mx-auto text-text-muted animate-spin mb-3" />
        <p className="text-text-muted">Loading quizzes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Flat-Glass */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-md hover:shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-muted">
              {course && (
                <>
                  <Link to="/dashboard/quizzes" className="hover:text-text transition-colors">
                    Quizzes
                  </Link>
                  <span>/</span>
                </>
              )}
              <span className="text-purple-600">{course?.title || 'All Quizzes'}</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">
              {course ? `${course.title} - Quizzes` : 'Available Quizzes'}
            </h1>
            <p className="mt-2 text-sm text-text-muted">
              Test your knowledge and unlock new modules by scoring 60% or higher
            </p>
          </div>
          <Button variant="outline" onClick={loadData} className="border-border/50">
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats with Flat-Glass */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-md hover:shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <FileQuestion className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Total Quizzes</p>
              <p className="text-2xl font-semibold tracking-tight text-text">{quizzes.length}</p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-md hover:shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Passed</p>
              <p className="text-2xl font-semibold tracking-tight text-emerald-600">{passedCount}</p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-md hover:shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Pass Rate</p>
              <p className="text-2xl font-semibold tracking-tight text-text">
                {quizzes.length > 0 ? Math.round((passedCount / quizzes.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-md bg-red-50/80 border border-red-200/50 rounded-xl p-4 text-sm text-red-700 shadow-md hover:shadow-xl">
          {error}
        </div>
      )}

      {/* Quiz List with Flat-Glass */}
      <div className="space-y-3">
        {quizzes.length === 0 ? (
          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-8 text-center shadow-md hover:shadow-xl">
            <FileQuestion className="h-12 w-12 mx-auto text-text-muted opacity-50 mb-3" />
            <p className="text-text-muted">No quizzes available</p>
            {!courseId && (
              <Link to="/dashboard/courses" className="inline-block mt-4 text-sm text-purple-600 hover:text-purple-700">
                Browse Courses →
              </Link>
            )}
          </div>
        ) : (
          quizzes.map((quiz) => {
            const result = getQuizResult(quiz.id);
            const isPassed = result?.is_passed;
            
            return (
              <div
                key={quiz.id}
                className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isPassed ? "bg-emerald-500/10" : "bg-purple-500/10"
                    )}>
                      {isPassed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <FileQuestion className={cn(
                          "h-5 w-5",
                          result ? "text-red-500" : "text-purple-500"
                        )} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold tracking-tight text-text">{quiz.title}</h3>
                      {quiz.description && (
                        <p className="text-sm text-text-muted mt-1">{quiz.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {course && (
                          <Badge variant="secondary" className="text-xs">
                            {getModuleTitle(quiz.module)}
                          </Badge>
                        )}
                        {result && (
                          <span className={cn(
                            "text-xs font-medium",
                            isPassed ? "text-emerald-600" : "text-red-600"
                          )}>
                            Best: {result.score}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPassed ? (
                      <Badge variant="success" className="text-xs">Passed</Badge>
                    ) : result ? (
                      <Badge variant="destructive" className="text-xs">Failed</Badge>
                    ) : null}
                    <Link to={`/dashboard/quiz/${quiz.id}/take`}>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                        {isPassed ? 'Retake' : 'Start'}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default QuizListPage;
