import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, AlertCircle } from 'lucide-react';
import { notificationsApi } from '../src/api/notifications';

interface MessageTutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorName: string;
  tutorId: number;
  courseId: number;
}

export default function MessageTutorModal({ isOpen, onClose, tutorName, tutorId, courseId }: MessageTutorModalProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setIsSending(true);
    setError('');
    try {
      await notificationsApi.notifyTutor({
        course_id: courseId,
        title: title.trim(),
        message: message.trim(),
      });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setTitle('');
        setMessage('');
        setError('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-surface rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-indigo-600 p-6 text-white">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Message to {tutorName}</h3>
                    <p className="text-xs text-indigo-200">Typically replies within 24 hours</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {sent ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Send size={24} className="text-emerald-600" />
                </div>
                <p className="font-bold text-text text-sm">Message Sent!</p>
                <p className="text-xs text-text-muted text-center">Your message has been delivered to {tutorName}.</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Subject</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="What is this about?"
                      className="w-full p-4 bg-bg-secondary border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Message</label>
                    <textarea
                      required
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder={`Ask ${tutorName} about the course, scheduling, or anything else...`}
                      rows={5}
                      className="w-full p-4 bg-bg-secondary border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none text-sm font-medium"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!title.trim() || !message.trim() || isSending}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    title.trim() && message.trim() && !isSending
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0'
                      : 'bg-surface-alt text-text-muted cursor-not-allowed'
                  }`}
                >
                  {isSending ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
