import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import usersApi from '../../src/api/users';
import { coursesApi, Course } from '../../src/api/courses';
import eventsApi, { Event } from '../../src/api/events';
import adminPaymentsApi from '../../src/api/admin-payments';
import { analyticsApi } from '../../src/api/analytics';
import { Chart } from '../../components/ui/chart';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import { ReportActions } from '../../components/ui/ReportActions';

interface SuperAdminDashboardHomeProps {
  user: User | null;
}

const SuperAdminDashboardHome: React.FC<SuperAdminDashboardHomeProps> = ({ user }) => {
  const firstName = user?.name?.split(' ')[0] || 'Leader';
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([
    { label: 'User Governance', value: '...', href: '/super-admin/users', icon: 'fa-users-cog', tone: 'text-accent' },
    { label: 'Course Reviews', value: '...', href: '/super-admin/reviews', icon: 'fa-comments', tone: 'text-accent' },
    { label: 'Financial Oversight', value: '...', href: '/super-admin/payments', icon: 'fa-wallet', tone: 'text-accent' },
    { label: 'Platform Controls', value: '...', href: '/super-admin/settings', icon: 'fa-sliders-h', tone: 'text-accent' },
  ]);
  const [recentUsers, setRecentUsers] = useState<Array<{ id: number; name: string; role: string; joined: string }>>([]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [revenueByCategory, setRevenueByCategory] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [userStats, usersResponse, coursesResponse, events, txs, dashboard, revenue] = await Promise.all([
          usersApi.getUserStats(),
          usersApi.getUsers(1, 5),
          coursesApi.getCourses(),
          eventsApi.getEvents(1, 100),
          adminPaymentsApi.getAllTransactions(1, 100),
          analyticsApi.getAdminDashboard().catch(() => null),
          analyticsApi.getAdminRevenueByCategory().catch(() => null),
        ]);
        const courses = coursesResponse.items;
        const total = txs.results.reduce((sum, tx) => sum + tx.amount, 0);

        setMetrics([
          { label: 'Users', value: userStats.total_users.toString(), href: '/super-admin/users', icon: 'fa-users-cog', tone: 'text-accent' },
          { label: 'Revenue', value: `$${total}`, href: '/super-admin/payments', icon: 'fa-wallet', tone: 'text-accent' },
          { label: 'Courses', value: courses.length.toString(), href: '/super-admin/courses', icon: 'fa-graduation-cap', tone: 'text-accent' },
          { label: 'Ratings', value: `${userStats.users_by_role.TUTOR + userStats.users_by_role.USER}`, href: '/super-admin/users/ratings', icon: 'fa-star', tone: 'text-accent' },
        ]);
        setRecentUsers(
          usersResponse.results.map((entry) => ({
            id: entry.id,
            name: entry.full_name,
            role: entry.role,
            joined: entry.date_joined,
          }))
        );
        setRecentCourses(
          [...courses]
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 5)
        );
        setRecentEvents(
          [...events.results]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 5)
        );
        setDashboardData(dashboard);
        setRevenueByCategory(revenue);
      } catch (error) {
        console.error('Failed to load super admin metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WelcomeBanner 
          name={firstName}
          message="Monitor platform-wide activity and manage global settings. You have 5 new system alerts that require your attention."
          actionText="View Alerts"
          actionLink="/super-admin/notifications"
        />
        <div className="rounded-[30px] border border-border bg-surface p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-text-secondary">Super Admin Dashboard</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl text-text">Platform governance, roles, and oversight.</h1>
            <p className="mt-3 max-w-2xl text-sm text-text-secondary sm:text-base">
                {firstName}, this workspace now combines platform governance, admin operations, and tutor-side content controls in one namespace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ReportActions />
              <Link to="/super-admin/users" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover">
                <i className="fas fa-user-plus"></i>
                Manage Users
              </Link>
              <Link to="/super-admin/reviews" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-text hover:bg-surface-hover">
                <i className="fas fa-comments"></i>
                Review Queue
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Link key={metric.label} to={metric.href} className="rounded-[24px] border border-border bg-surface p-5 hover:bg-surface-hover">
              <i className={`fas ${metric.icon} text-2xl ${metric.tone}`}></i>
              <p className="mt-4 text-sm uppercase tracking-[0.2em] text-text-muted">{metric.label}</p>
              <h2 className="mt-2 text-3xl font-black text-text">{metric.value}</h2>
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-[24px] border border-border bg-surface p-6 xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Platform Trends</p>
                <h2 className="mt-2 text-xl font-black text-text">Monthly Enrollments</h2>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-bg-secondary p-3">
              <Chart
                type="line"
                data={dashboardData?.enrollment_trends?.map((item: any) => ({ label: item.month, value: item.count })) || []}
                height={220}
              />
            </div>
          </div>
          <div className="rounded-[24px] border border-border bg-surface p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Revenue Mix</p>
            <h2 className="mt-2 text-xl font-black text-text">By Category</h2>
            <div className="mt-4 rounded-xl bg-bg-secondary p-3">
              <Chart
                type="pie"
                data={revenueByCategory?.by_category?.slice(0, 6)?.map((item: any) => ({ label: item.category, value: item.revenue })) || []}
                height={220}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="rounded-[24px] border border-border bg-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Recent Accounts</p>
                <h2 className="mt-2 text-xl font-black text-text">Latest privileged and learner access changes</h2>
              </div>
              <Link to="/super-admin/users" className="text-sm font-semibold text-text-link hover:text-text">Open users</Link>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-border bg-surface px-4 py-5 text-sm text-text-muted">Loading users...</div>
              ) : recentUsers.length === 0 ? (
                <div className="rounded-2xl border border-border bg-surface px-4 py-5 text-sm text-text-muted">No user records returned.</div>
              ) : (
                recentUsers.map((entry) => (
                  <Link key={entry.id} to={`/super-admin/users/${entry.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-4 hover:bg-surface-hover">
                    <div>
                      <p className="text-sm font-semibold text-text">{entry.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-muted">{entry.role}</p>
                    </div>
                    <span className="text-xs text-text-muted">{new Date(entry.joined).toLocaleDateString()}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Recent Courses</p>
                <h2 className="mt-2 text-xl font-black text-text">Latest catalog changes</h2>
              </div>
              <Link to="/super-admin/courses" className="text-sm font-semibold text-text-link hover:text-text">Open courses</Link>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-border bg-surface px-4 py-5 text-sm text-text-muted">Loading courses...</div>
              ) : recentCourses.length === 0 ? (
                <div className="rounded-2xl border border-border bg-surface px-4 py-5 text-sm text-text-muted">No courses returned.</div>
              ) : (
                recentCourses.map((course) => (
                  <Link key={course.id} to={`/super-admin/courses/${course.id}/edit`} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-4 hover:bg-surface-hover">
                    <div>
                      <p className="text-sm font-semibold text-text">{course.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-muted">
                        {course.is_published ? 'Published' : 'Draft'} · {course.tutor.full_name}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">{new Date(course.updated_at).toLocaleDateString()}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Upcoming Events</p>
                <h2 className="mt-2 text-xl font-black text-text">Cross-platform live sessions</h2>
              </div>
              <Link to="/super-admin/events" className="text-sm font-semibold text-text-link hover:text-text">Open events</Link>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-border bg-surface px-4 py-5 text-sm text-text-muted">Loading events...</div>
              ) : recentEvents.length === 0 ? (
                <div className="rounded-2xl border border-border bg-surface px-4 py-5 text-sm text-text-muted">No events returned.</div>
              ) : (
                recentEvents.map((event) => (
                  <Link key={event.id} to={`/super-admin/events/${event.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-4 hover:bg-surface-hover">
                    <div>
                      <p className="text-sm font-semibold text-text">{event.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-muted">
                        {event.type} · {event.status}
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">{new Date(event.date).toLocaleDateString()}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardHome;
