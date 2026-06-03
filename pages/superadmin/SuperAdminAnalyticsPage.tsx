import React, { useEffect, useState } from 'react';
import usersApi from '../../src/api/users';
import { coursesApi } from '../../src/api/courses';
import eventsApi from '../../src/api/events';
import adminPaymentsApi from '../../src/api/admin-payments';
import { analyticsApi } from '../../src/api/analytics';
import { Chart } from '../../components/ui/chart';
import { ReportActions } from '../../components/ui/ReportActions';

const SuperAdminAnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState([
    { label: 'Active Users', value: '0' },
    { label: 'Revenue This Month', value: '$0' },
    { label: 'Published Courses', value: '0' },
    { label: 'Live Events', value: '0' },
  ]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [platformSummary, setPlatformSummary] = useState<any>(null);
  const [revenueByCategory, setRevenueByCategory] = useState<any>(null);
  const [ratingStats, setRatingStats] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<any>(null);
  const [coursePerformance, setCoursePerformance] = useState<any>(null);
  const [quizStats, setQuizStats] = useState<any>(null);
  const [eventStats, setEventStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [userStats, txs, coursesResponse, events, dash, summary, revenue, ratings, active, coursePerf, quiz, eventStat] = await Promise.all([
          usersApi.getUserStats(),
          adminPaymentsApi.getAllTransactions(1, 100),
          coursesApi.getCourses(),
          eventsApi.getEvents(1, 100),
          analyticsApi.getAdminDashboard().catch(() => null),
          analyticsApi.getAdminPlatformSummary().catch(() => null),
          analyticsApi.getAdminRevenueByCategory().catch(() => null),
          analyticsApi.getAdminRatingStats().catch(() => null),
          analyticsApi.getAdminActiveUsers().catch(() => null),
          analyticsApi.getAdminCoursePerformance().catch(() => null),
          analyticsApi.getAdminQuizStats().catch(() => null),
          analyticsApi.getAdminEventStats().catch(() => null),
        ]);
        const courses = coursesResponse.items;
        const total = txs.results.reduce((sum, tx) => sum + tx.amount, 0);

        setDashboard(dash);
        setPlatformSummary(summary);
        setRevenueByCategory(revenue);
        setRatingStats(ratings);
        setActiveUsers(active);
        setCoursePerformance(coursePerf);
        setQuizStats(quiz);
        setEventStats(eventStat);

        setMetrics([
          { label: 'Active Users', value: (summary?.monthly_active_users ?? userStats.active_users).toString() },
          { label: 'Revenue', value: `₦${(summary?.total_revenue ?? total).toLocaleString()}` },
          { label: 'Published Courses', value: (summary?.total_courses ?? courses.filter((course) => course.is_published).length).toString() },
          { label: 'Online Events', value: events.results.filter((event) => event.is_online === true).length.toString() },
        ]);
      } catch (error) {
        console.error('Failed to load super admin analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">Platform Analytics</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Cross-role oversight metrics.</h1>
          <p className="mt-3 text-sm text-gray-600">Super-admin analytics now has its own page instead of falling back to the generic admin dashboard.</p>
        </div>
        <ReportActions />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-500">{metric.label}</p>
            <p className="mt-2 text-3xl font-black text-gray-900">{metric.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Loading analytics charts...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Enrollment Trends</h3>
            <Chart
              type="line"
              data={dashboard?.enrollment_trends?.map((item: any) => ({ label: item.month, value: item.count })) || []}
              height={240}
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Role Distribution</h3>
            <Chart
              type="pie"
              data={dashboard?.user_role_distribution?.map((item: any) => ({ label: item.role, value: item.count })) || []}
              height={240}
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Revenue by Category</h3>
            <Chart
              type="bar"
              data={revenueByCategory?.by_category?.map((item: any) => ({ label: item.category, value: item.revenue })) || []}
              height={240}
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Monthly Active Users</h3>
            <Chart
              type="line"
              data={activeUsers?.monthly?.map((item: any) => ({ label: item.month, value: item.active })) || []}
              height={240}
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Rating Distribution</h3>
            <Chart
              type="bar"
              data={ratingStats?.distribution?.map((item: any) => ({ label: `${item.rating}★`, value: item.count })) || []}
              height={240}
            />
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Course Performance</h3>
            <Chart
              type="bar"
              data={coursePerformance?.courses?.slice(0, 8)?.map((item: any) => ({ label: item.title, value: item.enrollments })) || []}
              height={240}
            />
            <p className="mt-2 text-xs text-gray-500">Bar value = enrollments (top courses)</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Quiz Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Attempts</p>
                <p className="text-xl font-black text-gray-900">{quizStats?.total_attempts ?? 0}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="text-xs text-gray-500">Avg Score</p>
                <p className="text-xl font-black text-gray-900">{Number(quizStats?.average_score || 0).toFixed(1)}%</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-xs text-green-700">Passed</p>
                <p className="text-xl font-black text-green-800">{quizStats?.passed ?? 0}</p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs text-red-700">Failed</p>
                <p className="text-xl font-black text-red-800">{quizStats?.failed ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm xl:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Top Events by Applications</h3>
            <div className="grid gap-2 md:grid-cols-2">
              {(eventStats?.events || []).slice(0, 8).map((event: any) => (
                <div key={event.event_id} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500">{event.date}</p>
                  </div>
                  <span className="text-sm font-black text-cyan-700">{event.applications}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminAnalyticsPage;
