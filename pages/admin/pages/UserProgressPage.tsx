import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { coursesApi } from '../../../src/api/courses';
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
  Clock,
  CheckCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  Users,
  Award
} from 'lucide-react';

interface EnrollmentWithProgress {
  id: number;
  course: {
    id: number;
    title: string;
    thumbnail_url?: string;
    total_amount: string;
  };
  course_title: string;
  course_thumbnail?: string;
  installment_plan: string;
  amount_paid: string;
  balance_remaining: string;
  total_amount: string;
  is_completed: boolean;
  enrolled_at: string;
  completed_at?: string;
  progress?: number;
}

const UserProgressPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const toast = useToast();
  
  const basePath = location.pathname.startsWith('/tutor')
    ? '/tutor'
    : location.pathname.startsWith('/super-admin')
      ? '/super-admin'
      : '/admin';

  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);

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
      console.error('Failed to load user:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadEnrollments = async () => {
    if (!id) return;
    
    try {
      setLoadingEnrollments(true);
      const userId = parseInt(id);
      let enrollmentsData;

      try {
        enrollmentsData = await coursesApi.getUserEnrollments(userId, 1, 100);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          try {
            enrollmentsData = await coursesApi.getEnrollments(1, 100, { userId });
          } catch {
            enrollmentsData = null;
          }
        } else {
          throw error;
        }
      }

      if (enrollmentsData?.results?.length) {
        const mappedEnrollments = enrollmentsData.results.map((enrollment: any) => ({
          ...enrollment,
          course: typeof enrollment.course === 'number' 
            ? { 
                id: enrollment.course, 
                title: enrollment.course_title || 'Unknown Course',
                thumbnail_url: enrollment.course_thumbnail,
                total_amount: enrollment.total_amount || '0'
              } 
            : enrollment.course,
          course_title: enrollment.course_title || enrollment.course?.title,
          course_thumbnail: enrollment.course_thumbnail || enrollment.course?.thumbnail_url,
        }));
        setEnrollments(mappedEnrollments);
        setTotalSpent(mappedEnrollments.reduce((sum: number, e: any) => sum + parseFloat(e.amount_paid || '0'), 0));
        setPendingBalance(mappedEnrollments.reduce((sum: number, e: any) => sum + parseFloat(e.balance_remaining || '0'), 0));
      } else {
        const [progressData, summaryData] = await Promise.all([
          analyticsApi.getStudentCourseProgress(userId),
          analyticsApi.getStudentDashboardSummary(userId).catch(() => null),
        ]);
        const mappedFromProgress = (progressData?.courses || []).map((c: any) => ({
          id: c.course_id,
          course: { id: c.course_id, title: c.title },
          course_title: c.title,
          is_completed: c.status === 'Completed',
          progress: c.completion,
          completed: c.status === 'Completed',
          enrolled_at: '',
        }));
        setEnrollments(mappedFromProgress);
        setTotalSpent(summaryData?.total_spent ?? 0);
        setPendingBalance(summaryData?.pending_balance ?? 0);
      }
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      toast.error('Failed to load course enrollments');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadEnrollments();
    }
  }, [user]);

  const stats = {
    totalEnrollments: enrollments.length,
    completedCourses: enrollments.filter(e => e.is_completed).length,
    inProgressCourses: enrollments.filter(e => !e.is_completed).length,
    totalSpent: totalSpent,
    pendingBalance: pendingBalance,
  };

  const formatAmount = (amount: string | number | undefined) => {
    if (amount === undefined || amount === null) return '—';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCompletionPercentage = (enrollment: EnrollmentWithProgress) => {
    if (enrollment.progress !== undefined) return enrollment.progress;
    const total = parseFloat(enrollment.total_amount || '0');
    const paid = parseFloat(enrollment.amount_paid || '0');
    if (total === 0) return 100;
    return Math.round((paid / total) * 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-emerald-500';
    if (percentage >= 50) return 'bg-blue-500';
    return 'bg-amber-500';
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
        <p className="text-text-muted">User not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <Link to={`${basePath}/users`} className="hover:text-primary">
              Users
            </Link>
            <span>/</span>
            <span className="text-primary">Progress</span>
          </div>
          <h1 className="text-2xl font-bold text-text">User Progress</h1>
          <p className="text-sm text-text-muted">
            View learning progress and enrollment history for {user.full_name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`${basePath}/users/${id}/edit`}>
            <Button variant="outline" size="sm">
              Edit User
            </Button>
          </Link>
        </div>
      </div>

      {/* User Info Card */}
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
              <p className="text-xs text-text-muted">Enrolled Courses</p>
              <p className="text-2xl font-black text-text">{stats.totalEnrollments}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Completed</p>
              <p className="text-2xl font-black text-emerald-600">{stats.completedCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">In Progress</p>
              <p className="text-2xl font-black text-amber-600">{stats.inProgressCourses}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Total Spent</p>
              <p className="text-2xl font-black text-blue-600">{formatAmount(stats.totalSpent)}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Pending Balance</p>
              <p className="text-2xl font-black text-red-600">{formatAmount(stats.pendingBalance)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-bold text-text">Course Enrollments & Progress</h2>
        </div>
        
        {loadingEnrollments ? (
          <div className="py-10 text-center">
            <i className="fas fa-circle-notch fa-spin text-2xl text-primary"></i>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="py-10 text-center">
            <BookOpen className="h-10 w-10 text-text-muted opacity-20 mx-auto mb-3" />
            <p className="text-text-muted font-medium">No enrollments found</p>
            <p className="text-xs text-text-muted mt-1">This user hasn't enrolled in any courses yet.</p>
          </div>
        ) : (
          <Table variant="striped">
            <TableHeader>
              <TableRow className="bg-surface-alt/50">
                <TableHead>Course</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Payment Progress</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => {
                const percentage = getCompletionPercentage(enrollment);
                const isCompleted = enrollment.is_completed || percentage >= 100;
                
                return (
                  <TableRow key={enrollment.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {enrollment.course_thumbnail ? (
                          <img
                            src={enrollment.course_thumbnail}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-text">
                          {enrollment.course_title || enrollment.course?.title}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={enrollment.installment_plan === 'FULL' ? 'secondary' : 'warning'}>
                        {enrollment.installment_plan === 'FULL' ? 'Full' : `${enrollment.installment_plan}%`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-32">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-text-muted">{percentage}%</span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-emerald-600">
                        {formatAmount(enrollment.amount_paid)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {parseFloat(enrollment.balance_remaining || '0') > 0 ? (
                        <span className="text-sm font-medium text-amber-600">
                          {formatAmount(enrollment.balance_remaining)}
                        </span>
                      ) : (
                        <span className="text-sm text-text-muted">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={isCompleted ? 'success' : 'warning'}>
                        {isCompleted ? 'Completed' : 'In Progress'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-text-muted">
                      {formatDate(enrollment.enrolled_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`${basePath}/courses/${enrollment.course?.id || enrollment.course}`}>
                          <Button variant="ghost" size="xs" title="View Course">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default UserProgressPage;
