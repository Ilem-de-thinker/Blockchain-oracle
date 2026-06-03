import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RefreshCw, BarChart3, Users, BookOpen, DollarSign, Calendar, Star, TrendingUp } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Chart } from '../../../components/ui/chart';
import { ReportActions } from '../../../components/ui/ReportActions';
import { analyticsApi } from '../../../src/api/analytics';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import usersApi from '../../../src/api/users';
import { coursesApi } from '../../../src/api/courses';
import eventsApi from '../../../src/api/events';
import adminPaymentsApi from '../../../src/api/admin-payments';
import { useToast } from '../../../src/hooks/useToast';

type ReportTab = 'platform' | 'users' | 'courses' | 'revenue' | 'events' | 'ratings';

const ReportsPage: React.FC = () => {
  const toast = useToast();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useLocalStorage('reports_time_range', '30d');
  const [activeTab, setActiveTab] = useLocalStorage<ReportTab>('reports_active_tab', 'platform');

  const [userStats, setUserStats] = useState<any>(null);
  const [platformSummary, setPlatformSummary] = useState<any>(null);
  const [adminDashboard, setAdminDashboard] = useState<any>(null);
  const [revenueByCategory, setRevenueByCategory] = useState<any>(null);
  const [userGrowth, setUserGrowth] = useState<any>(null);
  const [completionTrends, setCompletionTrends] = useState<any>(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<any>(null);
  const [coursePerformance, setCoursePerformance] = useState<any>(null);
  const [quizStats, setQuizStats] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const getDateRange = (range: string) => {
    const endDate = new Date();
    const startDate = new Date();

    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  };

  const loadData = async () => {
    const { start, end } = getDateRange(timeRange);
    try {
      setLoading(true);
      const [
        userStatsRes,
        platformSummaryRes,
        adminDashboardRes,
        revenueByCategoryRes,
        userGrowthRes,
        completionTrendsRes,
        eventStatsRes,
        ratingStatsRes,
        activeUsersRes,
        coursePerfRes,
        quizStatsRes,
        coursesRes,
        eventsRes,
        transactionsRes,
      ] = await Promise.allSettled([
        usersApi.getUserStats(),
        analyticsApi.getAdminPlatformSummary(),
        analyticsApi.getAdminDashboard(),
        analyticsApi.getAdminRevenueByCategory(),
        analyticsApi.getAdminUserGrowth(),
        analyticsApi.getAdminCompletionTrends(),
        analyticsApi.getAdminEventStats(),
        analyticsApi.getAdminRatingStats(),
        analyticsApi.getAdminActiveUsers(),
        analyticsApi.getAdminCoursePerformance(),
        analyticsApi.getAdminQuizStats(),
        coursesApi.getCourses(1, 100),
        eventsApi.getEvents(1, 100),
        adminPaymentsApi.getAllTransactions(1, 100, undefined, undefined, start, end),
      ]);

      if (userStatsRes.status === 'fulfilled') setUserStats(userStatsRes.value);
      if (platformSummaryRes.status === 'fulfilled') setPlatformSummary(platformSummaryRes.value);
      if (adminDashboardRes.status === 'fulfilled') setAdminDashboard(adminDashboardRes.value);
      if (revenueByCategoryRes.status === 'fulfilled') setRevenueByCategory(revenueByCategoryRes.value);
      if (userGrowthRes.status === 'fulfilled') setUserGrowth(userGrowthRes.value);
      if (completionTrendsRes.status === 'fulfilled') setCompletionTrends(completionTrendsRes.value);
      if (eventStatsRes.status === 'fulfilled') setEventStats(eventStatsRes.value);
      if (ratingStatsRes.status === 'fulfilled') setRatingStats(ratingStatsRes.value);
      if (activeUsersRes.status === 'fulfilled') setActiveUsers(activeUsersRes.value);
      if (coursePerfRes.status === 'fulfilled') setCoursePerformance(coursePerfRes.value);
      if (quizStatsRes.status === 'fulfilled') setQuizStats(quizStatsRes.value);
      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.items || []);
      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.results || []);
      if (transactionsRes.status === 'fulfilled') setTransactions(transactionsRes.value.results || []);
    } catch (error) {
      console.error('Failed to load reports data:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const revenueStats = useMemo(() => {
    const successful = transactions.filter((t) => t.status === 'SUCCESS');
    const failed = transactions.filter((t) => t.status === 'FAILED');
    const refunded = transactions.filter((t) => t.status === 'REFUNDED');
    const totalRevenue = successful.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return {
      totalRevenue,
      successful: successful.length,
      failed: failed.length,
      refundedAmount: refunded.reduce((sum, t) => sum + Number(t.amount || 0), 0),
      avgOrder: successful.length ? totalRevenue / successful.length : 0,
    };
  }, [transactions]);

  const exportJson = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      timeRange,
      summary: platformSummary,
      adminDashboard,
      revenueByCategory,
      userGrowth,
      completionTrends,
      eventStats,
      ratingStats,
      activeUsers,
      coursePerformance,
      quizStats,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-report-${timeRange}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Analytics report exported');
  };

  const tabs: Array<{ id: ReportTab; label: string; icon: any }> = [
    { id: 'platform', label: 'Platform', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'ratings', label: 'Ratings', icon: Star },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-text">Analytics Reports</h1>
          <p className="text-sm text-text-muted">User, platform, course, and performance analysis in one workspace.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-surface"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <ReportActions title="Analytics Report" jsonData={{ generatedAt: new Date().toISOString(), timeRange, summary: platformSummary, adminDashboard, revenueByCategory, userGrowth, completionTrends, eventStats, ratingStats, activeUsers, coursePerformance, quizStats }} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card><CardContent className="pt-4"><p className="text-xs text-text-muted">Users</p><p className="text-2xl font-black">{platformSummary?.total_users ?? userStats?.total_users ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-text-muted">Courses</p><p className="text-2xl font-black">{platformSummary?.total_courses ?? courses.length}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-text-muted">Revenue</p><p className="text-2xl font-black">₦{Number(platformSummary?.total_revenue ?? revenueStats.totalRevenue).toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-text-muted">MAU</p><p className="text-2xl font-black">{platformSummary?.monthly_active_users ?? 0}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-text-muted">Completion</p><p className="text-2xl font-black">{Number(platformSummary?.course_completion_rate ?? 0).toFixed(1)}%</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-xs text-text-muted">Pending Verif.</p><p className="text-2xl font-black">{platformSummary?.pending_verifications ?? 0}</p></CardContent></Card>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg ${
                activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
              }`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'platform' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Enrollment Trends</CardTitle></CardHeader>
            <CardContent>
              <Chart type="line" data={(adminDashboard?.enrollment_trends || []).map((x: any) => ({ label: x.month, value: x.count }))} height={260} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Role Distribution</CardTitle></CardHeader>
            <CardContent>
              <Chart type="pie" data={(adminDashboard?.user_role_distribution || []).map((x: any) => ({ label: x.role, value: x.count }))} height={260} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Monthly Active Users</CardTitle></CardHeader>
            <CardContent>
              <Chart type="bar" data={(activeUsers?.monthly || []).map((x: any) => ({ label: x.month, value: x.active }))} height={240} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Completion Trends</CardTitle></CardHeader>
            <CardContent>
              <Chart type="line" data={(completionTrends?.monthly || []).map((x: any) => ({ label: x.month, value: x.completion_rate }))} height={240} />
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>User Growth (Learners)</CardTitle></CardHeader>
            <CardContent>
              <Chart type="line" data={(userGrowth?.monthly || []).map((x: any) => ({ label: x.month, value: x.USER || 0 }))} height={260} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Platform Geography</CardTitle></CardHeader>
            <CardContent>
              <Chart type="pie" data={(adminDashboard?.user_role_distribution || []).map((x: any) => ({ label: x.role, value: x.count }))} height={260} />
              <div className="mt-4 text-xs text-text-muted">Detailed country/state map available on dashboard geography widget.</div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Course Performance (Enrollments)</CardTitle></CardHeader>
            <CardContent>
              <Chart type="bar" data={(coursePerformance?.courses || []).slice(0, 10).map((x: any) => ({ label: x.title, value: x.enrollments }))} height={280} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Category Popularity</CardTitle></CardHeader>
            <CardContent>
              <Chart type="bar" data={(adminDashboard?.course_category_popularity || []).map((x: any) => ({ label: x.category, value: x.enrollments }))} height={280} />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Courses Snapshot</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {courses.slice(0, 8).map((course) => (
                <div key={course.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <p className="text-sm font-semibold text-text">{course.title}</p>
                    <p className="text-xs text-text-muted">{course.category || 'Uncategorized'} • {course.level || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={course.is_verified ? 'default' : 'outline'}>{course.is_verified ? 'Verified' : 'Unverified'}</Badge>
                    <Badge variant={course.is_published ? 'success' : 'warning'}>{course.is_published ? 'Published' : 'Draft'}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Revenue by Category</CardTitle></CardHeader>
            <CardContent>
              <Chart type="bar" data={(revenueByCategory?.by_category || []).map((x: any) => ({ label: x.category, value: x.revenue }))} height={260} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Payment Quality</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-text-muted">Successful</span><span className="font-bold text-emerald-600">{revenueStats.successful}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-text-muted">Failed</span><span className="font-bold text-red-600">{revenueStats.failed}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-text-muted">Refunded Amount</span><span className="font-bold text-amber-600">₦{revenueStats.refundedAmount.toLocaleString()}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-text-muted">Average Order</span><span className="font-bold">₦{revenueStats.avgOrder.toLocaleString()}</span></div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Event Applications by Month</CardTitle></CardHeader>
            <CardContent>
              <Chart type="line" data={(eventStats?.by_month || []).map((x: any) => ({ label: x.month, value: x.applications }))} height={260} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Top Events by Applications</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(eventStats?.events || []).slice(0, 8).map((event: any) => (
                <div key={event.event_id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <p className="text-sm font-semibold text-text truncate mr-2">{event.title}</p>
                  <span className="text-sm font-bold text-primary">{event.applications}</span>
                </div>
              ))}
              {(!eventStats?.events || eventStats.events.length === 0) && <p className="text-sm text-text-muted">No event analytics returned.</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Rating Distribution</CardTitle></CardHeader>
            <CardContent>
              <Chart type="bar" data={(ratingStats?.distribution || []).map((x: any) => ({ label: `${x.rating}★`, value: x.count }))} height={260} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Top Rated Courses</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(ratingStats?.by_course || []).slice(0, 8).map((course: any) => (
                <div key={course.course_id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <p className="text-sm font-semibold text-text truncate mr-2">{course.title}</p>
                  <span className="text-sm font-bold text-amber-600">{Number(course.avg_rating || 0).toFixed(1)}★</span>
                </div>
              ))}
              {(!ratingStats?.by_course || ratingStats.by_course.length === 0) && <p className="text-sm text-text-muted">No rating analytics returned.</p>}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="pt-2">
        <Link to={`${basePath}/dashboard`} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
          <TrendingUp className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ReportsPage;
