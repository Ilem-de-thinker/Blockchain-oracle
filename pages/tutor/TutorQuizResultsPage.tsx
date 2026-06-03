import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizzesApi, QuizResult, Quiz } from '../../src/api/quizzes';

const TutorQuizResultsPage: React.FC = () => {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (quizId) {
      loadData(parseInt(quizId));
    }
  }, [quizId]);

  const loadData = async (id: number) => {
    try {
      setLoading(true);
      const [quizData, resultsData] = await Promise.all([
        quizzesApi.getQuiz(id),
        quizzesApi.getQuizResults(id),
      ]);
      setQuiz(quizData);
      setResults(resultsData);
      setError(null);
    } catch {
      setError('Failed to load quiz results.');
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'score') {
      comparison = parseFloat(a.score) - parseFloat(b.score);
    } else if (sortBy === 'name') {
      comparison = a.user_username.localeCompare(b.user_username);
    } else {
      comparison = new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const averageScore = results.length > 0
    ? results.reduce((sum, r) => sum + parseFloat(r.score), 0) / results.length
    : 0;

  const highestScore = results.length > 0
    ? Math.max(...results.map(r => parseFloat(r.score)))
    : 0;

  const lowestScore = results.length > 0
    ? Math.min(...results.map(r => parseFloat(r.score)))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-amber-600"></i>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <i className="fas fa-exclamation-circle mr-2"></i>{error || 'Quiz not found'}
        </div>
        <Link to="/tutor/quizzes" className="text-amber-600 hover:underline">
          <i className="fas fa-arrow-left mr-2"></i>Back to Quizzes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
            <Link to="/tutor/quizzes" className="hover:underline">Quizzes</Link>
            <i className="fas fa-chevron-right text-xs"></i>
            <span>{quiz.title} Results</span>
          </div>
          <h1 className="text-2xl font-bold text-text">{quiz.title}</h1>
          <p className="text-text-secondary mt-1">{quiz.description}</p>
        </div>
        <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
          <i className="fas fa-layer-group mr-2"></i>Module ID: {quiz.module}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Total Attempts</p>
              <p className="text-3xl font-bold text-text mt-1">{results.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-users text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Average Score</p>
              <p className={`text-3xl font-bold mt-1 ${getScoreColor(averageScore)}`}>
                {averageScore.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-2xl text-green-600"></i>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary">Highest / Lowest</p>
              <p className="text-lg font-bold text-text mt-1">
                <span className="text-green-600">{highestScore}%</span>
                {' / '}
                <span className="text-red-600">{lowestScore}%</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-trophy text-2xl text-amber-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Student Results</h2>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 border border-border rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-bg"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Score</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Completed</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedResults.map((result) => (
                <tr key={result.id} className="hover:bg-bg transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-semibold">
                        {result.user_username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{result.user_username}</p>
                        <p className="text-xs text-text-muted">Result ID: {result.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-bold ${getScoreColor(parseFloat(result.score))}`}>
                      {result.score}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">
                      {new Date(result.completed_at).toLocaleDateString()}
                    </span>
                    <p className="text-xs text-gray-400">
                      {new Date(result.completed_at).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getScoreBarColor(parseFloat(result.score))} rounded-full transition-all`}
                          style={{ width: `${result.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-text-secondary w-12">
                        {result.score}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {results.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-clipboard-list text-2xl text-gray-400"></i>
            </div>
            <p className="text-sm font-medium text-text">No submissions yet</p>
            <p className="text-xs text-text-muted mt-1">Students haven't attempted this quiz yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorQuizResultsPage;
