import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, RefreshCcw, X, Eye, BookPlus, BookOpen, Layers3, BadgeCheck, Star } from 'lucide-react';
import { User } from '../../../types';
import { coursesApi, Course, EnrollmentListItem } from '../../../src/api/courses';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Progress } from '../../../components/ui/progress';
import { useToast } from '../../../src/hooks/useToast';
import { formatNaira, parseAmount } from '../../../lib/money';
import { cn } from '@/lib/utils';
import Pagination from '../../../components/ui/Pagination';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

interface AllCoursesPageProps {
  user: User | null;
}

interface SelectedCourse {
  id: number;
  title: string;
  thumbnail_url?: string;
  description?: string;
  category?: string;
  level?: string;
  total_amount: number;
  registration_fee: string;
  tuition_fee: string;
  certificate_fee: string;
  allow_installments: boolean;
  tutor: {
    full_name: string;
  };
}

const categories = ['Protocol', 'Development', 'Finance', 'Analysis', 'Case Study', 'Technology', 'Blockchain'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];

const AllCoursesPage: React.FC<AllCoursesPageProps> = ({ user }) => {
  const toast = useToast();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [allLoading, setAllLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useLocalStorage('all_courses_search', '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useLocalStorage('all_courses_category', '');
  const [selectedLevel, setSelectedLevel] = useLocalStorage('all_courses_level', '');
  const [ordering, setOrdering] = useLocalStorage('all_courses_ordering', '-created_at');
  const [showFilters, setShowFilters] = useLocalStorage('all_courses_show_filters', false);
  const [currentPage, setCurrentPage] = useLocalStorage('all_courses_page', 1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showCourseDetailModal, setShowCourseDetailModal] = useState(false);
  const [coursePreview, setCoursePreview] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(null);
  const [installmentPlan, setInstallmentPlan] = useState<'FULL' | '20' | '40' | '60'>('FULL');
  const [referralCode, setReferralCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrollmentsByCourseId, setEnrollmentsByCourseId] = useState<Record<number, EnrollmentListItem>>({});

  const pageSize = 12;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const refreshEnrollments = useCallback(async () => {
    if (!user) {
      setEnrollmentsByCourseId({});
      return;
    }

    try {
      const res = await coursesApi.getEnrollments(1, 100);
      const nextMap: Record<number, EnrollmentListItem> = {};

      for (const enrollment of res.results || []) {
        const courseId =
          typeof enrollment.course === 'number'
            ? enrollment.course
            : undefined;

        if (typeof courseId === 'number') {
          nextMap[courseId] = enrollment;
        }
      }

      setEnrollmentsByCourseId(nextMap);
    } catch {
      setEnrollmentsByCourseId({});
    }
  }, [user]);

  const loadData = useCallback(
    async (pageToLoad = currentPage) => {
      setAllLoading(true);
      try {
        const coursesRes = await coursesApi.getCourses(
          pageToLoad,
          pageSize,
          selectedCategory || undefined,
          selectedLevel || undefined,
          debouncedSearch || undefined,
          ordering || undefined
        );

        setAllCourses(coursesRes.items || []);
        setTotalItems(coursesRes.count || 0);
        setTotalPages(Math.ceil((coursesRes.count || 0) / pageSize));
      } catch (error) {
        console.error('Failed to load courses:', error);
        toast.error('Failed to load courses');
      } finally {
        setAllLoading(false);
      }
    },
    [currentPage, debouncedSearch, ordering, pageSize, selectedCategory, selectedLevel, toast]
  );

  useEffect(() => {
    refreshEnrollments();
  }, [refreshEnrollments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedLevel, debouncedSearch, ordering]);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  const isEnrolled = useCallback((courseId: number) => Boolean(enrollmentsByCourseId[courseId]), [enrollmentsByCourseId]);

  const getCourseAmount = useCallback((course: Course) => {
    const total = parseAmount(course.total_amount);
    return total !== null ? total : parseAmount(course.price) || 0;
  }, []);

  const courseStats = useMemo(() => {
    const publishedCount = allCourses.filter((course) => course.is_published).length;
    const beginnerCount = allCourses.filter((course) => course.level === 'Beginner').length;
    const enrolledCount = allCourses.filter((course) => isEnrolled(course.id)).length;

    return { publishedCount, beginnerCount, enrolledCount };
  }, [allCourses, isEnrolled]);

  const openCourseDetailModal = (course: Course) => {
    setCoursePreview(course);
    setShowCourseDetailModal(true);
  };

  const closeCourseDetailModal = () => {
    setShowCourseDetailModal(false);
    setCoursePreview(null);
  };

  const openEnrollmentModal = (course: Course) => {
    setSelectedCourse(course as unknown as SelectedCourse);
    setShowModal(true);
  };

  const closeEnrollmentModal = () => {
    setShowModal(false);
    setSelectedCourse(null);
    setInstallmentPlan('FULL');
    setReferralCode('');
  };

  const handleEnroll = async () => {
    if (!selectedCourse) return;

    setIsProcessing(true);
    try {
      const callbackUrl = `${window.location.origin}/dashboard/payment/verify`;
      const res: any = await coursesApi.enroll(
        selectedCourse.id,
        installmentPlan,
        referralCode || undefined,
        callbackUrl
      );
      if (res && typeof res.authorization_url === 'string') {
        window.location.href = res.authorization_url;
        return;
      }

      toast.success('Successfully enrolled');
      await refreshEnrollments();
      setShowModal(false);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.message;
      toast.error(msg?.includes('already enrolled') ? 'You are already enrolled' : msg || 'Failed to enroll');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">Course Catalog</h1>
            <p className="mt-1 text-sm text-text-secondary">Browse programs, compare payment options, and enroll from a cleaner mobile-first layout.</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadData(currentPage)}
          className="h-10 w-full justify-center sm:w-auto"
        >
          <RefreshCcw className={cn('h-4 w-4', allLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-surface/80 p-3 shadow-md hover:shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-600">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <p className="text-xl font-semibold tracking-tight text-text sm:text-2xl">{courseStats.publishedCount || totalItems}</p>
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Visible Programs</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-surface/80 p-3 shadow-md hover:shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500">
              <Layers3 className="h-4 w-4 text-white" />
            </div>
            <p className="text-xl font-semibold tracking-tight text-text sm:text-2xl">{courseStats.beginnerCount}</p>
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Beginner Friendly</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-surface/80 p-3 shadow-md hover:shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-600">
              <BadgeCheck className="h-4 w-4 text-white" />
            </div>
            <p className="text-xl font-semibold tracking-tight text-text sm:text-2xl">{courseStats.enrolledCount}</p>
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Already Enrolled</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-surface/80 p-3 shadow-md hover:shadow-xl backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Input
              placeholder="Search by title, topic, or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full border-border/50 bg-surface-alt/50 pl-10 text-sm text-text placeholder:text-text-secondary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition hover:text-text"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 w-full sm:w-auto"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div
          className={cn(
            'grid grid-cols-1 gap-3 overflow-hidden transition-all duration-300 sm:grid-cols-3',
            showFilters ? 'mt-3 max-h-80 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-11 w-full rounded-xl border border-border/50 bg-surface-alt/50 px-3 text-sm text-text outline-none focus:ring-2 focus:ring-purple-600/30"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="h-11 w-full rounded-xl border border-border/50 bg-surface-alt/50 px-3 text-sm text-text outline-none focus:ring-2 focus:ring-purple-600/30"
            >
              <option value="">All levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Sort</label>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="h-11 w-full rounded-xl border border-border/50 bg-surface-alt/50 px-3 text-sm text-text outline-none focus:ring-2 focus:ring-purple-600/30"
            >
              <option value="-created_at">Newest</option>
              <option value="title">A to Z</option>
              <option value="price">Price low to high</option>
              <option value="-price">Price high to low</option>
            </select>
          </div>
          <div className="sm:col-span-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-full sm:w-auto"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedLevel('');
                setOrdering('-created_at');
              }}
            >
              <X className="h-4 w-4" />
              Reset Filters
            </Button>
          </div>
        </div>
      </div>

      {allLoading && allCourses.length === 0 ? (
        <div className="flex justify-center py-20">
          <RefreshCcw className="h-10 w-10 animate-spin text-purple-600" />
        </div>
      ) : allCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allCourses.map((course) => {
              const enrolled = isEnrolled(course.id);
              const progress = enrolled ? (enrollmentsByCourseId[course.id]?.progress_percentage ?? enrollmentsByCourseId[course.id]?.progress ?? 0) : 0;
              const moduleCount = course.modules?.length || 0;
              const totalMaterials = course.modules?.reduce((sum, m) => sum + (m.materials?.length || 0), 0) || 0;
              const createdDate = new Date(course.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div
                  key={course.id}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-surface/80 shadow-md hover:shadow-xl backdrop-blur-md active:scale-[0.99] transition-all"
                >
                  <div className="relative p-4 pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {enrolled && (
                            <Badge variant="success" className="px-2 py-0.5 text-[9px] font-semibold uppercase">Enrolled</Badge>
                          )}
                          {course.level && (
                            <Badge variant="outline" className="px-2 py-0.5 text-[9px] font-semibold uppercase">{course.level}</Badge>
                          )}
                          {course.is_verified && (
                            <Badge variant="default" className="px-2 py-0.5 text-[9px] font-semibold uppercase bg-teal-500/20 text-teal-600 border-none">Verified</Badge>
                          )}
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold tracking-tight text-text">{course.title}</h3>
                        <p className="mt-0.5 text-xs text-text-secondary line-clamp-1">{course.tutor?.full_name || 'Instructor'}</p>
                      </div>
                      <div className="shrink-0">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt=""
                            className="h-16 w-16 rounded-lg object-cover border border-border/50 sm:h-20 sm:w-20"
                          />
                        ) : (
                          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/10 to-teal-500/10 border border-border/50">
                            <BookOpen className="h-6 w-6 text-purple-400/40" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4 pt-3">
                    <div className="mb-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-secondary">
                        {course.category && <span>{course.category}</span>}
                        {moduleCount > 0 && <span>{moduleCount} module{moduleCount > 1 ? 's' : ''}</span>}
                        <span>{createdDate}</span>
                      </div>
                      {course.description && (
                        <p className="line-clamp-2 text-[10px] leading-relaxed text-text-muted">{course.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
                        {typeof course.average_rating === 'number' && course.average_rating > 0 && (
                          <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {course.average_rating.toFixed(1)}
                          </span>
                        )}
                        <span className="text-text-secondary">{formatNaira(getCourseAmount(course))}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {enrolled && (
                        <div className="space-y-1">
                          {Number(enrollmentsByCourseId[course.id]?.balance_remaining || 0) > 0 && (
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-amber-600">Balance Remaining</span>
                              <span className="text-amber-700">
                                {formatNaira(enrollmentsByCourseId[course.id].balance_remaining)}
                              </span>
                            </div>
                          )}
                          {enrollmentsByCourseId[course.id]?.installment_plan && enrollmentsByCourseId[course.id]?.installment_plan !== 'FULL' && (
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-text-secondary">Plan</span>
                              <span className="text-text">{enrollmentsByCourseId[course.id].installment_plan}% Installment</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                            <span className="text-text-secondary">Progress</span>
                            <span className="text-teal-500">{progress}%</span>
                          </div>
                          <Progress
                            value={progress}
                            className="h-1.5 bg-surface-alt"
                            indicatorClassName="bg-primary"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-2">
                        <div className="text-[10px] font-semibold text-text">
                          {totalMaterials} <span className="font-medium text-text-muted">materials</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="h-9 gap-1.5 px-4 text-xs font-semibold" onClick={() => openCourseDetailModal(course)}>
                            <Eye className="h-3.5 w-3.5" /> Details
                          </Button>
                          {!enrolled ? (
                            <Button size="sm" className="h-9 gap-1.5 px-4 text-xs font-semibold text-white" onClick={() => openEnrollmentModal(course)}>
                              <BookPlus className="h-3.5 w-3.5" /> Enroll
                            </Button>
                          ) : (
                            <Button asChild size="sm" className="h-9 gap-1.5 px-4 text-xs font-semibold !text-white">
                              <Link to={`/dashboard/course/${course.id}`}>Continue</Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border/50 bg-surface/80 py-20 text-center shadow-md hover:shadow-xl backdrop-blur-md">
          <p className="text-base font-semibold tracking-tight text-text">No courses matched your current filters.</p>
          <p className="mt-2 text-sm text-text-secondary">Try resetting category, level, or search input.</p>
        </div>
      )}

      {showCourseDetailModal && coursePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border/50 bg-surface/95 p-5 shadow-md hover:shadow-xl backdrop-blur-md sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Badge className="mb-2 border-none bg-purple-600 px-2.5 py-1 text-[10px] font-semibold uppercase text-white">
                  {coursePreview.category || 'Course'}
                </Badge>
                <h2 className="text-xl font-semibold tracking-tight text-text">{coursePreview.title}</h2>
                <p className="mt-1 text-sm text-text-secondary">{coursePreview.tutor.full_name}</p>
                {typeof coursePreview.average_rating === 'number' && coursePreview.average_rating > 0 && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-amber-700">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(coursePreview.average_rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{coursePreview.average_rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={closeCourseDetailModal}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition hover:bg-surface-alt hover:text-text"
              >
                <X size={18} />
              </button>
            </div>

            <img
              src={coursePreview.thumbnail_url || 'https://via.placeholder.com/800x400'}
              alt={coursePreview.title}
              className="mb-5 h-52 w-full rounded-xl border border-border/50 object-cover shadow-md hover:shadow-xl sm:h-64"
            />

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                {coursePreview.level && (
                  <Badge variant="default" className="border-none bg-purple-600 px-2.5 py-1 text-[10px] font-semibold uppercase text-white">
                    {coursePreview.level}
                  </Badge>
                )}
                <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-surface-alt/40 px-3 py-1 text-xs text-text-secondary">
                  <BookOpen className="h-3.5 w-3.5" />
                  {coursePreview.modules?.length || 0} modules
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-surface-alt/40 px-3 py-1 text-xs text-text-secondary">
                  <Layers3 className="h-3.5 w-3.5" />
                  {coursePreview.modules?.reduce((sum: number, mod) => sum + (mod.materials?.length || 0), 0) || 0} materials
                </span>
                {coursePreview.is_verified && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal-200/60 bg-teal-50 px-3 py-1 text-xs text-teal-700">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
                  Created {new Date(coursePreview.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div>
                <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">About This Course</h4>
                <p className="mt-2 text-sm leading-7 text-text-secondary">{coursePreview.description || 'Course description unavailable.'}</p>
              </div>

              {coursePreview.tutor && (
                <div className="rounded-xl border border-border/50 bg-surface-alt/40 p-4">
                  <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Instructor</h4>
                  <div className="flex items-start gap-3">
                    {coursePreview.tutor.profile_picture ? (
                      <img
                        src={coursePreview.tutor.profile_picture}
                        alt={coursePreview.tutor.full_name}
                        className="h-12 w-12 shrink-0 rounded-full border border-border/50 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                        {coursePreview.tutor.full_name?.charAt(0) || 'T'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text">{coursePreview.tutor.full_name}</p>
                      {coursePreview.tutor.tutor_rating && coursePreview.tutor.tutor_rating > 0 && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-amber-700">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span>{coursePreview.tutor.tutor_rating.toFixed(1)}</span>
                        </div>
                      )}
                      {coursePreview.tutor.bio && (
                        <p className="mt-1 text-xs leading-5 text-text-secondary line-clamp-3">{coursePreview.tutor.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {coursePreview.modules && coursePreview.modules.length > 0 && (
                <div>
                  <h4 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">
                    Course Curriculum ({coursePreview.modules.length} {coursePreview.modules.length === 1 ? 'module' : 'modules'})
                  </h4>
                  <div className="space-y-2">
                    {coursePreview.modules
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((mod, idx) => (
                        <div
                          key={mod.id}
                          className="rounded-xl border border-border/50 bg-surface-alt/30 p-3.5 transition hover:bg-surface-alt/60"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-text">
                                {idx + 1}. {mod.title}
                              </p>
                              {mod.description && (
                                <p className="mt-0.5 text-xs leading-5 text-text-secondary line-clamp-2">{mod.description}</p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-2 text-xs text-text-secondary">
                              {mod.materials && mod.materials.length > 0 && (
                                <span>{mod.materials.length} {mod.materials.length === 1 ? 'material' : 'materials'}</span>
                              )}
                              {mod.quizzes && mod.quizzes.length > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                                  {mod.quizzes.length} quiz{mod.quizzes.length > 1 ? 'zes' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border/50 bg-surface-alt/40 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Total Cost</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-text">{formatNaira(getCourseAmount(coursePreview))}</p>
                  </div>
                  <Button
                    size="lg"
                    className="h-11 rounded-xl px-6 text-white"
                    disabled={isEnrolled(coursePreview.id)}
                    onClick={() => {
                      closeCourseDetailModal();
                      openEnrollmentModal(coursePreview);
                    }}
                  >
                    {isEnrolled(coursePreview.id) ? 'Already Enrolled' : 'Enroll Now'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border/50 bg-surface/95 p-5 shadow-md hover:shadow-xl backdrop-blur-md sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-text">Confirm Enrollment</h2>
                <p className="mt-1 text-sm text-text-secondary">{selectedCourse.title}</p>
              </div>
              <button
                type="button"
                onClick={closeEnrollmentModal}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition hover:bg-surface-alt hover:text-text"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border/50 bg-surface-alt/40 p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-text-secondary">Registration Fee</span>
                    <span className="font-semibold text-text">{formatNaira(selectedCourse.registration_fee)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-text-secondary">Tuition Fee</span>
                    <span className="font-semibold text-text">{formatNaira(selectedCourse.tuition_fee)}</span>
                  </div>
                  {Number(selectedCourse.certificate_fee) > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-text-secondary">Certificate Fee</span>
                      <span className="font-semibold text-text">{formatNaira(selectedCourse.certificate_fee)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
                    <span className="font-semibold tracking-tight text-text">Total Amount</span>
                    <span className="font-semibold tracking-tight text-teal-500">{formatNaira(selectedCourse.total_amount)}</span>
                  </div>
                </div>
              </div>

              {selectedCourse.allow_installments && (
                <div className="space-y-1.5">
                <label className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Payment Plan</label>
                  <select
                    value={installmentPlan}
                    onChange={(e) => setInstallmentPlan(e.target.value as 'FULL' | '20' | '40' | '60')}
                    className="h-11 w-full rounded-xl border border-border/50 bg-surface-alt/50 px-3 text-sm text-text outline-none focus:ring-2 focus:ring-purple-600/30"
                  >
                    <option value="FULL">Full payment</option>
                    <option value="20">20% upfront installment</option>
                    <option value="40">40% upfront installment</option>
                    <option value="60">60% upfront installment</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="px-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Referral Code</label>
                <Input
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Optional referral code"
                  className="h-11 w-full border-border/50 bg-surface-alt/50 text-sm text-text placeholder:text-text-secondary"
                />
              </div>

              <Button
                variant="default"
                className="h-12 w-full text-white"
                isLoading={isProcessing}
                disabled={isProcessing}
                onClick={handleEnroll}
              >
                {isProcessing ? 'Processing...' : 'Proceed to Enrollment'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCoursesPage;
