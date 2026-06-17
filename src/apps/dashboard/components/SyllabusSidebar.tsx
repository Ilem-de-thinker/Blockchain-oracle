import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, Lock, Video, FileText, Type, ChevronDown, Sparkles, X, ClipboardList, TriangleAlert, User, Send, Star, AlertCircle, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CourseModule, CourseMaterial, Course } from '@/src/api/courses';
import type { QuizResult } from '@/src/api/quizzes';
import type { Review } from '@/src/api/reviews';
import { useToast } from '@/src/hooks/useToast';
import { certificatesApi } from '@/src/api/certificates';

type MaterialType = 'video' | 'pdf' | 'text';

interface ModuleAccessItem {
  id: number;
  module_id?: number;
  is_locked: boolean;
  access_threshold?: number;
}

interface SyllabusSidebarProps {
  modules: CourseModule[];
  materials: CourseMaterial[];
  currentMaterialId: number;
  completedMaterialIds: number[];
  onMaterialSelect: (material: CourseMaterial) => void;
  isOpen: boolean;
  onClose?: () => void;
  quizResults?: QuizResult[];
  moduleAccess?: ModuleAccessItem[];
  enrollment?: {
    id: number;
    installment_plan: string;
    amount_paid: string;
    balance_remaining: string;
  } | null;
  course?: Course | null;
  reviews?: Review[];
  onSubmitReview?: (rating: number, comment: string) => void;
  isSubmittingReview?: boolean;
}

const MaterialIcon = ({ type }: { type: MaterialType }) => {
  switch (type) {
    case 'video': return <Video size={16} />;
    case 'pdf': return <FileText size={16} />;
    case 'text': return <Type size={16} />;
    default: return <FileText size={16} />;
  }
};

export default function SyllabusSidebar({ modules, materials, currentMaterialId, completedMaterialIds, onMaterialSelect, isOpen, onClose, quizResults, moduleAccess, enrollment, course, reviews, onSubmitReview, isSubmittingReview }: SyllabusSidebarProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const { id: courseId } = useParams<{ id: string }>();
  const [expandedModules, setExpandedModules] = React.useState<number[]>(() => {
    if (!courseId) return [];
    try {
      const saved = localStorage.getItem(`course_sidebar_modules_${courseId}`);
      return saved ? (JSON.parse(saved) as number[]) : [];
    } catch {
      return [];
    }
  });
  const [isPrintingCert, setIsPrintingCert] = React.useState(false);

  React.useEffect(() => {
    if (!courseId) return;
    try {
      localStorage.setItem(`course_sidebar_modules_${courseId}`, JSON.stringify(expandedModules));
    } catch { /* quota exceeded */ }
  }, [expandedModules, courseId]);

  const isModuleLocked = (moduleId: number): boolean => {
    if (!moduleAccess) return false;
    const access = moduleAccess.find(m => (m.id ?? m.module_id) === moduleId);
    return access?.is_locked ?? false;
  };

  const isPrereqLocked = (materialId: number): boolean => {
    const idx = materials.findIndex(m => m.id === materialId);
    if (idx <= 0) return false;
    const prev = materials[idx - 1];
    return !completedMaterialIds.includes(prev.id) && !prev.is_completed;
  };

  const handleMaterialClick = (material: CourseMaterial, moduleId: number) => {
    if (isModuleLocked(moduleId)) {
      toast.warning('This module requires additional payment. Please clear your balance.');
      return;
    }
    if (isPrereqLocked(material.id)) {
      toast.warning('Complete the previous lesson first.');
      return;
    }
    onMaterialSelect(material);
  };

  React.useEffect(() => {
    const parentModule = modules.find(m => m.materials?.some(l => l.id === currentMaterialId));
    if (parentModule && !expandedModules.includes(parentModule.id)) {
      setExpandedModules(prev => [...prev, parentModule.id]);
    }
  }, [currentMaterialId, modules]);

  const toggleModule = (id: number) => {
    setExpandedModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handlePrintCertificate = async () => {
    if (!enrollment?.id) return;
    setIsPrintingCert(true);
    try {
      await certificatesApi.downloadEnrollmentCertificate(enrollment.id);
      toast.success('Certificate downloaded!');
    } catch {
      toast.error('Failed to download certificate');
    } finally {
      setIsPrintingCert(false);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{
        width: isOpen ? (typeof window !== 'undefined' && window.innerWidth < 1024 ? '100%' : '380px') : '0px',
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className={`
        bg-surface border-l border-border overflow-hidden flex flex-col z-40
        ${isOpen && typeof window !== 'undefined' && window.innerWidth < 1024 ? 'fixed top-14 right-0 bottom-[5rem] shadow-2xl' : 'h-full relative'}
      `}
    >
      <div className="p-5 md:p-6 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-black text-text tracking-tight flex items-center gap-2">
            Course Syllabus
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] uppercase tracking-widest rounded-full">{modules.length} Modules</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">Sticking to your daily goal!</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-surface-hover rounded-xl text-text-muted"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {modules.map((module, idx) => {
          const isExpanded = expandedModules.includes(module.id);

          return (
            <div key={module.id} className="space-y-1">
              <button
                onClick={() => toggleModule(module.id)}
                className={`w-full flex items-center gap-2 px-1 py-2 group transition-colors ${isExpanded ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Section {idx + 1}</span>
                {isModuleLocked(module.id) && (
                  <Lock size={12} className="text-amber-500" />
                )}
                <div className="h-[1px] flex-1 bg-border"></div>
                <motion.div
                  animate={{ rotate: isExpanded ? 0 : -90 }}
                  transition={{ duration: 0.2 }}
                  className="text-text-muted"
                >
                  <ChevronDown size={14} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-1"
                  >
                    {isModuleLocked(module.id) ? (
                      <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/50">
                        <div className="flex items-center gap-2 text-amber-700">
                          <TriangleAlert size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            Payment Required — Pay balance to unlock
                          </span>
                        </div>
                      </div>
                    ) : (
                      module.materials?.map((material) => {
                        const isActive = currentMaterialId === material.id;
                        const isCompleted = completedMaterialIds.includes(material.id);
                        const isPaymentLocked = isModuleLocked(module.id);
                        const isPrereqLockedState = !isPaymentLocked && !isCompleted && !isActive && isPrereqLocked(material.id);
                        const isLocked = isPaymentLocked || isPrereqLockedState;

                        return (
                          <button
                            key={material.id}
                            onClick={() => handleMaterialClick(material, module.id)}
                            className={`
                              w-full flex items-center gap-3 p-3 rounded-2xl transition-all group
                              ${isActive
                                ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 shadow-sm'
                                : isCompleted ? 'hover:bg-emerald-50/50' : isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface-hover'
                              }
                            `}
                          >
                            <div className="shrink-0 relative">
                              {isCompleted ? (
                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-[0_2px_0_#10b981]">
                                  <CheckCircle2 size={16} strokeWidth={3} />
                                </div>
                              ) : isActive ? (
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-[0_2px_0_#4338ca]">
                                  <Circle size={12} strokeWidth={3} className="fill-white" />
                                </div>
                              ) : isPaymentLocked ? (
                                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-200">
                                  <Lock size={12} />
                                </div>
                              ) : isPrereqLockedState ? (
                                <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-text-muted border border-border">
                                  <Lock size={12} />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-surface-alt flex items-center justify-center text-text-muted border border-border">
                                  <MaterialIcon type={material.type} />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <MaterialIcon type={material.type} />
                                <span className="text-[9px] font-bold uppercase tracking-wider text-text-muted">{material.type}</span>
                                {isPaymentLocked && (
                                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-100">Locked</span>
                                )}
                              </div>
                              <p className={`text-sm font-bold tracking-tight truncate ${isActive ? 'text-indigo-900' : isLocked ? 'text-text-muted' : 'text-text-secondary'}`}>
                                {material.title}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}

                    {!isModuleLocked(module.id) && (() => {
                      const modQuizId = module.quiz_id ?? module.quizzes?.[0]?.id;
                      const modQuizTitle = module.quizzes?.[0]?.title ?? 'Module Quiz';
                      if (!modQuizId) return null;

                      const allMaterialsCompleted = module.materials?.every(m =>
                        completedMaterialIds.includes(m.id) || !!m.is_completed
                      ) ?? true;

                      // Per improvement plan: Quiz button only appears after all materials are completed
                      if (!allMaterialsCompleted) return null;

                      const hasHistory = quizResults?.some(r => r.quiz === modQuizId) ?? false;
                      return (
                        <button
                          onClick={() => navigate(`/dashboard/course/${courseId}/quiz/${modQuizId}`)}
                          className="w-full flex items-center gap-3 p-3 rounded-2xl transition-all mt-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700"
                        >
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                            <ClipboardList size={16} />
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-bold tracking-tight">{modQuizTitle}</p>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-500">
                              {hasHistory ? 'Review Quiz' : 'Take Quiz'}
                            </span>
                          </div>
                        </button>
                      );
                    })()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Course Info Sections */}
      {course && (
        <ExpandableCourseSections
          course={course}
          reviews={reviews || []}
          onSubmitReview={onSubmitReview}
          isSubmittingReview={isSubmittingReview}
        />
      )}

      <div className="p-4 border-t border-border shrink-0">
        {(() => {
          const totalMaterials = modules.reduce((sum, m) => sum + (m.materials?.length || 0), 0);
          const completedCount = completedMaterialIds.length;
          const progressPct = totalMaterials > 0 ? Math.min(Math.round((completedCount / totalMaterials) * 100), 100) : 0;
          const allComplete = totalMaterials > 0 && completedCount >= totalMaterials;
          return (
            <div className={cn(
              "rounded-2xl p-4 flex items-start gap-3 shadow-sm border",
              allComplete
                ? "bg-gradient-to-br from-emerald-50 to-white border-emerald-200"
                : "bg-gradient-to-br from-indigo-50 to-white border-indigo-100"
            )}>
              <div className={cn(
                "p-2 rounded-xl",
                allComplete ? "bg-emerald-100 text-emerald-600" : "bg-indigo-100 text-indigo-600"
              )}>
                {allComplete ? <CheckCircle2 size={18} /> : <Sparkles size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[11px] leading-tight font-black uppercase tracking-tight mb-1",
                  allComplete ? "text-emerald-700" : "text-indigo-700"
                )}>
                  {allComplete ? 'Certificate Earned' : 'Unlocking Success'}
                </p>
                <p className={cn(
                  "text-[11px] leading-snug font-medium",
                  allComplete ? "text-emerald-600/80" : "text-indigo-600/80"
                )}>
                  {allComplete ? (
                    <>You earned your <b>Official Certificate</b>!</>
                  ) : (
                    <>Complete all lessons to earn your <b>Official Certificate</b></>
                  )}
                </p>
                {totalMaterials > 0 && (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className={allComplete ? "text-emerald-600" : "text-indigo-600"}>{progressPct}%</span>
                      <span className="text-text-muted">{completedCount}/{totalMaterials} lessons</span>
                    </div>
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        className={cn("h-full rounded-full", allComplete ? "bg-emerald-500" : "bg-indigo-500")}
                      />
                    </div>
                  </div>
                )}
                {allComplete && enrollment?.id && (
                  <button
                    onClick={handlePrintCertificate}
                    disabled={isPrintingCert}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <Award size={14} />
                    {isPrintingCert ? 'Downloading...' : 'Print Certificate'}
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </motion.div>
  );
}

function ExpandableCourseSections({
  course,
  reviews,
  onSubmitReview,
  isSubmittingReview,
}: {
  course: Course;
  reviews: Review[];
  onSubmitReview?: (rating: number, comment: string) => void;
  isSubmittingReview?: boolean;
}) {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [msgTitle, setMsgTitle] = React.useState('');
  const [msgBody, setMsgBody] = React.useState('');
  const [isSendingMsg, setIsSendingMsg] = React.useState(false);
  const [msgSent, setMsgSent] = React.useState(false);
  const [msgError, setMsgError] = React.useState('');
  const { id: courseId } = useParams<{ id: string }>();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle.trim() || !msgBody.trim() || !courseId) return;
    setIsSendingMsg(true);
    setMsgError('');
    try {
      const { notificationsApi } = await import('@/src/api/notifications');
      await notificationsApi.notifyTutor({
        course_id: parseInt(courseId),
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

  const sections = [
    {
      id: 'about',
      icon: User,
      label: 'About Tutor',
      content: (
        <div className="px-3 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-lg font-bold">
              {course.tutor?.full_name?.[0] || 'T'}
            </div>
            <div>
              <p className="text-sm font-bold text-text">{course.tutor?.full_name || 'Tutor'}</p>
              <p className="text-[10px] text-text-muted font-medium">{course.tutor?.email || ''}</p>
            </div>
          </div>
          {course.tutor?.bio && (
            <p className="text-xs text-text-secondary leading-relaxed">{course.tutor.bio}</p>
          )}
        </div>
      ),
    },
    {
      id: 'message',
      icon: Send,
      label: 'Message Tutor',
      content: (
        <div className="px-3 py-4">
          {msgSent ? (
            <div className="flex flex-col items-center justify-center gap-2 py-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <Send size={20} className="text-emerald-600" />
              </div>
              <p className="text-sm font-bold text-text">Message Sent!</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-3">
              <input
                type="text"
                required
                value={msgTitle}
                onChange={e => setMsgTitle(e.target.value)}
                placeholder="Subject"
                className="w-full p-3 bg-bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-xs font-medium"
              />
              <textarea
                required
                value={msgBody}
                onChange={e => setMsgBody(e.target.value)}
                placeholder="Your message..."
                rows={4}
                className="w-full p-3 bg-bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-xs font-medium"
              />
              {msgError && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-medium text-red-700">{msgError}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={!msgTitle.trim() || !msgBody.trim() || isSendingMsg}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSendingMsg ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      ),
    },
    {
      id: 'reviews',
      icon: Star,
      label: 'Reviews',
      content: (
        <div className="px-3 py-4 space-y-4 max-h-64 overflow-y-auto">
          {reviews.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">No reviews yet. Be the first!</p>
          ) : (
            reviews.map((review, i) => (
              <div key={review.id || i} className="pb-3 border-b border-border last:border-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={10}
                        className={s < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-text-muted">
                    {review.user?.full_name || 'Anonymous'}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
          {onSubmitReview && (
            <ReviewForm onSubmit={onSubmitReview} isSubmitting={!!isSubmittingReview} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="border-t border-border">
      {sections.map((section) => {
        const isOpen = expanded === section.id;
        const Icon = section.icon;
        return (
          <div key={section.id}>
            <button
              onClick={() => setExpanded(isOpen ? null : section.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-hover transition-colors"
            >
              <Icon size={16} className="text-text-muted shrink-0" />
              <span className="text-xs font-bold tracking-wide text-text-secondary flex-1 text-left">
                {section.label}
              </span>
              <ChevronDown
                size={14}
                className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {section.content}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function ReviewForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (rating: number, comment: string) => void;
  isSubmitting: boolean;
}) {
  const [rating, setRating] = React.useState(0);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [comment, setComment] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) return;
    onSubmit(rating, comment.trim());
    setRating(0);
    setComment('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i + 1)}
            onMouseEnter={() => setHoveredRating(i + 1)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5"
          >
            <Star
              size={16}
              className={(hoveredRating || rating) > i ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
            />
          </button>
        ))}
      </div>
      <textarea
        required
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Write your review..."
        rows={3}
        className="w-full p-3 bg-bg-secondary border border-border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none text-xs font-medium"
      />
      <button
        type="submit"
        disabled={rating === 0 || !comment.trim() || isSubmitting}
        className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
