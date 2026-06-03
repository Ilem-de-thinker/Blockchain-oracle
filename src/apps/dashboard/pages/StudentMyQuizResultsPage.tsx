import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizzesApi, QuizResult } from '@/src/api/quizzes';

const StudentMyQuizResultsPage: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await quizzesApi.getMyQuizResults();
      setResults(data);
      setError(null);
    } catch {
      setError('Failed to load your quiz results.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    if (filter === 'passed') return result.is_passed ?? parseFloat(result.score) >= 60;
    return !(result.is_passed ?? parseFloat(result.score) >= 60);
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreDiff = parseFloat(b.score) - parseFloat(a.score);
      return scoreDiff;
    }
    return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { text: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 60) return { text: 'Passed', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Failed', color: 'bg-red-100 text-red-800' };
  };

  const totalQuizzes = results.length;
  const passedQuizzes = results.filter((result) => result.is_passed ?? parseFloat(result.score) >= 60).length;
  const failedQuizzes = totalQuizzes - passedQuizzes;
  const averageScore = totalQuizzes > 0
    ? results.reduce((sum, r) => sum + parseFloat(r.score), 0) / totalQuizzes
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-purple-600"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text">My Quiz Results</h1>
        <p className="text-gray-600 mt-1">View your quiz performance and scores</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <i className="fas fa-exclamation-circle mr-2"></i>{error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-gray-600">Total Quizzes</p>
          <p className="text-2xl font-bold text-text mt-1">{totalQuizzes}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-gray-600">Passed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{passedQuizzes}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-gray-600">Failed</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{failedQuizzes}</p>
        </div>
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm text-gray-600">Average Score</p>
          <p className={`text-2xl font-bold mt-1 ${getScoreColor(averageScore)}`}>
            {averageScore.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'border border-gray-300 text-text-secondary hover:bg-gray-50'
              }`}
            >
              All ({totalQuizzes})
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'passed'
                  ? 'bg-green-600 text-white'
                  : 'border border-gray-300 text-text-secondary hover:bg-gray-50'
              }`}
            >
              Passed ({passedQuizzes})
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'failed'
                  ? 'bg-red-600 text-white'
                  : 'border border-gray-300 text-text-secondary hover:bg-gray-50'
              }`}
            >
              Failed ({failedQuizzes})
            </button>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
          >
            <option value="date">Sort by Date</option>
            <option value="score">Sort by Score</option>
          </select>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {sortedResults.map((result) => {
          const badge = getScoreBadge(parseFloat(result.score));
          return (
            <div
              key={result.id}
              className="bg-surface rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                    <i className="fas fa-clipboard-check text-2xl text-purple-600"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-text">
                        Quiz #{result.quiz}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Completed on {new Date(result.completed_at).toLocaleDateString()} at{' '}
                      {new Date(result.completed_at).toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Result ID: {result.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-3xl font-bold ${getScoreColor(parseFloat(result.score))}`}>
                    {result.score}%
                  </p>
                  <div className="mt-2 w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        parseFloat(result.score) >= 80 ? 'bg-green-600' :
                        parseFloat(result.score) >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedResults.length === 0 && !loading && (
        <div className="bg-surface rounded-xl border border-border p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-clipboard-list text-3xl text-gray-400"></i>
          </div>
          <p className="text-lg font-semibold text-text">No quiz results found</p>
          <p className="text-sm text-text-muted mt-2">
            {totalQuizzes === 0
              ? "You haven't attempted any quizzes yet"
              : "No quizzes match your current filter"}
          </p>
          <Link
            to="/dashboard/courses"
            className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudentMyQuizResultsPage;
