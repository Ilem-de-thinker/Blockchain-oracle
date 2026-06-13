import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import usersApi, { User } from '../../../src/api/users';
import { analyticsApi } from '../../../src/api/analytics';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import { useToast } from '../../../src/hooks/useToast';
import {
  ArrowLeft,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  BarChart3,
  Award,
  Clock,
  GraduationCap,
} from 'lucide-react';

interface CourseProgress {
  course_id: number;
  title: string;
  enrollments: number;
  completion_rate: number;
  total_revenue: number;
  avg_rating?: number;
}

const TutorProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const toast = useToast();

  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [enrollmentFunnel, setEnrollmentFunnel] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadUserData();
    }
  }, [id]);

  const loadUserData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const userData = await usersApi.getUser(parseInt(id));
      setUser(userData);
    } catch (error) {
      console.error('Failed to load tutor:', error);
      toast.error('Failed to load tutor data');
    } finally {
      setLoading(false);
    }
  };

  const loadCourseProgress = async () => {
    if (!id) return;
    try {
      setLoadingCourses(true);
      const tutorId = parseInt(id);

      const [summaryData, dashboard, rev, funnel] = await Promise.all([
        analyticsApi.getTutorDashboardSummary(tutorId).catch(() => null),
        analyticsApi.getTutorDashboard(tutorId).catch(() => null),
        analyticsApi.getTutorRevenue('month', tutorId).catch(() => null),
        analyticsApi.getTutorEnrollmentFunnel(tutorId).catch(() => null),
      ]);

      setSummary(summaryData);
      setRevenue(rev);
      setEnrollmentFunnel(funnel);

      if (dashboard?.per_course) {
        const mapped = dashboard.per_course.map((c: any) => ({
          course_id: c.course_id,
          title: c.title,
          enrollments: c.enrollments,
          completion_rate: c.completion_rate,
          total_revenue: 0,
        }));

        if (rev?.per_course) {
          mapped.forEach((mc: any) => {
            const match = rev.per_course.find((rc: any) => rc.course_id === mc.course_id);
            if (match) mc.total_revenue = match.sales || 0;
          });
        }

        setCourses(mapped);
      }
    } catch (error) {
      console.error('Failed to load course progress:', error);
      toast.error('Failed to load course progress data');
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCourseProgress();
    }
  }, [user]);

  const stats = {
    totalCourses: courses.length,
    totalStudents: summary?.total_students || 0,
    totalRevenue: summary?.total_revenue || 0,
    completionRate: summary?.completion_rate || 0,
    avgRating: summary?.avg_rating || 0,
  };

  const formatAmount = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-text-muted">Tutor not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <Link to={`${basePath}/tutors`} className="hover:text-primary">Tutors</Link>
            <span>/</span>
            <Link to={`${basePath}/tutor/${id}`} className="hover:text-primary">{user.full_name}</Link>
            <span>/</span>
            <span className="text-primary">Progress</span>
          </div>
          <h1 className="text-2xl font-bold text-text">Tutor Progress</h1>
          <p className="text-sm text-text-muted">
            Course performance and student engagement for {user.full_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`${basePath}/tutor/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tutor
            </Button>
          </Link>
        </div>
      </div>

      {/* Tutor Info Card */}
      <div className="bg-surface rounded-2xl border border-border p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {user.profile_picture ? (
              <img src={user.profile_picture} alt={user.full_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {user.full_name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-text">{user.full_name}</h2>
            <p className="text-sm text-text-muted">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="secondary">{user.role}</Badge>
              {user.is_active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="destructive">Inactive</Badge>
              )}
              {user.tutor_rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-600">{user.tutor_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Courses</p>
              <p className="text-2xl font-black text-text">{stats.totalCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Students</p>
              <p className="text-2xl font-black text-emerald-600">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Revenue</p>
              <p className="text-2xl font-black text-amber-600">{formatAmount(stats.totalRevenue)}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Completion Rate</p>
              <p className="text-2xl font-black text-blue-600">{stats.completionRate?.toFixed(0) || 0}%</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Award className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Avg Rating</p>
              <p className="text-2xl font-black text-red-600">{stats.avgRating?.toFixed(1) || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Funnel */}
      {enrollmentFunnel?.funnel && (
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-sm font-bold text-text mb-4">Enrollment Funnel</h2>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {enrollmentFunnel.funnel.map((stage: any, i: number) => (
              <div key={i} className="p-4 bg-surface-alt rounded-xl border border-border text-center">
                <p className="text-2xl font-black text-text">{stage.count}</p>
                <p className="text-xs text-text-muted mt-1 capitalize">{stage.stage.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly Revenue Trend */}
      {revenue?.monthly_revenue && revenue.monthly_revenue.length > 0 && (
        <div className="bg-surface rounded-2xl border border-border p-6">
          <h2 className="text-sm font-bold text-text mb-4">Monthly Revenue Trend</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {revenue.monthly_revenue.slice(-6).map((mr: any, i: number) => {
              const maxAmount = Math.max(...revenue.monthly_revenue.map((r: any) => r.amount), 1);
              const barHeight = (mr.amount / maxAmount) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-text">{formatAmount(mr.amount)}</span>
                  <div className="w-full h-20 bg-surface-alt rounded-lg border border-border overflow-hidden flex items-end">
                    <div
                      className="w-full bg-emerald-500 rounded-b-lg transition-all duration-500"
                      style={{ height: `${Math.max(barHeight, 4)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted">{mr.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Course Performance Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-bold text-text">Course Performance</h2>
        </div>

        {loadingCourses ? (
          <div className="py-10 text-center">
            <i className="fas fa-circle-notch fa-spin text-2xl text-primary"></i>
          </div>
        ) : courses.length === 0 ? (
          <div className="py-10 text-center">
            <BookOpen className="h-10 w-10 text-text-muted opacity-20 mx-auto mb-3" />
            <p className="text-text-muted font-medium">No courses found</p>
            <p className="text-xs text-text-muted mt-1">This tutor hasn't created any courses yet.</p>
          </div>
        ) : (
          <Table variant="striped">
            <TableHeader>
              <TableRow className="bg-surface-alt/50">
                <TableHead>Course</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Completion Rate</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.course_id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-text">
                        {course.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-text">{course.enrollments}</span>
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-muted">{course.completion_rate?.toFixed(0)}%</span>
                      </div>
                      <Progress
                        value={course.completion_rate}
                        className="h-2"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium text-emerald-600">
                      {formatAmount(course.total_revenue)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {course.avg_rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-amber-600">{course.avg_rating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-text-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={`${basePath}/courses/${course.course_id}`}>
                        <Button variant="ghost" size="xs" title="View Course">
                          <BookOpen className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default TutorProgressPage;
