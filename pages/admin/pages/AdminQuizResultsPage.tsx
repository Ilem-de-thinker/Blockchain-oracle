import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizzesApi, QuizResult, Quiz } from '../../../src/api/quizzes';
import { getErrorMessage } from '../../../src/api/errorHandler';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { User as UserIcon } from 'lucide-react';

const AdminQuizResultsPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizAndResults = async () => {
      if (!quizId) {
        setError('Quiz ID is missing.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const [quizData, resultsData] = await Promise.all([
          quizzesApi.getQuiz(parseInt(quizId)),
          quizzesApi.getQuizResults(parseInt(quizId)),
        ]);
        
        setQuiz(quizData);
        setResults(resultsData);
      } catch (err: any) {
        console.error('Failed to load quiz results:', err);
        setError(getErrorMessage(err) || 'Failed to load quiz results.');
      } finally {
        setLoading(false);
      }
    };

    loadQuizAndResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        <i className="fas fa-exclamation-circle mr-2"></i>{error}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
        <i className="fas fa-info-circle mr-2"></i>Quiz not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Quiz Results: {quiz.title}</h1>
          <p className="text-sm text-text-muted">Overview of all student attempts for this quiz.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link to="/admin/courses">
              <i className="fas fa-arrow-left mr-2" /> Back to Courses
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>Title:</strong> {quiz.title}</p>
          <p><strong>Description:</strong> {quiz.description}</p>
          <p><strong>Total Questions:</strong> {quiz.questions?.length || 0}</p>
          {quiz.module && (
            <p><strong>Module ID:</strong> {quiz.module}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-clipboard-list text-6xl text-text-muted mb-4"></i>
              <p className="text-lg font-semibold text-text-secondary">No student results yet.</p>
              <p className="text-sm text-text-muted mt-2">Students haven't attempted this quiz.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Completed On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon size={16} />
                        <span>{result.user_username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={(result.is_passed ?? parseFloat(result.score) >= 60) ? 'success' : 'destructive'}>
                        {result.score}%
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(result.completed_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      {/* Link to individual student's results or full quiz review */}
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/quizzes/${quizId}/results/${result.id}`}>View Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminQuizResultsPage;
