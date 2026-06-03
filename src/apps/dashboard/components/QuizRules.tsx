import React from 'react';
import { ArrowLeft, Shield, AlertTriangle, Timer, CheckCircle2, BookOpen, RotateCcw } from 'lucide-react';

interface QuizRulesProps {
  quizTitle: string;
  onStart: () => void;
  onBack: () => void;
}

export default function QuizRules({ quizTitle, onStart, onBack }: QuizRulesProps) {
  return (
    <div className="max-w-2xl mx-auto py-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-text font-bold transition-colors mb-8"
      >
        <ArrowLeft size={18} strokeWidth={3} />
        Back
      </button>

      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
          <BookOpen size={40} />
        </div>
        <h2 className="text-2xl font-black text-text tracking-tight mb-2">{quizTitle}</h2>
        <p className="text-text-muted text-sm">Review the rules before starting your assessment</p>
      </div>

      <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 space-y-6 mb-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
          <Shield size={16} />
          Assessment Laws & Penalties
        </h3>

        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Timer size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-text">Time Limit</p>
              <p className="text-sm text-text-muted mt-0.5">
                Each attempt has a fixed time limit. The test will auto-submit when time expires. Unanswered questions will be marked as incorrect.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <p className="font-bold text-text">Anti-Cheating Policy</p>
              <p className="text-sm text-text-muted mt-0.5">
                Switching tabs, opening new windows, or losing focus on the test window is strictly prohibited. 
                One warning will be issued. A second violation will automatically terminate your attempt.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="font-bold text-text">Passing Score</p>
              <p className="text-sm text-text-muted mt-0.5">
                You need to answer at least <b>3 out of 5</b> questions correctly (60%) to pass. 
                Passing unlocks the next module in your course.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <RotateCcw size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-text">Multiple Attempts</p>
              <p className="text-sm text-text-muted mt-0.5">
                You can retake the quiz multiple times. Each attempt randomly selects 5 questions from the question pool. 
                Your highest score is what matters.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-500 transition-all"
      >
        Begin Assessment
      </button>
    </div>
  );
}
