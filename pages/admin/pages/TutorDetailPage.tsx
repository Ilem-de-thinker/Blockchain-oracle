import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import usersApi, { User } from '../../../src/api/users';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../src/hooks/useToast';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ArrowLeft,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  Star,
  BarChart3,
  ExternalLink,
  GraduationCap,
  Clock,
  Award,
} from 'lucide-react';
import coursesApi from '../../../src/api/courses';
import { analyticsApi } from '../../../src/api/analytics';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../../components/ui/table';

interface TutorCourse {
  course_id: number;
  title: string;
  enrollments: number;
  completion_rate: number;
}

const TutorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [courses, setCourses] = useState<TutorCourse[]>([]);
  const [revenue, setRevenue] = useState<any>(null);
  const [enrollmentFunnel, setEnrollmentFunnel] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'analytics'>('courses');

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
    const loadTutor = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const tutorId = parseInt(id);

        const [userData, summary, dashboard, rev, funnel] = await Promise.all([
          usersApi.getUser(tutorId),
          analyticsApi.getTutorDashboardSummary(tutorId).catch(() => null),
          analyticsApi.getTutorDashboard(tutorId).catch(() => null),
          analyticsApi.getTutorRevenue('month', tutorId).catch(() => null),
          analyticsApi.getTutorEnrollmentFunnel(tutorId).catch(() => null),
        ]);

        setUser(userData);
        setDashboardSummary(summary);
        setRevenue(rev);
        setEnrollmentFunnel(funnel);

        if (dashboard?.per_course) {
          setCourses(dashboard.per_course.map((c: any) => ({
            course_id: c.course_id,
            title: c.title,
            enrollments: c.enrollments,
            completion_rate: c.completion_rate,
          })));
        }
      } catch (error: any) {
        console.error('Failed to load tutor detail:', error);
        toast.error('Failed to load tutor details: ' + (error?.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadTutor();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      setActionLoading(true);
      const newStatus = !user.is_active;
      await usersApi.toggleUserStatus(user.id, newStatus);
      setUser({ ...user, is_active: newStatus });
      toast.success(`Tutor ${newStatus ? 'activated' : 'suspended'} successfully`);
    } catch (error) {
      toast.error('Failed to update tutor status');
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
      toast.success('Tutor deleted successfully');
      navigate(`${basePath}/tutors`);
    } catch (error) {
      toast.error('Failed to delete tutor');
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
        <p className="text-text-muted">Tutor not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(`${basePath}/tutors`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tutors
        </Button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '₦0';
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(`${basePath}/tutors`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-text">{user.full_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize">{user.role.toLowerCase()}</Badge>
              <Badge variant={user.is_active ? 'success' : 'destructive'}>
                {user.is_active ? 'Active' : 'Suspended'}
              </Badge>
              {user.tutor_rating && (
                <div className="flex items-center gap-1 ml-2">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-amber-600">{user.tutor_rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(`${basePath}/tutor/${user.id}/progress`)}>
            <TrendingUp className="mr-2 h-4 w-4" /> View Progress
          </Button>
          <Button variant="outline" onClick={() => navigate(`${basePath}/users/${user.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <Button
            variant={user.is_active ? 'destructive' : 'success'}
            onClick={handleToggleStatus}
            isLoading={actionLoading}
          >
            {user.is_active ? <Ban className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
            {user.is_active ? 'Suspend Tutor' : 'Activate Tutor'}
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
                  <img
                    src={user.profile_picture}
                    alt={user.full_name}
                    className="w-24 h-24 rounded-xl object-cover border-4 border-surface shadow-xl"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-xl bg-emerald-600 flex items-center justify-center border-4 border-surface shadow-xl">
                    <span className="text-3xl font-bold text-white">{user.full_name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-text">{user.full_name}</h3>
                  <p className="text-sm text-text-muted">@{user.username}</p>
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
                    <span className="text-text">Joined {formatDate(user.date_joined)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm pt-2 border-t border-border">
                    <Shield className="h-4 w-4 text-text-muted" />
                    <span className="text-text">Verification: </span>
                    <Badge variant={user.is_verified ? 'success' : 'secondary'} className="capitalize">
                      {user.verification_status || (user.is_verified ? 'verified' : 'unverified')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tutor Stats Cards */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-sm font-bold text-text mb-4">Tutor Overview</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface-alt rounded-xl border border-border">
                <BookOpen className="h-5 w-5 text-emerald-600 mb-2" />
                <p className="text-xl font-bold text-text">{dashboardSummary?.total_courses || courses.length || 0}</p>
                <p className="text-xs text-text-muted">Courses</p>
              </div>
              <div className="p-3 bg-surface-alt rounded-xl border border-border">
                <Users className="h-5 w-5 text-blue-600 mb-2" />
                <p className="text-xl font-bold text-text">{dashboardSummary?.total_students || 0}</p>
                <p className="text-xs text-text-muted">Students</p>
              </div>
              <div className="p-3 bg-surface-alt rounded-xl border border-border">
                <DollarSign className="h-5 w-5 text-amber-600 mb-2" />
                <p className="text-xl font-bold text-text">{formatAmount(dashboardSummary?.total_revenue)}</p>
                <p className="text-xs text-text-muted">Revenue</p>
              </div>
              <div className="p-3 bg-surface-alt rounded-xl border border-border">
                <Award className="h-5 w-5 text-purple-600 mb-2" />
                <p className="text-xl font-bold text-text">{dashboardSummary?.completion_rate?.toFixed(0) || 0}%</p>
                <p className="text-xs text-text-muted">Completion Rate</p>
              </div>
            </div>
          </div>

          {/* Revenue Card */}
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-sm font-bold text-text mb-4">Revenue Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Total Revenue</span>
                <span className="text-sm font-bold text-text">{formatAmount(dashboardSummary?.total_revenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Enrolled Students</span>
                <span className="text-sm font-bold text-text">{dashboardSummary?.total_students || 0}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-text-muted">Active This Week</span>
                <span className="text-sm font-bold text-emerald-600">{dashboardSummary?.active_students_this_week || 0}</span>
              </div>
            </div>
            {revenue?.per_course && revenue.per_course.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border">
                <h4 className="text-xs font-bold text-text-muted mb-2">Per Course Sales</h4>
                {revenue.per_course.slice(0, 3).map((pc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-text truncate mr-2">{pc.title}</span>
                    <span className="text-xs font-bold text-emerald-600">{formatAmount(pc.sales)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-surface rounded-xl border border-border p-6">
            <h3 className="text-lg font-bold text-text mb-4">About Tutor</h3>
            <div className="prose prose-sm max-w-none text-text-secondary">
              {user.bio ? (
                <div dangerouslySetInnerHTML={{ __html: user.bio }} />
              ) : (
                <p className="italic text-text-muted">No bio provided for this tutor.</p>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="border-b border-border">
              <nav className="flex gap-4 px-6" aria-label="Tabs">
                <button
                  className={`border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === 'courses' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-text-muted hover:text-text hover:border-border'
                  }`}
                  onClick={() => setActiveTab('courses')}
                >
                  <BookOpen className="h-4 w-4 inline mr-1.5" />
                  Courses ({courses.length})
                </button>
                <button
                  className={`border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === 'students' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-text-muted hover:text-text hover:border-border'
                  }`}
                  onClick={() => setActiveTab('students')}
                >
                  <Users className="h-4 w-4 inline mr-1.5" />
                  Students
                </button>
                <button
                  className={`border-b-2 py-4 px-1 text-sm font-medium ${
                    activeTab === 'analytics' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-text-muted hover:text-text hover:border-border'
                  }`}
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="h-4 w-4 inline mr-1.5" />
                  Analytics
                </button>
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'courses' && (
                <div>
                  {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <BookOpen className="h-12 w-12 text-text-muted opacity-20 mb-4" />
                      <h4 className="text-sm font-bold text-text">No courses yet</h4>
                      <p className="text-xs text-text-muted mt-1">This tutor hasn't created any courses yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Completion Rate</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {courses.map((course) => (
                            <TableRow key={course.course_id}>
                              <TableCell>
                                <Link
                                  to={`${basePath}/courses/${course.course_id}`}
                                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                                >
                                  {course.title}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm font-medium text-text">{course.enrollments}</span>
                              </TableCell>
                              <TableCell className="min-w-[150px]">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-1.5 rounded-full bg-surface-alt overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 transition-all duration-500"
                                      style={{ width: `${Math.min(100, course.completion_rate)}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-bold text-text">{course.completion_rate?.toFixed(0)}%</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Link to={`${basePath}/courses/${course.course_id}`}>
                                  <Button variant="ghost" size="xs">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'students' && (
                <div>
                  {enrollmentFunnel ? (
                    <div className="space-y-6">
                      {/* Enrollment Funnel */}
                      <div>
                        <h4 className="text-sm font-bold text-text mb-3">Enrollment Funnel</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {enrollmentFunnel.funnel?.map((stage: any, i: number) => (
                            <div key={i} className="p-4 bg-surface-alt rounded-xl border border-border text-center">
                              <p className="text-2xl font-black text-text">{stage.count}</p>
                              <p className="text-xs text-text-muted mt-1 capitalize">{stage.stage}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Per Course Students */}
                      {enrollmentFunnel.per_course?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-bold text-text mb-3">Per Course Breakdown</h4>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Course</TableHead>
                                  <TableHead>Enrolled</TableHead>
                                  <TableHead>In Progress</TableHead>
                                  <TableHead>Completed</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {enrollmentFunnel.per_course.map((pc: any, i: number) => (
                                  <TableRow key={pc.course_id || i}>
                                    <TableCell className="text-sm font-medium text-text">{pc.title || `Course #${pc.course_id}`}</TableCell>
                                    <TableCell className="text-sm text-text">{pc.enrolled}</TableCell>
                                    <TableCell className="text-sm text-amber-600">{pc.in_progress}</TableCell>
                                    <TableCell className="text-sm text-emerald-600">{pc.completed}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Users className="h-12 w-12 text-text-muted opacity-20 mb-4" />
                      <h4 className="text-sm font-bold text-text">No student data available</h4>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {/* Monthly Enrollments */}
                  {dashboardSummary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-surface-alt rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <GraduationCap className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs text-text-muted">Active This Week</span>
                        </div>
                        <p className="text-xl font-bold text-text">{dashboardSummary.active_students_this_week || 0}</p>
                      </div>
                      <div className="p-4 bg-surface-alt rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-amber-600" />
                          <span className="text-xs text-text-muted">Avg Rating</span>
                        </div>
                        <p className="text-xl font-bold text-text">{dashboardSummary.avg_rating?.toFixed(1) || 'N/A'}</p>
                      </div>
                      <div className="p-4 bg-surface-alt rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="text-xs text-text-muted">Courses</span>
                        </div>
                        <p className="text-xl font-bold text-text">{dashboardSummary.total_courses || 0}</p>
                      </div>
                      <div className="p-4 bg-surface-alt rounded-xl border border-border">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-purple-600" />
                          <span className="text-xs text-text-muted">Completion Rate</span>
                        </div>
                        <p className="text-xl font-bold text-text">{dashboardSummary.completion_rate?.toFixed(0) || 0}%</p>
                      </div>
                    </div>
                  )}

                  {/* Monthly Revenue Chart Data */}
                  {revenue?.monthly_revenue && revenue.monthly_revenue.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-text mb-3">Monthly Revenue</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Month</TableHead>
                              <TableHead>Amount</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {revenue.monthly_revenue.map((mr: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell className="text-sm text-text">{mr.month}</TableCell>
                                <TableCell className="text-sm font-medium text-emerald-600">{formatAmount(mr.amount)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {!dashboardSummary && !revenue?.monthly_revenue && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <BarChart3 className="h-12 w-12 text-text-muted opacity-20 mb-4" />
                      <h4 className="text-sm font-bold text-text">No analytics data available</h4>
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

export default TutorDetailPage;
