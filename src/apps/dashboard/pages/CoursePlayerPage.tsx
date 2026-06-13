import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, BookOpen, RefreshCcw, PlayCircle, Clock, Star, Award, Shield, CheckCircle, Video, FileText, TriangleAlert } from 'lucide-react';
import { coursesApi } from '@/src/api/courses';
import type { Course, CourseMaterial, CourseModule, EnrollmentListItem } from '@/src/api/courses';
import { quizzesApi, QuizAnswer, QuizResult } from '@/src/api/quizzes';
import { reviewsApi, Review } from '@/src/api/reviews';
import { progressApi, CourseProgressDetail } from '@/src/api/progress';
import { useToast } from '@/src/hooks/useToast';
import { getErrorMessage } from '@/src/api/errorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatNaira } from '@/lib/money';

import CoursePlayerShell from '../components/CoursePlayerShell';
import SyllabusSidebar from '../components/SyllabusSidebar';
import ContentStage from '../components/ContentStage';
import QuizView from '../components/QuizView';

export default function CoursePlayerPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [accessibleModules, setAccessibleModules] = useState<CourseModule[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [activeMaterialIndex, setActiveMaterialIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return localStorage.getItem('course_player_sidebar_open') === 'true';
    } catch {
      return false;
    }
  });
  const [enrollment, setEnrollment] = useState<EnrollmentListItem | null>(null);
  const [moduleAccess, setModuleAccess] = useState<any>(null);
  const [installmentPlan, setInstallmentPlan] = useState<'FULL' | '20' | '40' | '60'>('FULL');
  const [courseProgress, setCourseProgress] = useState<CourseProgressDetail | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<{ id: number; text: string; options: { id?: number; text: string }[] }[]>([]);
  const [activeAttemptId, setActiveAttemptId] = useState<number | null>(null);
  const [quizTimeLimit, setQuizTimeLimit] = useState(600);

  const courseId = useMemo(() => {
    const parsed = parseInt(id || '');
    return isNaN(parsed) ? null : parsed;
  }, [id]);

  const persistKey = useMemo(() => `course_player_material_id_${courseId ?? 0}`, [courseId]);

  useEffect(() => {
    if (!courseId || materials.length === 0) return;
    try {
      const savedId = localStorage.getItem(persistKey);
      if (savedId !== null) {
        const materialId = JSON.parse(savedId);
        const index = materials.findIndex(m => m.id === materialId);
        if (index !== -1) {
          setActiveMaterialIndex(index);
        }
      }
    } catch { /* invalid json */ }
  }, [courseId, persistKey, materials]);

  useEffect(() => {
    try {
      localStorage.setItem('course_player_sidebar_open', JSON.stringify(sidebarOpen));
    } catch { /* quota exceeded */ }
  }, [sidebarOpen]);

  const saveActiveMaterialId = useCallback((index: number) => {
    if (!courseId || !materials[index]) return;
    try {
      localStorage.setItem(persistKey, JSON.stringify(materials[index].id));
    } catch { /* quota exceeded */ }
  }, [courseId, persistKey, materials]);

  const isMaterialAccessible = useCallback((materialId: number): boolean => {
    const idx = materials.findIndex(m => m.id === materialId);
    if (idx <= 0) return true; // first material or not found — always accessible
    const prevMaterial = materials[idx - 1];
    return completedLessons.includes(prevMaterial.id) || !!prevMaterial.is_completed;
  }, [materials, completedLessons]);

  const flattenMaterials = useCallback((modules: CourseModule[]) => {
    const all: CourseMaterial[] = [];
    // Sort modules by order first
    const sortedModules = [...modules].sort((a, b) => a.order - b.order);
    
    sortedModules.forEach((mod) => {
      // Sort materials within each module by their order
      const sortedMats = [...(mod.materials || [])].sort((a, b) => a.order - b.order);
      sortedMats.forEach((mat) => {
        all.push({ ...mat, course: mat.course ?? courseId ?? 0, module: mat.module ?? mod.id });
      });
    });
    return all;
  }, [courseId]);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const courseData = await coursesApi.getCourse(courseId);
      setCourse(courseData);
    } catch (error) {
      console.error('Failed to fetch course:', error);
      toast.error('Failed to load course details');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, toast]);

  const refreshEnrolledState = useCallback(async () => {
    if (!courseId) return;
    const [modulesData, progressData, results] = await Promise.all([
      coursesApi.getModules(courseId).catch(() => [] as CourseModule[]),
      coursesApi.getCourseProgress(courseId).catch(() => null),
      quizzesApi.getMyQuizResults().catch(() => [] as QuizResult[]),
    ]);

    setAccessibleModules(modulesData);
    const flattenedMaterials = flattenMaterials(modulesData);
    setMaterials(flattenedMaterials);

    const completedFromApi = new Set<number>();
    for (const material of flattenedMaterials) {
      if (material.is_completed) completedFromApi.add(material.id);
    }
    for (const mod of modulesData) {
      if (mod.is_completed && mod.materials) {
        for (const material of mod.materials) {
          completedFromApi.add(material.id);
        }
      }
    }
    setCompletedLessons((prev) => {
      const merged = new Set([...prev, ...completedFromApi]);
      return Array.from(merged);
    });

    setCourseProgress(progressData as unknown as CourseProgressDetail);
    setQuizResults(results);
  }, [courseId, flattenMaterials]);

  const checkEnrollment = useCallback(async () => {
    if (!courseId) return;
    try {
      const enrollments = await coursesApi.getEnrollments();
      const userEnrollment = enrollments.results.find((e: any) => {
        const eCourseId = typeof e.course === 'number' ? e.course : e.course?.id;
        return eCourseId === courseId;
      });

      if (userEnrollment) {
        setIsEnrolled(true);
        setEnrollment(userEnrollment as EnrollmentListItem);

        try {
          const accessData = await coursesApi.getModuleAccessStatus(userEnrollment.id);
          setModuleAccess(accessData);
        } catch (e) {
          console.error('Failed to fetch module access:', e);
        }

        await refreshEnrolledState();
      } else {
        setIsEnrolled(false);
        setEnrollment(null);
        setModuleAccess(null);
        setAccessibleModules([]);
        setMaterials([]);
        setCompletedLessons([]);
        setCourseProgress(null);
      }
    } catch (error) {
      console.error('Failed to check enrollment:', error);
    }
  }, [courseId, refreshEnrolledState]);

  const fetchReviews = useCallback(async () => {
    if (!courseId) return;
    try {
      const results = await reviewsApi.getCourseReviews(courseId, { page_size: 50 });
      setReviews(results);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      checkEnrollment();
      fetchReviews();
    }
  }, [courseId, fetchCourseData, checkEnrollment, fetchReviews]);

  const handleEnroll = async () => {
    if (!courseId) return;
    setIsEnrolling(true);
    try {
      const callbackUrl = `${window.location.origin}/dashboard/payment/verify`;
      const response = await coursesApi.enroll(courseId, installmentPlan, referralCode || undefined, callbackUrl);
      if (typeof response === 'object' && response !== null && 'authorization_url' in response) {
        window.location.href = response.authorization_url as string;
      } else {
        toast.success('Successfully enrolled!');
        setIsEnrolled(true);
        await checkEnrollment();
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!currentMaterial) return;
    if (completedLessons.includes(currentMaterial.id) || currentMaterial.is_completed) return;

    setCompletedLessons((prev) => [...prev, currentMaterial.id]);

    try {
      const result = await progressApi.markMaterialComplete(currentMaterial.id);
      await Promise.all([
        refreshEnrolledState(),
        fetchCourseData(),
      ]);
      toast.success(
        result.course_completed
          ? 'Course completed.'
          : result.module_completed
          ? 'Material saved. Module completed.'
          : result.detail || 'Material marked as completed.'
      );
    } catch (error) {
      setCompletedLessons((prev) => prev.filter((id) => id !== currentMaterial.id));
      toast.error('Failed to update progress');
    }
  };

  const currentMaterial = useMemo(() => materials[activeMaterialIndex], [materials, activeMaterialIndex]);

  const progressPercentage = useMemo(() => {
    if (courseProgress?.progress_percentage !== undefined) {
      return Math.round(courseProgress.progress_percentage);
    }
    if (materials.length > 0) {
      return Math.round((completedLessons.length / materials.length) * 100);
    }
    return 0;
  }, [completedLessons.length, courseProgress?.progress_percentage, materials.length]);

  const getModuleQuizId = useCallback((module?: CourseModule | null) => {
    if (!module) return null;
    return module.quizzes?.[0]?.id ?? module.quiz_id ?? null;
  }, []);

  const getLatestQuizResult = (quizId?: number | null) => {
    if (!quizId) return null;
    return (
      quizResults
        .filter((result) => result.quiz === quizId)
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0] || null
    );
  };

  const handleStartQuiz = async (quizId: number) => {
    try {
      setQuizLoading(true);
      const quiz = await quizzesApi.getQuiz(quizId);
      const attempt = await quizzesApi.startQuizAttempt(quizId);
      setQuizTitle(quiz.title);
      setQuizQuestions(
        (attempt.selected_questions || []).map((q: any) => ({
          id: q.id ?? 0,
          text: q.text ?? '',
          options: (q.options || []).map((o: any) => ({ id: o.id, text: o.text })),
        }))
      );
      setActiveAttemptId(attempt.id);
      setQuizTimeLimit(600);
      setActiveQuizId(quizId);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to start quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSubmitQuiz = async (answers: { question_id: number; option_id: number }[]) => {
    if (!activeAttemptId) return;
    try {
      setQuizLoading(true);
      const result = await quizzesApi.submitQuizAttempt(activeAttemptId, answers as QuizAnswer[]);
      await Promise.all([
        refreshEnrolledState(),
        fetchCourseData(),
      ]);
      toast.success(`Quiz completed! Score: ${result.score}%`);
      setActiveQuizId(null);
      setActiveAttemptId(null);
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to submit quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleExitQuiz = () => {
    setActiveQuizId(null);
    setActiveAttemptId(null);
  };

  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!courseId) return;
    setIsSubmittingReview(true);
    try {
      await reviewsApi.createReview(courseId, {
        rating,
        title: course?.title || '',
        content: comment,
        comment,
      });
      toast.success('Review submitted successfully!');
      fetchReviews();
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handlePayBalance = async () => {
    if (!enrollment?.id) return;
    try {
      const response = await coursesApi.payBalance(enrollment.id);
      if (response.authorization_url) {
        window.location.href = response.authorization_url;
      } else {
        toast.success('Balance paid successfully!');
        await checkEnrollment();
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error) || 'Failed to initiate balance payment');
    }
  };

  const handleMaterialSelect = (material: CourseMaterial) => {
    // 1. Prerequisite check — previous material must be completed
    if (!isMaterialAccessible(material.id)) {
      toast.warning('Complete the previous lesson first.');
      return;
    }

    // 2. Payment-lock check (existing)
    const parentModule = accessibleModules.find(m =>
      m.materials?.some(mat => mat.id === material.id)
    );
    if (parentModule && moduleAccess) {
      const access = moduleAccess.modules?.find((m: any) => m.id === parentModule.id);
      if (access?.is_locked) {
        toast.warning('This module requires additional payment. Please clear your balance.');
        return;
      }
    }

    // 3. Navigate to material
    const index = materials.findIndex(m => m.id === material.id);
    if (index !== -1) {
      setActiveMaterialIndex(index);
      saveActiveMaterialId(index);
    }
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleExit = () => {
    window.history.back();
  };

  // Keyboard Shortcuts
  const isQuizMode = activeQuizId !== null;

  useEffect(() => {
    if (isQuizMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'b':
        case 's':
          e.preventDefault();
          setSidebarOpen(prev => !prev);
          break;
        case 'f':
          e.preventDefault();
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
          break;
        case 'n':
        case 'arrowright':
          e.preventDefault();
          if (activeMaterialIndex < materials.length - 1) {
            const nextIndex = activeMaterialIndex + 1;
            const nextMaterial = materials[nextIndex];
            if (isMaterialAccessible(nextMaterial.id)) {
              setActiveMaterialIndex(nextIndex);
              saveActiveMaterialId(nextIndex);
            } else {
              toast.warning('Complete the current lesson first.');
            }
          }
          break;
        case 'p':
        case 'arrowleft':
          e.preventDefault();
          if (activeMaterialIndex > 0) {
            const prevIndex = activeMaterialIndex - 1;
            setActiveMaterialIndex(prevIndex);
            saveActiveMaterialId(prevIndex);
          }
          break;
        case ' ':
        case 'k':
          const video = document.querySelector('video');
          if (video) {
            e.preventDefault();
            if (video.paused) video.play();
            else video.pause();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMaterialIndex, materials, isQuizMode, saveActiveMaterialId, isMaterialAccessible]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary/40" />
        <p className="text-[11px] font-black text-slate-400 animate-pulse uppercase tracking-widest leading-none">
          Initializing Stream
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mb-4 border border-slate-200">
          <BookOpen className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Module Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The technical specifications for this course are unavailable.</p>
        <Link to="/dashboard/courses" className="mt-8">
          <Button variant="outline" size="sm" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest">
            <ChevronLeft className="h-3 w-3 mr-2" /> Academic Portal
          </Button>
        </Link>
      </div>
    );
  }

  if (activeQuizId) {
    return (
      <QuizView
        title={quizTitle}
        timeLimitSeconds={quizTimeLimit}
        questions={quizQuestions}
        onSubmit={handleSubmitQuiz}
        onExit={handleExitQuiz}
        isSubmitting={quizLoading}
      />
    );
  }

  return (
    <div className="h-full w-full bg-bg">
      <CoursePlayerShell
        courseTitle={course.title}
        progress={progressPercentage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onExit={handleExit}
      >
        <div className="flex h-full w-full relative">
          <AnimatePresence>
            {sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 1024 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
              />
            )}
          </AnimatePresence>

          <main className="flex-1 overflow-hidden">
            {!isEnrolled ? (
              <UnenrolledView
                course={course}
                materialsCount={materials.length}
                handleEnroll={handleEnroll}
                isEnrolling={isEnrolling}
                referralCode={referralCode}
                setReferralCode={setReferralCode}
                reviews={reviews}
                courseId={courseId}
                installmentPlan={installmentPlan}
                setInstallmentPlan={setInstallmentPlan}
              />
            ) : (
              <div className="h-full flex flex-col overflow-hidden">
                {enrollment && Number(enrollment.balance_remaining || 0) > 0 && (
                  <div className="shrink-0 mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <TriangleAlert size={16} className="text-amber-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                            Outstanding Balance
                          </p>
                          <p className="text-sm font-bold text-amber-800">
                            {formatNaira(enrollment.balance_remaining)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={handlePayBalance}
                        className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl h-9 px-4"
                      >
                        Pay Now
                      </Button>
                    </div>
                  </div>
                )}
                <div className="flex flex-col flex-1 overflow-hidden">
                  <ContentStage
                    material={currentMaterial}
                    course={course}
                    reviews={reviews}
                    onComplete={handleMarkComplete}
                    isCompleted={currentMaterial ? (completedLessons.includes(currentMaterial.id) || !!currentMaterial.is_completed) : false}
                    onSubmitReview={handleSubmitReview}
                    isSubmittingReview={isSubmittingReview}
                  />
                </div>
              </div>
            )}
          </main>

          <SyllabusSidebar
            modules={isEnrolled ? accessibleModules : (course.modules || [])}
            materials={materials}
            currentMaterialId={currentMaterial?.id ?? 0}
            completedMaterialIds={completedLessons}
            onMaterialSelect={handleMaterialSelect}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            quizResults={quizResults}
            moduleAccess={moduleAccess?.modules}
            enrollment={enrollment}
            course={course}
            reviews={reviews}
            onSubmitReview={handleSubmitReview}
            isSubmittingReview={isSubmittingReview}
          />
        </div>
      </CoursePlayerShell>
    </div>
  );
}

function UnenrolledView({
  course,
  materialsCount,
  handleEnroll,
  isEnrolling,
  referralCode,
  setReferralCode,
  reviews,
  courseId,
  installmentPlan,
  setInstallmentPlan,
}: {
  course: Course;
  materialsCount: number;
  handleEnroll: () => void;
  isEnrolling: boolean;
  referralCode: string;
  setReferralCode: (code: string) => void;
  reviews: Review[];
  courseId: number | null;
  installmentPlan: string;
  setInstallmentPlan: (plan: 'FULL' | '20' | '40' | '60') => void;
}) {
  const avgRating = course.average_rating || 0;
  const totalModules = course.modules?.length || 0;

  const levelColors: Record<string, string> = {
    Beginner: 'bg-emerald-100 text-emerald-700',
    Intermediate: 'bg-amber-100 text-amber-700',
    Advanced: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-surface rounded-3xl border border-border overflow-hidden shadow-sm">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Left: Thumbnail */}
            <div className="h-full min-h-[320px] relative">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <span className="text-white/20 text-8xl font-black">{course.title?.charAt(0) || 'C'}</span>
                </div>
              )}
            </div>

            {/* Right: Content */}
            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-primary/10 text-primary text-xs px-3 py-0.5 rounded-full font-medium">
                    Online Course
                  </span>
                  {course.level && (
                    <span className={`${levelColors[course.level] || 'bg-surface-alt text-text-muted'} text-xs px-3 py-0.5 rounded-full`}>
                      {course.level}
                    </span>
                  )}
                  {course.is_verified && (
                    <span className="bg-blue-500/10 text-blue-600 text-xs px-3 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                {/* Title & Instructor */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-text leading-tight">
                    {course.title}
                  </h1>
                  {course.tutor && (
                    <p className="text-text-muted mt-2 text-sm">
                      By {course.tutor.full_name}
                    </p>
                  )}
                  {avgRating > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(avgRating) ? 'text-amber-400' : 'text-border'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-text">
                        {avgRating.toFixed(1)}
                      </span>
                      {reviews.length > 0 && (
                        <span className="text-sm text-text-muted">
                          ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-text-muted text-sm leading-relaxed">{course.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-surface-alt rounded-2xl p-3 border border-border">
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Modules</p>
                    <h3 className="font-bold text-text mt-1 text-lg">{totalModules}</h3>
                  </div>
                  <div className="bg-surface-alt rounded-2xl p-3 border border-border">
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Level</p>
                    <h3 className="font-bold text-text mt-1 text-lg">{course.level || 'N/A'}</h3>
                  </div>
                  <div className="bg-surface-alt rounded-2xl p-3 border border-border">
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Category</p>
                    <h3 className="font-bold text-text mt-1 text-lg">{course.category || 'General'}</h3>
                  </div>
                  <div className="bg-surface-alt rounded-2xl p-3 border border-border">
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Price</p>
                    <h3 className="font-bold text-text mt-1 text-lg">{formatNaira(course.total_amount)}</h3>
                  </div>
                </div>
              </div>

              {/* Enroll Footer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-5 border-t border-border">
                <div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Course Price</p>
                  <h2 className="text-2xl font-bold text-text">{formatNaira(course.total_amount)}</h2>
                  {Number(course.total_amount || 0) > 0 && course.allow_installments && (
                    <p className="text-[10px] text-primary font-semibold mt-0.5">Installments available</p>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {Number(course.total_amount || 0) > 0 && course.allow_installments && (
                    <div className="flex gap-1">
                      {[{ value: 'FULL', label: '100%' }, { value: '60', label: '60%' }, { value: '40', label: '40%' }].map((plan) => (
                        <button
                          key={plan.value}
                          onClick={() => setInstallmentPlan(plan.value as 'FULL' | '20' | '40' | '60')}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                            installmentPlan === plan.value
                              ? 'bg-primary text-white border-primary'
                              : 'bg-surface text-text-muted border-border hover:border-primary/30'
                          }`}
                        >
                          {plan.label}
                        </button>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="bg-primary hover:opacity-90 transition-all text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md whitespace-nowrap"
                  >
                    {isEnrolling ? <RefreshCcw className="h-4 w-4 animate-spin" /> : 'Enroll Now'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modules / Curriculum Section */}
        {totalModules > 0 && (
          <div className="mt-6 bg-surface rounded-3xl border border-border p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Course Curriculum</h2>
            <div className="space-y-2">
              {course.modules!.map((module, index) => (
                <div
                  key={module.id}
                  className="flex items-center gap-3 bg-surface-alt px-4 py-3 rounded-xl border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <span className="font-medium text-text">{module.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Referral Code */}
        <div className="mt-4">
          <Input
            placeholder="AUTH CODE (OPTIONAL)"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="h-10 text-[10px] font-black rounded-xl text-center uppercase tracking-widest bg-surface border-dashed border-border max-w-xs mx-auto"
          />
        </div>
      </div>
    </div>
  );
}
