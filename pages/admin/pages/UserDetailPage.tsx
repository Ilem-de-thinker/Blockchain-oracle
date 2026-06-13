import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import usersApi, { User } from '../../../src/api/users';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ReportActions } from '../../../components/ui/ReportActions';
import { useToast } from '../../../src/hooks/useToast';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Activity,
  ArrowLeft,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  BookOpen,
  GraduationCap,
  DollarSign,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import coursesApi from '../../../src/api/courses';
import adminPaymentsApi from '../../../src/api/admin-payments';
import { analyticsApi } from '../../../src/api/analytics';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
  };
  enrolled_at: string;
  is_completed: boolean;
}

interface Transaction {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  transaction_type?: string;
  description?: string;
}

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [studentActivity, setStudentActivity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'enrollments' | 'transactions'>('activity');

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUserRole(user.role);
      }
    } catch {
      setCurrentUserRole(null);
    }
  }, []);

useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const userId = parseInt(id);
        const pageSize = 20;
        
        const [
          userData, 
          enrollmentsRes, 
          transactionsRes,
          summary,
          progress,
          activity
        ] = await Promise.all([
          usersApi.getUser(userId),
          coursesApi.getUserEnrollments(userId, 1, pageSize).catch(() => null),
          adminPaymentsApi.getAllTransactions(1, pageSize, undefined, userId).catch(() => null),
          analyticsApi.getStudentDashboardSummary(userId).catch(() => null),
          analyticsApi.getStudentCourseProgress(userId).catch(() => null),
          analyticsApi.getStudentActivity(30, userId).catch(() => null),
        ]);

        setUser(userData);
        setDashboardSummary(summary);
        setCourseProgress(progress);
        setStudentActivity(activity);
        
        if (enrollmentsRes) {
          const enrollData = enrollmentsRes as any;
          const enrollmentsList = enrollData.results || enrollData.items || enrollData || [];
          setEnrollments(Array.isArray(enrollmentsList) ? enrollmentsList : []);
        } else if (progress?.courses?.length) {
          setEnrollments(progress.courses.map((c: any, i: number) => ({
            id: c.course_id || i,
            course: { id: c.course_id, title: c.title },
            enrolled_at: c.enrolled_at || new Date().toISOString(),
            is_completed: (c.completion || 0) >= 100,
          })));
        } else {
          setEnrollments([]);
        }
        
        if (transactionsRes) {
          const txData = transactionsRes as any;
          const txList = txData.results || txData.items || txData || [];
          const filtered = Array.isArray(txList)
            ? txList.filter((tx: any) => tx.user === userId)
            : [];
          setTransactions(filtered);
        } else {
          setTransactions([]);
        }
      } catch (error: any) {
        console.error('Failed to load user detail:', error);
        toast.error('Failed to load user details: ' + (error?.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      setActionLoading(true);
      const newStatus = !user.is_active;
      await usersApi.toggleUserStatus(user.id, newStatus);
      setUser({ ...user, is_active: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete ${user.full_name}? This action cannot be undone.`)) return;
    
    try {
      setActionLoading(true);
      await usersApi.deleteUser(user.id);
      toast.success('User deleted successfully');
      navigate('/admin/users');
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setActionLoading(false);
    }
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
      <div className="bg-surface rounded-2xl border border-border p-8 text-center">
        <p className="text-text-muted">User not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
      </div>
    );
  }

  const getTransactionLabel = (tx: any) => {
    if (tx.description) return tx.description;
    if (tx.transaction_type) return tx.transaction_type;
    if (tx.paystack_reference) {
      const prefix = tx.paystack_reference.split('_')[0];
      if (prefix === 'ENROLL') return 'Course Enrollment';
    }
    return 'Transaction';
  };

  // Combine and sort activities
  const recentActivity = [
    ...enrollments.map(e => ({
      type: 'enrollment' as const,
      date: e.enrolled_at,
      title: e.course?.title || 'Unknown Course',
      id: e.id,
    })),
    ...transactions.map(t => ({
      type: 'transaction' as const,
      date: t.created_at,
      title: `${getTransactionLabel(t)} - ₦${t.amount}`,
      id: t.id,
      status: t.status,
    })),
    ...((studentActivity?.recent_activity || []).map((a: any, index: number) => ({
      type: (a.activity_type || 'learning_activity') as
        | 'material_completed'
        | 'course_enrolled'
        | 'quiz_completed'
        | 'certificate_earned'
        | 'learning_activity',
      date: a.timestamp || a.created_at || a.date || new Date().toISOString(),
      title: a.title || a.course_title || a.description || a.activity_type || 'Learning activity',
      id: `activity-${index}-${a.id || a.timestamp || ''}`,
      status: a.status,
    }))),
    ...((courseProgress?.courses || []).map((c: any, index: number) => ({
      type: 'course_progress' as const,
      date: new Date().toISOString(),
      title: `${c.title}: ${Math.round(Number(c.completion || 0))}% progress`,
      id: `progress-${index}-${c.course_id || ''}`,
      status: c.status,
    }))),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-text">{user.full_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize">{user.role.toLowerCase()}</Badge>
              <Badge variant={user.is_active ? 'success' : 'destructive'}>
                {user.is_active ? 'Active' : 'Suspended'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ReportActions disableCsv disableJson />
          <Button variant="outline" onClick={() => navigate(`/admin/users/${user.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <Button 
            variant={user.is_active ? 'destructive' : 'success'} 
            onClick={handleToggleStatus}
            isLoading={actionLoading}
          >
            {user.is_active ? <Ban className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            {user.is_active ? 'Suspend User' : 'Activate User'}
          </Button>
          {currentUserRole === 'SUPER_ADMIN' && (
            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDeleteUser}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-emerald-500/20 to-teal-500/20"></div>
            <div className="px-6 pb-6">
              <div className="relative -mt-12 mb-4">
                {user.profile_picture ? (
                  <div className="relative inline-block">
                    <img 
                      src={user.profile_picture} 
                      alt={user.full_name} 
                      className="w-24 h-24 rounded-xl object-cover border-4 border-surface shadow-xl"
                    />
                    {user.is_verified && (
                      <span className="absolute -bottom-1 -right-1 block text-indigo-400 bg-surface rounded-full p-0.5 shadow-lg border-2 border-white/30" title="Verified">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.356.275C14.78 2.545 13.51 1.5 12 1.5c-1.51 0-2.78 1.045-3.416 2.285-.415-.175-.877-.275-1.356-.275-2.109 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.356-.275C9.22 21.455 10.49 22.5 12 22.5c1.51 0 2.78-1.045 3.416-2.285.415.175.877.275 1.356.275 2.109 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 3.23l-3.06-3.05 1.4-1.41 1.66 1.66 4.67-4.67 1.4 1.42-6.07 6.05z"/>
                        </svg>
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-xl bg-emerald-600 flex items-center justify-center border-4 border-surface shadow-xl">
                      <span className="text-3xl font-bold text-white">{user.full_name.charAt(0)}</span>
                    </div>
                    {user.is_verified && (
                      <span className="absolute -bottom-1 -right-1 block text-indigo-400 bg-surface rounded-full p-0.5 shadow-lg border-2 border-white/30" title="Verified">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.356.275C14.78 2.545 13.51 1.5 12 1.5c-1.51 0-2.78 1.045-3.416 2.285-.415-.175-.877-.275-1.356-.275-2.109 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.356-.275C9.22 21.455 10.49 22.5 12 22.5c1.51 0 2.78-1.045 3.416-2.285.415.175.877.275 1.356.275 2.109 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 3.23l-3.06-3.05 1.4-1.41 1.66 1.66 4.67-4.67 1.4 1.42-6.07 6.05z"/>
                        </svg>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-text">{user.full_name}</h3>
                    {user.is_verified && (
                      <span className="block text-indigo-400" title="Verified">
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.941.1-1.356.275C14.78 2.545 13.51 1.5 12 1.5c-1.51 0-2.78 1.045-3.416 2.285-.415-.175-.877-.275-1.356-.275-2.109 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .941-.1 1.356-.275C9.22 21.455 10.49 22.5 12 22.5c1.51 0 2.78-1.045 3.416-2.285.415.175.877.275 1.356.275 2.109 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 3.23l-3.06-3.05 1.4-1.41 1.66 1.66 4.67-4.67 1.4 1.42-6.07 6.05z"/>
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted">@{user.username}</p>
                  {user.verification_status && (
                    <Badge variant="success" className="mt-1 capitalize text-[10px]">
                      {user.verification_status}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-text-muted" />
                    <span className="text-text">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-text-muted" />
                    <span className="text-text">{user.phone_number || 'No phone number'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-text-muted" />
                    <span className="text-text">{user.address || 'No address provided'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-text-muted" />
                    <span className="text-text">Joined {new Date(user.date_joined).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm pt-2 border-t border-border">
                    <Shield className="h-4 w-4 text-text-muted" />
                    <span className="text-text">Verification: </span>
                    <Badge variant={
                      user.is_verified ? 'success' : 'secondary'
                    } className="capitalize">
                      {user.verification_status || (user.is_verified ? 'verified' : 'unverified')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-sm font-bold text-text mb-4">Activity Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface-alt rounded-xl border border-border">
                <BookOpen className="h-5 w-5 text-emerald-600 mb-2" />
                <p className="text-xl font-bold text-text">{enrollments.length || dashboardSummary?.total_courses || 0}</p>
                <p className="text-xs text-text-muted">Enrollments</p>
              </div>
              <div className="p-3 bg-surface-alt rounded-xl border border-border">
                <CheckCircle className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-xl font-bold text-text">{dashboardSummary?.completed_courses || 0}</p>
                <p className="text-xs text-text-muted">Completed</p>
              </div>
              <div className="p-3 bg-surface-alt rounded-xl border border-border">
                <TrendingUp className="h-5 w-5 text-purple-600 mb-2" />
                <p className="text-xl font-bold text-text">{dashboardSummary?.overall_completion?.toFixed(1) || 0}%</p>
                <p className="text-xs text-text-muted">Avg. Progress</p>
              </div>
              <div className="p-3 bg-surface-alt rounded-xl border border-border">
                <DollarSign className="h-5 w-5 text-amber-600 mb-2" />
                <p className="text-xl font-bold text-text">₦{(dashboardSummary?.total_spent || 0).toLocaleString()}</p>
                <p className="text-xs text-text-muted">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold text-text mb-4">About User</h3>
            <div className="prose prose-sm max-w-none text-text-secondary">
              {user.bio ? (
                <div dangerouslySetInnerHTML={{ __html: user.bio }} />
              ) : (
                <p className="italic text-text-muted">No bio provided for this user.</p>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="border-b border-border">
              <nav className="flex gap-4 px-6" aria-label="Tabs">
                <button 
                  className={`border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === 'activity' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-text-muted hover:text-text hover:border-border'
                  }`}
                  onClick={() => setActiveTab('activity')}
                >
                  Recent Activity
                </button>
                <button 
                  className={`border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === 'enrollments' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-text-muted hover:text-text hover:border-border'
                  }`}
                  onClick={() => setActiveTab('enrollments')}
                >
                  Enrollments
                </button>
                <button 
                  className={`border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === 'transactions' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-text-muted hover:text-text hover:border-border'
                  }`}
                  onClick={() => setActiveTab('transactions')}
                >
                  Transactions
                </button>
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mb-4">
                        <Activity className="h-8 w-8 text-text-muted opacity-20" />
                      </div>
                      <h4 className="text-sm font-bold text-text">No activity yet</h4>
                      <p className="text-xs text-text-muted mt-1 max-w-[240px]">
                        User activity will appear here as they interact with the platform.
                      </p>
                    </div>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3 pb-4 border-b border-border last:border-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.type === 'enrollment' || activity.type === 'course_enrolled'
                            ? 'bg-emerald-100'
                            : activity.type === 'transaction'
                              ? 'bg-blue-100'
                              : activity.type === 'quiz_completed'
                                ? 'bg-purple-100'
                                : activity.type === 'course_progress'
                                  ? 'bg-amber-100'
                                  : 'bg-slate-100'
                        }`}>
                          {activity.type === 'enrollment' || activity.type === 'course_enrolled' ? (
                            <BookOpen className="h-4 w-4 text-emerald-600" />
                          ) : activity.type === 'quiz_completed' ? (
                            <GraduationCap className="h-4 w-4 text-purple-600" />
                          ) : activity.type === 'course_progress' ? (
                            <TrendingUp className="h-4 w-4 text-amber-600" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">{activity.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">{formatDate(activity.date)}</p>
                        </div>
                        {activity.type === 'transaction' && (
                          <Badge variant={activity.status === 'SUCCESS' ? 'success' : 'destructive'} className="text-[10px]">
                            {activity.status}
                          </Badge>
                        )}
                        {activity.type === 'quiz_completed' && (
                          <Badge variant="secondary" className="text-[10px]">Quiz</Badge>
                        )}
                        {activity.type === 'course_progress' && (
                          <Badge variant="warning" className="text-[10px]">Progress</Badge>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'enrollments' && (
                <div>
                  {enrollments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <BookOpen className="h-12 w-12 text-text-muted opacity-20 mb-4" />
                      <h4 className="text-sm font-bold text-text">No enrollments yet</h4>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Progress</TableHead>
                            <TableHead>Enrolled Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {enrollments.map((enrollment) => {
                            const progress = courseProgress?.courses?.find((c: any) => c.course_id === enrollment.course?.id);
                            const completion = progress?.completion || (enrollment.is_completed ? 100 : 0);
                            
                            return (
                              <TableRow key={enrollment.id}>
                                <TableCell>
                                  <Link 
                                    to={`/admin/courses/${enrollment.course?.id}`}
                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                  >
                                    {enrollment.course?.title || 'Unknown Course'}
                                  </Link>
                                </TableCell>
                                <TableCell className="min-w-[150px]">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 rounded-full bg-surface-alt overflow-hidden">
                                      <div 
                                        className="h-full bg-emerald-500 transition-all duration-500" 
                                        style={{ width: `${completion}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] font-bold text-text">{completion}%</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-text-muted">
                                  {formatDate(enrollment.enrolled_at)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={completion === 100 ? 'success' : 'secondary'} className="text-[10px]">
                                    {completion === 100 ? 'Completed' : 'In Progress'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'transactions' && (
                <div>
                  {transactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <DollarSign className="h-12 w-12 text-text-muted opacity-20 mb-4" />
                      <h4 className="text-sm font-bold text-text">No transactions yet</h4>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell className="text-sm text-text">
                                {getTransactionLabel(tx)}
                              </TableCell>
                              <TableCell className="text-sm font-medium text-text">
                                ₦{Number(tx.amount).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={tx.status === 'SUCCESS' ? 'success' : 'destructive'} className="text-[10px]">
                                  {tx.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-text-muted">
                                {formatDate(tx.created_at)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
