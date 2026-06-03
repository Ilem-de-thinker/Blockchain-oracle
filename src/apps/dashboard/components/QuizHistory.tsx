import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Award, CheckCircle2, XCircle, RotateCcw, BarChart3 } from 'lucide-react';
import type { QuizResult } from '@/src/api/quizzes';

interface QuizHistoryProps {
  quizTitle: string;
  results: QuizResult[];
  onRetake: () => void;
  onBack: () => void;
}

export default function QuizHistory({ quizTitle, results, onRetake, onBack }: QuizHistoryProps) {
  const bestResult = results.reduce<QuizResult | null>((best, r) => {
    const bestScore = best ? parseFloat(best.score) : -1;
    return parseFloat(r.score) > bestScore ? r : best;
  }, null);

  return (
    <div className="max-w-3xl mx-auto py-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-muted hover:text-text font-bold transition-colors mb-8"
        >
          <ArrowLeft size={18} strokeWidth={3} />
          Back to Course
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-text tracking-tight">Quiz History</h2>
            <p className="text-text-muted text-sm mt-1">{quizTitle}</p>
          </div>
          {bestResult && (
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <Award size={20} className="text-indigo-600" />
              <span className="font-black text-indigo-600">
                Best: {parseFloat(bestResult.score).toFixed(0)}%
              </span>
            </div>
          )}
        </div>

        {results.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 size={48} className="text-text-muted mx-auto mb-4 opacity-40" />
            <p className="text-text-muted font-bold">No attempts yet</p>
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            {results.map((result, idx) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.is_passed ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {result.is_passed ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-black ${result.is_passed ? 'text-emerald-600' : 'text-red-500'}`}>
                        {parseFloat(result.score).toFixed(0)}%
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${result.is_passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                        {result.is_passed ? 'Passed' : 'Failed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      <span>{result.correct_answers}/{result.total_questions} correct</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(result.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {idx === 0 && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
                      Latest
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={onRetake}
          className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          {results.length > 0 ? 'Retake Test' : 'Take Test'}
        </button>
    </div>
  );
}
