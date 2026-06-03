import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Timer, Shield, CheckCircle2, RotateCcw, ArrowRight, XCircle, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Question {
  id: number;
  text: string;
  options: { id?: number; text: string }[];
}

interface QuizViewProps {
  title: string;
  timeLimitSeconds: number;
  questions: Question[];
  onSubmit: (answers: { question_id: number; option_id: number }[]) => void;
  onExit: () => void;
  isSubmitting: boolean;
}

export default function QuizView({ title, timeLimitSeconds, questions, onSubmit, onExit, isSubmitting }: QuizViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ question_id: number; option_id: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(timeLimitSeconds);
  const [status, setStatus] = useState<'intro' | 'active' | 'cheating' | 'finished'>('intro');
  const [shameCount, setShameCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleFinish = useCallback(() => {
    setStatus('finished');

    const correctCount = 0;
    const finalScore = 0;

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 }
    });
  }, []);

  useEffect(() => {
    if (status !== 'active') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShameCount(prev => prev + 1);
      }
    };

    const handleBlur = () => {
      setShameCount(prev => prev + 1);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [status]);

  useEffect(() => {
    if (shameCount >= 2) {
      setStatus('cheating');
    }
  }, [shameCount]);

  useEffect(() => {
    if (status !== 'active') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const handleStart = () => {
    setStatus('active');
  };

  const handleAnswer = (optionIndex: number) => {
    const question = questions[currentQuestionIndex];
    const optionId = question.options[optionIndex]?.id ?? optionIndex;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      question_id: question.id,
      option_id: optionId,
    };
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    setStatus('finished');
    onSubmit(answers);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'intro') {
    return (
      <div className="min-h-screen bg-bg">
        <button
          onClick={onExit}
          className="fixed top-6 right-6 p-3 hover:bg-surface-hover rounded-2xl text-text-muted transition-colors z-[210] flex items-center gap-2 font-bold"
        >
          <X size={20} />
          <span>Exit Exam</span>
        </button>
        <div className="max-w-2xl mx-auto py-12 px-6 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-8">
            <Shield size={40} />
          </div>
          <h2 className="text-3xl font-black text-text mb-4">{title}</h2>
          <div className="bg-surface border border-border rounded-3xl p-8 mb-8 text-left space-y-6">
            <div className="flex items-start gap-4">
              <Timer className="text-indigo-500 mt-1" size={20} />
              <div>
                <p className="font-bold text-text">Time Limit: {formatTime(timeLimitSeconds)}</p>
                <p className="text-sm text-text-muted">The test will auto-submit when the timer hits zero.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Shield className="text-amber-500 mt-1" size={20} />
              <div>
                <p className="font-bold text-text">Anti-Cheating Enabled</p>
                <p className="text-sm text-text-muted">Switching tabs or windows will be flagged. Multiple violations will result in automatic failure.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle2 className="text-indigo-500 mt-1" size={20} />
              <div>
                <p className="font-bold text-text">Passing Score: 60%</p>
                <p className="text-sm text-text-muted">You need to answer at least 3 out of 5 questions correctly to pass.</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleStart}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-500 transition-all"
          >
            Begin Assessment
          </button>
        </div>
      </div>
    );
  }

  if (status === 'cheating') {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center text-red-600 mx-auto mb-8">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-3xl font-black text-text mb-4">Assessment Terminated</h2>
          <p className="text-text-muted mb-12">We detected unusual activity (tab switching or loss of focus). To maintain integrity, this attempt has been cancelled.</p>
          <div className="grid gap-3">
            <button
              onClick={() => {
                setAnswers([]);
                setTimeLeft(timeLimitSeconds);
                setShameCount(0);
                setStatus('intro');
              }}
              className="w-full bg-surface text-text py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-surface-hover transition-all flex items-center justify-center gap-2 border border-border"
            >
              <RotateCcw size={18} /> Restart Securely
            </button>
            <button
              onClick={onExit}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 transition-all"
            >
              Exit to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'finished') {
    const answerCount = answers.filter(a => a !== undefined).length;
    const allAnswered = answerCount === questions.length;

    return (
      <div className="min-h-screen bg-bg py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 bg-indigo-100 text-indigo-600">
            <CheckCircle2 size={56} />
          </div>
          <h2 className="text-4xl font-black text-text mb-2">Quiz Submitted!</h2>
          <p className="text-text-muted text-lg mb-12">
            {allAnswered
              ? 'Your answers have been recorded.'
              : `You answered ${answerCount} of ${questions.length} questions.`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setAnswers([]);
                setTimeLeft(timeLimitSeconds);
                setShameCount(0);
                setStatus('intro');
              }}
              className="p-5 bg-surface border border-border rounded-2xl font-black text-text uppercase tracking-widest hover:bg-surface-hover flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} /> Retake Test
            </button>
            <button
              onClick={onExit}
              className="p-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-500 flex items-center justify-center gap-2"
            >
              Go Back to Course <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = answers[currentQuestionIndex];

  return (
    <div ref={containerRef} className="min-h-screen bg-bg">
      <div className="max-w-3xl mx-auto py-10 px-6 flex flex-col min-h-screen">
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
          <div>
            <h3 className="text-xl font-bold text-text">{title}</h3>
            <p className="text-sm text-text-muted font-bold uppercase tracking-widest mt-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-lg
            ${timeLeft < 30 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-surface text-text border border-border'}
          `}>
            <Timer size={22} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <AnimatePresence>
          {shameCount > 0 && shameCount < 2 && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-3 font-bold text-sm"
            >
              <AlertCircle size={20} />
              Focus Warning: Please stay in this tab to complete the assessment.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 mb-6">
          {questions.map((q, idx) => {
            const isAnswered = answers[idx] !== undefined;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`
                  w-9 h-9 rounded-xl text-xs font-black transition-all border
                  ${idx === currentQuestionIndex
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : isAnswered
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-surface text-text-muted border-border hover:border-indigo-400'
                  }
                `}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="w-full h-2 bg-border rounded-full mb-10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            className="h-full bg-indigo-500"
          />
        </div>

        <div className="flex-1 space-y-10">
          <h4 className="text-2xl font-black text-text leading-tight">
            {currentQuestion.text}
          </h4>

          <div className="grid gap-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`
                  w-full p-5 rounded-3xl text-left font-bold transition-all border-2 flex items-center justify-between group
                  ${currentAnswer?.option_id === (option.id ?? idx)
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100'
                    : 'bg-surface border-border text-text-secondary hover:border-indigo-400 hover:bg-surface-hover'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <span className={`
                    w-8 h-8 rounded-xl flex items-center justify-center text-xs border
                    ${currentAnswer?.option_id === (option.id ?? idx) ? 'bg-white/20 border-white/40' : 'bg-surface-alt border-border text-text-muted group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200'}
                  `}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option.text}
                </div>
                {currentAnswer?.option_id === (option.id ?? idx) && <CheckCircle2 size={24} />}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between pt-8 border-t border-border">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-8 py-4 rounded-2xl font-black text-text-muted uppercase tracking-widest hover:text-text-secondary disabled:opacity-0"
          >
            Back
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleSubmit}
              disabled={currentAnswer === undefined || isSubmitting}
              className={`
                px-12 py-5 rounded-2xl font-black uppercase tracking-widest transition-all
                ${currentAnswer !== undefined && !isSubmitting
                  ? 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-500'
                  : 'bg-surface-alt text-text-muted border border-border cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              disabled={currentAnswer === undefined}
              className={`
                px-12 py-5 rounded-2xl font-black uppercase tracking-widest transition-all
                ${currentAnswer !== undefined
                  ? 'bg-indigo-600 text-white shadow-xl hover:bg-indigo-500'
                  : 'bg-surface-alt text-text-muted border border-border cursor-not-allowed'
                }
              `}
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
