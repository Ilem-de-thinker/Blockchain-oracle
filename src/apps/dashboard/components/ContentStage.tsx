import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, MessageSquare, User, FileText, CheckCircle2, ChevronDown, Send, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import VideoPlayer from '@/components/ui/VideoPlayer';
import PDFViewer from '@/components/ui/PDFViewer';
import TiptapRenderer from '@/components/ui/TiptapRenderer';
import Reviews, { AboutTutor } from './ExtraSections';
import type { CourseMaterial, Course } from '@/src/api/courses';
import { notificationsApi } from '@/src/api/notifications';

interface ContentStageProps {
  material: CourseMaterial | undefined;
  course: Course;
  reviews: any[];
  onComplete: () => void;
  isCompleted: boolean;
  onSubmitReview: (rating: number, comment: string) => void;
  isSubmittingReview: boolean;
}

type TabType = 'content' | 'about' | 'message' | 'reviews';

export default function ContentStage({ material, course, reviews, onComplete, isCompleted, onSubmitReview, isSubmittingReview }: ContentStageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('content');
  const [isTabsExpanded, setIsTabsExpanded] = useState(false);

  const tabs = [
    { id: 'content', label: 'Lesson', icon: FileText },
    { id: 'about', label: 'About Tutor', icon: User },
    { id: 'message', label: 'Message Tutor', icon: Send },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab) || tabs[0];

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    setIsTabsExpanded(false);
  };
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);
  const [msgSent, setMsgSent] = useState(false);
  const [msgError, setMsgError] = useState('');

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle.trim() || !msgBody.trim() || !course.id) return;
    setIsSendingMsg(true);
    setMsgError('');
    try {
      await notificationsApi.notifyTutor({
        course_id: course.id,
        title: msgTitle.trim(),
        message: msgBody.trim(),
      });
      setMsgSent(true);
      setTimeout(() => {
        setMsgSent(false);
        setMsgTitle('');
        setMsgBody('');
        setMsgError('');
      }, 2000);
    } catch (err: any) {
      setMsgError(err?.response?.data?.detail || 'Failed to send message.');
    } finally {
      setIsSendingMsg(false);
    }
  };

  useEffect(() => {
    if (!material) return;
    setScrollProgress(0);
    setActiveTab('content');
    setIsTabsExpanded(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [material?.id]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !material || activeTab !== 'content' || material.type === 'video') return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable <= 0) {
        setScrollProgress(100);
        return;
      }
      const progress = (scrollTop / totalScrollable) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    const rafHandleScroll = () => requestAnimationFrame(handleScroll);

    const observer = new ResizeObserver(rafHandleScroll);
    observer.observe(container);

    container.addEventListener('scroll', handleScroll);
    requestAnimationFrame(() => handleScroll());
    return () => {
      container.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [material?.id, material?.type, activeTab]);

  const handleCompleteClick = () => {
    if (isCompleted) return;
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#10b981', '#f59e0b']
    });
    onComplete();
  };

  if (!material) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3 bg-bg">
        <RefreshCcw className="h-8 w-8 animate-spin text-text-muted" />
        <p className="text-[11px] font-black text-text-muted animate-pulse uppercase tracking-widest leading-none">
          Loading Material
        </p>
      </div>
    );
  }

  const renderContent = () => {
    switch (material.type) {
      case 'video':
        return <VideoPlayer url={material.url!} />;
      case 'pdf':
        if (material.url) {
          return <PDFViewer url={material.url} />;
        }
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8">
            <div className="w-20 h-20 rounded-2xl bg-surface-alt flex items-center justify-center mb-4">
              <FileText className="h-9 w-9 text-text-muted" />
            </div>
            <p className="text-sm font-bold text-text mb-1">Resource Not Found</p>
            <p className="text-xs text-text-muted max-w-xs">The document for this lesson is currently unavailable. Contact support if this issue persists.</p>
          </div>
        );
      case 'text':
        return <TiptapRenderer content={material.content!} />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted">Unknown material type</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto h-full flex flex-col items-center bg-bg relative selection:bg-indigo-100 selection:text-indigo-900 scroll-smooth"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={material.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex flex-col min-h-full"
        >
          <div className={`w-full flex flex-col flex-1 ${material.type === 'pdf' ? 'p-0' : 'p-4 md:p-8 md:max-w-5xl md:mx-auto'}`}>
            {material.type !== 'pdf' && (
              <>
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center gap-2 mb-1.5 md:mb-2">
                    <span className={`
                      px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider
                      ${material.type === 'video' ? 'bg-amber-100 text-amber-700' :
                        material.type === 'pdf' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}
                    `}>
                      {material.type} Lesson
                    </span>
                    {isCompleted && (
                      <div className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 size={12} className="text-emerald-600 md:size-[14px]" />
                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Completed</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-text tracking-tight leading-tight">
                    {material.title}
                  </h2>
                </div>

                {/* Responsive Tab Switcher */}
                <div className="mb-6 relative">
                  {/* Mobile/Tablet Collapsible Tabs */}
                  <div className="lg:hidden relative z-20">
                    <button
                      onClick={() => setIsTabsExpanded(!isTabsExpanded)}
                      className="w-full flex items-center justify-between p-4 bg-surface-alt border border-border rounded-2xl shadow-sm hover:border-indigo-200 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                          <activeTabData.icon size={18} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-text">
                          {activeTabData.label}
                        </span>
                      </div>
                      <ChevronDown size={20} className={`text-text-muted transition-transform duration-300 ${isTabsExpanded ? 'rotate-180 text-indigo-600' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {isTabsExpanded && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-30"
                        >
                          {tabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => handleTabChange(tab.id as TabType)}
                              className={`w-full flex items-center gap-3 p-4 transition-all ${
                                activeTab === tab.id 
                                  ? 'bg-indigo-50 text-indigo-600' 
                                  : 'text-text-muted hover:bg-surface-alt hover:text-text-secondary'
                              }`}
                            >
                              <tab.icon size={18} className={activeTab === tab.id ? 'text-indigo-600' : 'text-text-muted'} />
                              <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                              {activeTab === tab.id && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Desktop Tabs */}
                  <div className="hidden lg:flex items-center gap-1 border-b border-border px-1 shrink-0">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`py-3 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                          activeTab === tab.id 
                            ? 'border-indigo-600 text-indigo-600' 
                            : 'border-transparent text-text-muted hover:text-text-secondary'
                        }`}
                      >
                        <tab.icon size={14} /> {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className={`w-full flex flex-col ${material.type === 'pdf' ? 'flex-1' : 'flex-1 mb-10'}`}>
              <AnimatePresence mode="wait">
                {activeTab === 'content' && (
                  <motion.div
                    key="tab-content"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="w-full flex-1 flex flex-col"
                  >
                    {renderContent()}
                  </motion.div>
                )}
                {activeTab === 'about' && (
                  <motion.div
                    key="tab-about"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="w-full flex-1"
                  >
                    <AboutTutor tutorId={course.tutor?.id} courseId={course.id} />
                  </motion.div>
                )}
                {activeTab === 'message' && (
                  <motion.div
                    key="tab-message"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="w-full flex-1"
                  >
                    <div className="bg-surface border border-border rounded-3xl p-6 md:p-8">
                      <h3 className="text-lg font-black text-text mb-1">Message Tutor</h3>
                      <p className="text-sm text-text-muted mb-6">
                        Send a message to {course.tutor?.full_name || 'your tutor'} about this course.
                      </p>

                      {msgSent ? (
                        <div className="flex flex-col items-center justify-center gap-3 py-12">
                          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Send size={24} className="text-emerald-600" />
                          </div>
                          <p className="font-bold text-text text-sm">Message Sent!</p>
                          <p className="text-xs text-text-muted text-center">
                            Your message has been delivered to {course.tutor?.full_name || 'the tutor'}.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleSendMessage} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Subject</label>
                            <input
                              type="text"
                              required
                              value={msgTitle}
                              onChange={e => setMsgTitle(e.target.value)}
                              placeholder="What is this about?"
                              className="w-full p-4 bg-bg-secondary border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm font-medium"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-text-muted ml-1">Message</label>
                            <textarea
                              required
                              value={msgBody}
                              onChange={e => setMsgBody(e.target.value)}
                              placeholder={`Ask about the course, scheduling, or anything else...`}
                              rows={5}
                              className="w-full p-4 bg-bg-secondary border border-border rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none text-sm font-medium"
                            />
                          </div>

                          {msgError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2">
                              <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                              <p className="text-xs font-medium text-red-700">{msgError}</p>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={!msgTitle.trim() || !msgBody.trim() || isSendingMsg}
                            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                              msgTitle.trim() && msgBody.trim() && !isSendingMsg
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0'
                                : 'bg-surface-alt text-text-muted cursor-not-allowed'
                            }`}
                          >
                            {isSendingMsg ? 'Sending...' : <><Send size={14} /> Send Message</>}
                          </button>
                        </form>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    key="tab-reviews"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="w-full flex-1"
                  >
                    <Reviews
                      reviews={reviews}
                      onSubmitReview={onSubmitReview}
                      isSubmittingReview={isSubmittingReview}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {activeTab === 'content' && (
              <div className="mt-auto py-10 flex flex-col items-center gap-4 border-t border-border">
                <div className="flex flex-col items-center gap-3 mb-4 w-full max-w-xs">
                  {material.type !== 'video' && (
                    <>
                      <div className="flex items-center justify-between w-full text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <span>Reading Progress</span>
                        <span>{Math.round(scrollProgress)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${scrollProgress}%` }}
                          className="h-full bg-emerald-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                <motion.button
                  whileHover={!isCompleted ? { translateY: -2, scale: 1.02 } : {}}
                  whileTap={!isCompleted ? { translateY: 0, scale: 0.98 } : {}}
                  onClick={handleCompleteClick}
                  disabled={isCompleted}
                  className={`
                    px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-3
                    ${isCompleted
                      ? 'bg-emerald-100 text-emerald-600 cursor-default border border-emerald-200'
                      : 'bg-emerald-500 text-white shadow-[0_4px_0_#059669] hover:bg-emerald-400 active:translate-y-1 active:shadow-none'
                    }
                  `}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={18} strokeWidth={3} />
                      Completed
                    </>
                  ) : (
                    'Mark as Complete'
                  )}
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
