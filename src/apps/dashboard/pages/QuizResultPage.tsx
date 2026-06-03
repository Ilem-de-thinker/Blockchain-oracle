import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesApi, QuizResult } from '@/src/api/quizzes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, XCircle, ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const QuizResultPage: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [quizId]);

  const loadResults = async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      const allResults = await quizzesApi.getMyQuizResults();
      const quizResults = allResults.filter(r => r.quiz === Number(quizId));
      setResults(quizResults.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (results.length === 0) return <div>No results found.</div>;

  const latest = results[0];

  return (
    <div className="space-y-6">
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-md hover:shadow-xl">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="text-center">
          <div className={cn("w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4", latest.is_passed ? "bg-emerald-500/10" : "bg-red-500/10")}>
            {latest.is_passed ? <Trophy className="h-10 w-10 text-emerald-500" /> : <XCircle className="h-10 w-10 text-red-500" />}
          </div>
          <h2 className="text-2xl font-semibold text-text mb-2">{latest.quiz_title}</h2>
          <p className="text-lg font-bold text-text">Latest Score: {latest.score}%</p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => navigate(`/dashboard/quiz/${quizId}/take`)} className="bg-purple-600">
            <RotateCcw className="h-4 w-4 mr-2" /> Retake Quiz
          </Button>
        </div>
      </div>

      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-md hover:shadow-xl">
        <h3 className="text-lg font-semibold text-text mb-4">Attempt History</h3>
        <div className="space-y-2">
          {results.map((res) => (
            <div key={res.id} className="flex justify-between items-center p-3 rounded-lg border border-border/50">
              <div>
                <p className="font-medium text-text">{new Date(res.completed_at).toLocaleString()}</p>
                <p className="text-xs text-text-muted">{res.correct_answers} / {res.total_questions} correct</p>
              </div>
              <Badge variant={res.is_passed ? 'success' : 'destructive'}>{res.score}%</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;
