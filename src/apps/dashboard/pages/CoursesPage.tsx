import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, RefreshCcw, BookOpen, CheckCircle, Clock, ChevronRight, X, Wallet } from 'lucide-react';
import { User } from '@/types';
import { coursesApi } from '@/src/api/courses';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/src/hooks/useToast';
import { formatNaira } from '@/lib/money';
import { cn } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface DashboardHomeProps {
  user: User | null;
}

interface EnrollmentWithProgress {
  id: number;
  course?: {
    id: number;
    title: string;
    thumbnail_url?: string;
    description?: string;
    category?: string;
    level?: string;
    tutor: {
      full_name: string;
    };
  } | number;
  course_id?: number;
  course_title?: string;
  course_thumbnail?: string;
  completed?: boolean;
  is_completed?: boolean;
  is_course_completed?: boolean;
  progress: number;
  progress_percentage?: number;
  enrolled_at: string;
  amount_paid?: string;
  balance_remaining?: string;
  total_amount?: string;
  installment_plan?: string;
}

const getAcademicCompletion = (enrollment: EnrollmentWithProgress) =>
  Boolean(enrollment.is_course_completed ?? enrollment.completed);
const getProgressValue = (enrollment: EnrollmentWithProgress) =>
  enrollment.progress_percentage ?? enrollment.progress ?? 0;

const CoursesPage: React.FC<DashboardHomeProps> = () => {
  const { error: toastError } = useToast();
  const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(true);
  const [mySearchQuery, setMySearchQuery] = useLocalStorage('courses_search', '');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [myStatusFilter, setMyStatusFilter] = useLocalStorage('courses_status_filter', '');
  const [showFilters, setShowFilters] = useLocalStorage('courses_show_filters', false);
  const [myCurrentPage, setMyCurrentPage] = useLocalStorage('courses_page', 1);
  const [myTotalItems, setMyTotalItems] = useState(0);
  const [myTotalPages, setMyTotalPages] = useState(0);
  const [payingEnrollmentId, setPayingEnrollmentId] = useState<number | null>(null);

  const pageSize = 12;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(mySearchQuery), 400);
    return () => clearTimeout(timer);
  }, [mySearchQuery]);

  const getEnrollmentCourseId = (enrollment: EnrollmentWithProgress): number | null => {
    if (typeof enrollment.course === 'number') return enrollment.course;
    if (enrollment.course?.id) return enrollment.course.id;
    if (typeof enrollment.course_id === 'number') return enrollment.course_id;
    return null;
  };

  const getEnrollmentCourseMeta = (enrollment: EnrollmentWithProgress) => {
    if (typeof enrollment.course === 'object' && enrollment.course) {
      return enrollment.course;
    }

    if (enrollment.course_id || enrollment.course_title) {
      return {
        id: enrollment.course_id || enrollment.id,
        title: enrollment.course_title || 'Untitled Course',
        thumbnail_url: enrollment.course_thumbnail,
        tutor: {
          full_name: 'Unknown Instructor',
        },
      };
    }

    return null;
  };

  const handlePayBalance = async (enrollmentId: number) => {
    setPayingEnrollmentId(enrollmentId);
    try {
      const response = await coursesApi.payBalance(enrollmentId);
      if (response.authorization_url) {
        window.location.assign(response.authorization_url);
      }
    } catch (error: any) {
      toastError(error?.message || 'Failed to start balance payment');
    } finally {
      setPayingEnrollmentId(null);
    }
  };

  const loadData = useCallback(async (pageToLoad = myCurrentPage) => {
    setEnrollmentsLoading(true);
    try {
      const enrollmentsRes = await coursesApi.getEnrollments(pageToLoad, pageSize, {
        search: debouncedSearch || undefined,
        isCompleted: myStatusFilter === 'completed' ? true : myStatusFilter === 'in-progress' ? false : undefined,
        ordering: '-enrolled_at',
      });
      setEnrollments((enrollmentsRes.results || []) as EnrollmentWithProgress[]);
      setMyTotalItems(enrollmentsRes.count || 0);
      setMyTotalPages(Math.ceil((enrollmentsRes.count || 0) / pageSize));
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      toastError('Failed to load your courses');
    } finally {
      setEnrollmentsLoading(false);
    }
  }, [debouncedSearch, myCurrentPage, myStatusFilter, pageSize, toastError]);

  useEffect(() => {
    loadData(myCurrentPage);
  }, [loadData, myCurrentPage]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      const matchesStatus =
        !myStatusFilter ||
        (myStatusFilter === 'in-progress' && !getAcademicCompletion(enrollment)) ||
        (myStatusFilter === 'completed' && getAcademicCompletion(enrollment));

      return matchesStatus;
    });
  }, [enrollments, myStatusFilter]);

  useEffect(() => {
    setMyCurrentPage(1);
  }, [debouncedSearch, myStatusFilter]);

  const totalPages = myTotalPages;
  const currentItems = filteredEnrollments;
  const inProgressCount = enrollments.filter((item) => !getAcademicCompletion(item)).length;
  const completedCount = enrollments.filter((item) => getAcademicCompletion(item)).length;
  const withBalanceCount = enrollments.filter((item) => Number(item.balance_remaining || 0) > 0).length;

  if (enrollmentsLoading && enrollments.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCcw className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">My Courses</h1>
            <p className="mt-1 text-sm text-text-secondary">Track progress, settle balances, and continue from the exact module you left.</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={loadData} className="h-10 w-full sm:w-auto">
          <RefreshCcw className={cn('h-4 w-4', enrollmentsLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/50 bg-surface p-3 shadow-md hover:shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-600">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <p className="text-xl font-semibold tracking-tight text-text sm:text-2xl">{inProgressCount}</p>
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">In Progress</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-surface p-3 shadow-md hover:shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-500">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <p className="text-xl font-semibold tracking-tight text-text sm:text-2xl">{completedCount}</p>
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Completed</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-surface p-3 shadow-md hover:shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-600">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <p className="text-xl font-semibold tracking-tight text-text sm:text-2xl">{withBalanceCount}</p>
          </div>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-secondary">Balance Due</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-surface p-3 shadow-md hover:shadow-xl backdrop-blur-md sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Input
              placeholder="Search by course title"
              value={mySearchQuery}
              onChange={(e) => setMySearchQuery(e.target.value)}
              className="h-11 w-full border-border/50 bg-surface-alt pl-10 text-sm text-text placeholder:text-text-secondary"
            />
            {mySearchQuery && (
              <button
                type="button"
                onClick={() => setMySearchQuery('')}
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
            className="h-11 w-full sm:w-auto "
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            showFilters ? 'mt-3 max-h-28 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All', value: '' },
              { label: 'In Progress', value: 'in-progress' },
              { label: 'Completed', value: 'completed' },
            ].map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => setMyStatusFilter(filter.value)}
                className={cn(
                  'rounded-xl px-4 py-2 text-[11px] font-semibold uppercase tracking-wider transition-all',
                  myStatusFilter === filter.value
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-surface-alt text-text hover:bg-surface-hover'
                )}
              >
                {filter.label}
              </button>
            ))}

            {(myStatusFilter || mySearchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3"
                onClick={() => {
                  setMyStatusFilter('');
                  setMySearchQuery('');
                  setMyCurrentPage(1);
                }}
              >
                <X className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {currentItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {currentItems.map((enrollment) => {
              const course = getEnrollmentCourseMeta(enrollment);
              if (!course) return null;

              const courseId = getEnrollmentCourseId(enrollment) || course.id;
              const hasBalance = Number(enrollment.balance_remaining || 0) > 0;
              const moduleCount = (course as any)?.modules?.length ?? 0;
              const enrolledDate = new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div
                  key={enrollment.id}
                  className="flex h-full flex-col overflow-hidden rounded-xl border border-border/50 bg-surface shadow-md hover:shadow-xl backdrop-blur-md active:scale-[0.99] transition-all"
                >
                  <div className="relative p-4 pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={getAcademicCompletion(enrollment) ? 'success' : 'warning'}
                            className="px-2 py-0.5 text-[9px] font-semibold uppercase"
                          >
                            {getAcademicCompletion(enrollment) ? 'Completed' : 'In Progress'}
                          </Badge>
                          {course.level && (
                            <Badge variant="outline" className="px-2 py-0.5 text-[9px] font-semibold uppercase">
                              {course.level}
                            </Badge>
                          )}
                        </div>
                        <h3 className="line-clamp-2 text-sm font-semibold tracking-tight text-text">
                          {course.title || enrollment.course_title}
                        </h3>
                        <p className="mt-0.5 text-xs text-text-secondary line-clamp-1">{course.tutor?.full_name}</p>
                      </div>
                      <div className="shrink-0">
                        {(course.thumbnail_url || enrollment.course_thumbnail) ? (
                          <img
                            src={course.thumbnail_url || enrollment.course_thumbnail}
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
                        {(course as any)?.category && <span>{course.category}</span>}
                        {moduleCount > 0 && <span>{moduleCount} module{moduleCount > 1 ? 's' : ''}</span>}
                        <span>{enrolledDate}</span>
                      </div>
                      {(course as any)?.description && (
                        <p className="line-clamp-2 text-[10px] leading-relaxed text-text-muted">
                          {(course as any).description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className="text-text-secondary">Progress</span>
                          <span className="text-teal-500">{getProgressValue(enrollment)}%</span>
                        </div>
                        <Progress value={getProgressValue(enrollment)} className="h-1.5 bg-surface-alt" />
                      </div>

                      <div className="rounded-lg border border-border/50 bg-surface-alt p-2.5">
                        {hasBalance ? (
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-[9px] font-semibold uppercase tracking-wider text-text-secondary">Outstanding Balance</p>
                              <p className="text-xs font-semibold text-text">{formatNaira(enrollment.balance_remaining || 0)}</p>
                            </div>
                            <Button
                              size="sm"
                              className="h-8 px-3 text-[11px] text-white"
                              isLoading={payingEnrollmentId === enrollment.id}
                              disabled={payingEnrollmentId === enrollment.id}
                              onClick={() => handlePayBalance(enrollment.id)}
                            >
                              Pay
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-semibold uppercase tracking-wider text-text-secondary">Payment</span>
                            <span className="text-xs font-semibold text-teal-500">Fully Paid</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-2">
                        <div className="text-[10px] font-semibold text-text">
                          {getProgressValue(enrollment)}% <span className="font-medium text-text-muted">complete</span>
                        </div>
                        <Button asChild size="sm" className="h-9 px-4 text-xs font-semibold !text-white">
                          <Link to={`/dashboard/course/${courseId}`}>
                            {getAcademicCompletion(enrollment) ? 'Review' : 'Resume'}
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 rounded-xl border border-border/50 bg-surface p-3 shadow-md hover:shadow-xl backdrop-blur-md sm:p-4">
              <Pagination
                currentPage={myCurrentPage}
                totalPages={totalPages}
                totalItems={myTotalItems}
                pageSize={pageSize}
                onPageChange={setMyCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border/50 bg-surface py-16 text-center shadow-md hover:shadow-xl backdrop-blur-md">
          <Clock className="mx-auto mb-4 h-12 w-12 text-text-secondary/50" />
          <p className="text-base font-semibold tracking-tight text-text">No courses found.</p>
          <p className="mt-2 text-sm text-text-secondary">Try a different search or browse the full course catalog.</p>
          <Button asChild size="sm" className="mt-5 h-11 text-white">
            <Link to="/dashboard/courses/all">Browse Catalog</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
