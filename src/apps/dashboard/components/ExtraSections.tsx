import React, { useEffect, useState } from 'react';
import { Star, User, Award, BookOpen, Users, X, MessageCircle, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '@/src/api/auth';
import MessageTutorModal from '@/components/MessageTutorModal';

interface ReviewItem {
  id: number;
  user: { username: string; full_name: string };
  rating: number;
  comment?: string;
  content?: string;
  created_at: string;
}

interface ReviewsProps {
  reviews: ReviewItem[];
  onSubmitReview: (rating: number, comment: string) => void;
  isSubmittingReview: boolean;
}

export default function Reviews({ reviews, onSubmitReview, isSubmittingReview }: ReviewsProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview(rating, comment);
    setIsModalOpen(false);
    setRating(0);
    setComment('');
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text">Student Reviews</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(avgRating) ? 'currentColor' : 'none'} />)}
            </div>
            <span className="text-sm font-bold text-text-secondary">
              {avgRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface-hover transition-colors shadow-sm"
        >
          Write a Review
        </button>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-surface border border-border rounded-2xl shadow-sm hover:border-border-hover transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {(review.user.full_name || review.user.username).charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-text">{review.user.full_name || review.user.username}</p>
                  <p className="text-[10px] text-text-muted font-medium">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < review.rating ? 'currentColor' : 'none'} />)}
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed italic">
              "{review.comment || review.content}"
            </p>
          </motion.div>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-text-muted text-center py-8">No reviews yet. Be the first to review!</p>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-surface rounded-3xl shadow-2xl p-8 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-secondary">
                  <X size={24} />
                </button>
              </div>

              <h3 className="text-2xl font-black text-text mb-2">Share your thoughts</h3>
              <p className="text-text-muted mb-8 font-medium">How would you rate this course so far?</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`p-2 transition-all ${rating >= s ? 'text-amber-400 scale-110' : 'text-slate-200'}`}
                    >
                      <Star size={32} fill={rating >= s ? 'currentColor' : 'none'} strokeWidth={2.5} />
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Your Review</label>
                  <textarea
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What did you like or dislike?"
                    className="w-full h-32 p-4 bg-bg-secondary border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none text-sm font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!rating || isSubmittingReview}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    rating && !isSubmittingReview
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0'
                      : 'bg-surface-alt text-text-muted cursor-not-allowed'
                  }`}
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AboutTutor({ tutorId, courseId }: { tutorId?: number; courseId?: number }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);

  useEffect(() => {
    if (!tutorId) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);
    authApi.getUserProfile(tutorId)
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [tutorId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-3 bg-surface border border-border rounded-3xl p-6 md:p-8">
        <RefreshCcw className="h-6 w-6 animate-spin text-text-muted" />
        <p className="text-[11px] font-black text-text-muted animate-pulse uppercase tracking-widest">Loading Tutor Profile</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-surface border border-border rounded-3xl p-6 md:p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <User size={28} className="text-red-400" />
        </div>
        <p className="text-sm font-bold text-text mb-1">Unable to Load Tutor</p>
        <p className="text-xs text-text-muted">Could not fetch tutor profile. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-3xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row gap-6 md:items-center">
        <div className="shrink-0">
          {profile.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt={profile.full_name}
              className="w-24 h-24 rounded-3xl object-cover shadow-xl rotate-3"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl rotate-3">
              <User size={48} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md">Instructor</span>
            {profile.tutor_rating && profile.tutor_rating >= 4.5 && <Award size={16} className="text-amber-500" />}
          </div>
          <h3 className="text-2xl font-black text-text tracking-tight">{profile.full_name}</h3>
          {profile.bio && <p className="text-text-muted font-medium tracking-tight">{profile.bio}</p>}
        </div>
        <button
          onClick={() => setMessageOpen(true)}
          className="shrink-0 flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-100 hover:-translate-y-0.5 active:translate-y-0"
        >
          <MessageCircle size={14} />
          Message
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border">
        <div className="flex flex-col items-center p-4 bg-bg-secondary rounded-2xl">
          <Users size={20} className="text-indigo-500 mb-2" />
          <span className="text-lg font-black text-text">{profile.student_rating ? `${(profile.student_rating * 10).toFixed(0)}k+` : 'N/A'}</span>
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-tighter">Students</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-bg-secondary rounded-2xl">
          <BookOpen size={20} className="text-indigo-500 mb-2" />
          <span className="text-lg font-black text-text">-</span>
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-tighter">Courses</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-bg-secondary rounded-2xl">
          <Star size={20} className="text-amber-500 mb-2" fill="currentColor" />
          <span className="text-lg font-black text-text">{profile.tutor_rating?.toFixed(1) || 'N/A'}</span>
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-tighter">Rating</span>
        </div>
        <div className="flex flex-col items-center p-4 bg-bg-secondary rounded-2xl">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-2">
            <CheckCircle2 size={12} strokeWidth={4} />
          </div>
          <span className="text-lg font-black text-text">Verified</span>
          <span className="text-[10px] uppercase font-bold text-text-muted tracking-tighter">Status</span>
        </div>
      </div>

      {profile.bio && (
        <div className="mt-8">
          <h4 className="text-sm font-black text-text uppercase tracking-widest mb-4">Biography</h4>
          <p className="text-text-secondary leading-relaxed text-sm">{profile.bio}</p>
        </div>
      )}

      <MessageTutorModal
        isOpen={messageOpen}
        onClose={() => setMessageOpen(false)}
        tutorName={profile.full_name}
        tutorId={profile.id}
        courseId={courseId!}
      />
    </div>
  );
}

