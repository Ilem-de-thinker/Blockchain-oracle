import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { coursesApi, Course } from '../../../src/api/courses';
import { analyticsApi } from '../../../src/api/analytics';
import { reviewsApi } from '../../../src/api/reviews';
import { Chart } from '../../../components/ui/chart';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { ReportActions } from '../../../components/ui/ReportActions';
import { useToast } from '../../../src/hooks/useToast';
import {
  Users,
  BookOpen,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Search,
  RefreshCw,
  GraduationCap,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Crown,
} from 'lucide-react';

interface CourseStudent {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone_number?: string;
    address?: string;
    lga?: string;
    state?: string;
    country?: string;
    role: string;
    bio?: string;
    profile_picture?: string;
  };
  enrolled_at: string;
  progress_percentage?: number;
  is_course_completed?: boolean;
}

const AdminEnrollmentsPage: React.FC = () => {
  const toast = useToast();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<CourseStudent[]>([]);
  const [courseReviews, setCourseReviews] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;

  const [platformSummary, setPlatformSummary] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [coursePerformance, setCoursePerformance] = useState<any>(null);
  const [revenueByCategory, setRevenueByCategory] = useState<any>(null);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseData();
    }
  }, [selectedCourseId, currentPage]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [courseData, dashboard, summary, perf, revenue, ratings] = await Promise.allSettled([
        coursesApi.getCourses(1, 200),
        analyticsApi.getAdminDashboard(),
        analyticsApi.getAdminPlatformSummary(),
        analyticsApi.getAdminCoursePerformance(),
        analyticsApi.getAdminRevenueByCategory(),
        analyticsApi.getAdminRatingStats(),
      ]);

      if (courseData.status === 'fulfilled') setCourses(courseData.value.items || []);
      if (dashboard.status === 'fulfilled') setDashboardData(dashboard.value);
      if (summary.status === 'fulfilled') setPlatformSummary(summary.value);
      if (perf.status === 'fulfilled') setCoursePerformance(perf.value);
      if (revenue.status === 'fulfilled') setRevenueByCategory(revenue.value);
      if (ratings.status === 'fulfilled') setRatingStats(ratings.value);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async () => {
    if (!selectedCourseId) return;
    setCourseLoading(true);
    try {
      const courseId = Number(selectedCourseId);
      const [courseData, enrollmentsData, reviewsData] = await Promise.allSettled([
        coursesApi.getCourse(courseId),
        coursesApi.getCourseEnrollments(courseId, currentPage, pageSize),
        reviewsApi.getCourseReviews(courseId),
      ]);

      if (courseData.status === 'fulfilled') setCourse(courseData.value);
      if (enrollmentsData.status === 'fulfilled') {
        const data = enrollmentsData.value;
        setEnrollments(data.results || []);
        setTotalItems(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / pageSize) || 1);
      }
      if (reviewsData.status === 'fulfilled') setCourseReviews(reviewsData.value);
    } catch (err) {
      console.error('Failed to load course data:', err);
      toast.error('Failed to load course enrollment data');
    } finally {
      setCourseLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: string | number | undefined) => {
    if (!amount || amount === '0' || amount === '0.00') return 'Free';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₦${num.toLocaleString()}`;
  };

  const filteredEnrollments = enrollments.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.user.full_name.toLowerCase().includes(q) ||
      s.user.email.toLowerCase().includes(q) ||
      s.user.username.toLowerCase().includes(q)
    );
  });

  const renderStars = (rating: number) => {
    return (
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-text-muted/30'}`}
          />
        ))}
        <span className="text-xs font-semibold text-text-muted ml-1">({rating.toFixed(1)})</span>
      </span>
    );
  };

  const statsCards = [
    {
      label: 'Total Courses',
      value: platformSummary?.total_courses || courses.length,
      icon: BookOpen,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Total Enrollments',
      value: dashboardData?.enrollment_trends?.reduce((a: number, b: any) => a + b.count, 0) || 0,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
    },
    {
      label: 'Completion Rate',
      value: `${(platformSummary?.course_completion_rate || 0).toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'Avg Rating',
      value: (platformSummary?.avg_platform_rating || 0).toFixed(1),
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Enrollments</h1>
          <p className="text-text-muted">Manage per-course enrollments, tutor details, and platform analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadInitialData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <ReportActions />
        </div>
      </div>

      {/* Section 1: Per-Course Enrollment */}
      <div className="bg-surface rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text">Per-Course Enrollment</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 rounded-xl border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">-- Choose a course --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} — {c.tutor?.full_name || 'Unknown Tutor'}
                </option>
              ))}
            </select>
          </div>
          {selectedCourseId && course && (
            <div className="flex items-center gap-3 py-2">
              <GraduationCap className="w-4 h-4 text-text-muted" />
              <span className="text-sm text-text-muted">Total Enrolled: <strong className="text-text">{totalItems}</strong></span>
            </div>
          )}
        </div>

        {selectedCourseId && courseLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {selectedCourseId && course && !courseLoading && (
          <>
            {/* Course Info + Tutor + Rating */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-surface-alt rounded-xl border border-border p-4">
                <div className="flex items-start gap-4">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-20 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-20 h-16 rounded-lg bg-surface-hover flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-text-muted" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-text">{course.title}</h3>
                    <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{course.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <Badge variant="secondary">{course.category || 'Uncategorized'}</Badge>
                      <Badge variant={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'default'}>
                        {course.level || 'N/A'}
                      </Badge>
                      <span className="text-sm font-bold text-text">{formatAmount(course.total_amount || course.price)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-alt rounded-xl border border-border p-4">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Tutor</h4>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {course.tutor?.profile_picture ? (
                      <img src={course.tutor.profile_picture} alt={course.tutor.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-primary">{course.tutor?.full_name?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">{course.tutor?.full_name || 'N/A'}</p>
                    <p className="text-[10px] text-text-muted">@{course.tutor?.username || 'N/A'}</p>
                  </div>
                </div>
                {course.average_rating ? (
                  <div className="mt-2">{renderStars(course.average_rating)}</div>
                ) : null}
              </div>
            </div>

            {/* Enrollments Table */}
            <div className="bg-surface-alt/50 rounded-xl border border-border overflow-hidden">
              <div className="p-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-text flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Enrolled Students
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-56 h-9 pl-9 pr-3 rounded-lg border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
              <Table variant="striped">
                <TableHeader>
                  <TableRow className="bg-surface-alt/50">
                    <TableHead>Student</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-text-muted">
                        <div className="flex flex-col items-center">
                          <Users className="h-8 w-8 text-text-muted/20 mb-2" />
                          <p className="text-sm font-medium">No students enrolled</p>
                          <p className="text-xs mt-1">Students will appear once they enroll in this course.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {enrollment.user.profile_picture ? (
                                <img src={enrollment.user.profile_picture} alt={enrollment.user.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-primary">{enrollment.user.full_name.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text">{enrollment.user.full_name}</p>
                              <p className="text-[10px] text-text-muted">@{enrollment.user.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                              <Mail className="h-3 w-3 text-text-muted" />
                              {enrollment.user.email}
                            </div>
                            {enrollment.user.phone_number && (
                              <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                                <Phone className="h-3 w-3 text-text-muted" />
                                {enrollment.user.phone_number}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <MapPin className="h-3 w-3 text-text-muted" />
                            <span>{enrollment.user.lga || enrollment.user.state || 'N/A'}{enrollment.user.country ? `, ${enrollment.user.country}` : ''}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                            <Calendar className="h-3 w-3 text-text-muted" />
                            {formatDate(enrollment.enrolled_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`${basePath}/users/${enrollment.user.id}/progress`}>
                            <Button variant="ghost" size="xs">
                              <Users className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-1">
                <p className="text-xs text-text-muted">Page {currentPage} of {totalPages} ({totalItems} total)</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Section 2: Analytics & Charts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-text">Enrollment Analytics</h2>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <div key={stat.label} className="bg-surface rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-black text-text">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl border border-border p-4">
              <h3 className="text-sm font-bold text-text mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Enrollment Trends
              </h3>
              <Chart
                type="line"
                data={dashboardData.enrollment_trends?.map((item: any) => ({ label: item.month, value: item.count })) || []}
                height={220}
              />
            </div>
            <div className="bg-surface rounded-xl border border-border p-4">
              <h3 className="text-sm font-bold text-text mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Revenue by Category
              </h3>
              <Chart
                type="bar"
                data={revenueByCategory?.by_category?.map((item: any) => ({ label: item.category, value: item.revenue })) || []}
                height={220}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold text-text mb-3 flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-500" />
              Enrollments by Category
            </h3>
            <Chart
              type="bar"
              data={revenueByCategory?.by_category?.map((item: any) => ({ label: item.category, value: item.enrollments })) || []}
              height={220}
            />
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold text-text mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Rating Distribution
            </h3>
            <Chart
              type="bar"
              data={ratingStats?.distribution?.map((item: any) => ({ label: `${item.rating} Star`, value: item.count })) || []}
              height={220}
            />
          </div>
          <div className="bg-surface rounded-xl border border-border p-4">
            <h3 className="text-sm font-bold text-text mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Top Courses by Completion
            </h3>
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {(coursePerformance?.courses || []).slice(0, 15).map((course: any, i: number) => (
                <div key={course.course_id} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-text-muted/40 w-4 text-right shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-[11px] font-medium text-text truncate">{course.title}</p>
                      <span className="text-[10px] font-bold shrink-0">{course.completion_rate?.toFixed(0) || 0}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-hover overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${Math.min(course.completion_rate || 0, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!coursePerformance?.courses || coursePerformance.courses.length === 0) && (
                <p className="text-xs text-text-muted text-center py-8">No completion data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEnrollmentsPage;
