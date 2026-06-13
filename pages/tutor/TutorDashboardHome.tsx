import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { authApi } from '../../src/api/auth';
import { coursesApi, Course } from '../../src/api/courses';
import eventsApi, { Event } from '../../src/api/events';
import analyticsApi from '../../src/api/analytics';
import type { 
  TutorDashboard, 
  TutorRevenue, 
  TutorQuizStats, 
  TutorEnrollmentFunnel 
} from '../../src/api/analytics';
import { Chart } from '../../components/ui/chart';
import { 
  LineChart, 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon 
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../lib/utils';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';

interface TutorDashboardHomeProps {
  user: User | null;
}

const TutorDashboardHome: React.FC<TutorDashboardHomeProps> = ({ user }) => {
  const firstName = user?.name?.split(' ')[0] || 'Tutor';
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: 'My Courses', value: '...', href: '/tutor/courses', icon: 'fa-graduation-cap', tone: 'text-teal-500', bg: 'bg-teal-500/10', note: 'Loading owned courses' },
    { label: 'Published', value: '...', href: '/tutor/courses', icon: 'fa-chart-area', tone: 'text-cyan-500', bg: 'bg-cyan-500/10', note: 'Loading publication stats' },
    { label: 'Events', value: '...', href: '/tutor/events', icon: 'fa-calendar-alt', tone: 'text-emerald-500', bg: 'bg-emerald-500/10', note: 'Loading hosted sessions' },
    { label: 'Notifications', value: 'Live', href: '/tutor/notifications', icon: 'fa-bell', tone: 'text-amber-500', bg: 'bg-amber-500/10', note: 'Tutor workspace alerts' },
  ]);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [dashboardData, setDashboardData] = useState<TutorDashboard | null>(null);
  const [revenueData, setRevenueData] = useState<TutorRevenue | null>(null);
  const [quizStats, setQuizStats] = useState<TutorQuizStats | null>(null);
  const [funnelData, setFunnelData] = useState<TutorEnrollmentFunnel | null>(null);

  const revenueChartData = useMemo(() => {
    const rawData = revenueData?.monthly_revenue || [];
    const dataMap = new Map(rawData.map(r => [r.month, r.amount]));
    
    const points = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().slice(0, 7);
      points.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        value: dataMap.get(monthKey) || 0
      });
    }
    return points;
  }, [revenueData]);

  const enrollmentChartData = useMemo(() => {
    const rawData = dashboardData?.monthly_enrollments || [];
    const dataMap = new Map(rawData.map(e => [e.month, e.count]));
    
    const points = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toISOString().slice(0, 7);
      points.push({
        label: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        value: dataMap.get(monthKey) || 0
      });
    }
    return points;
  }, [dashboardData]);

  const funnelChartData = useMemo(() => {
    if (!funnelData?.funnel) return [];
    return funnelData.funnel.map(f => ({
      label: f.stage,
      value: f.count
    }));
  }, [funnelData]);

  const quizChartData = useMemo(() => {
    if (!quizStats) return [];
    return [
      { label: 'Passed', value: quizStats.passed, color: '#22c55e' },
      { label: 'Failed', value: quizStats.failed, color: '#ef4444' }
    ];
  }, [quizStats]);

  useEffect(() => {
    const load = async () => {
      try {
        const [coursesResponse, events, profile, dashboard, revenue, quizzes, funnel] = await Promise.all([
          coursesApi.getCourses(),
          eventsApi.getEvents(1, 100),
          authApi.getProfile().catch(() => null),
          analyticsApi.getTutorDashboard(),
          analyticsApi.getTutorRevenue('month'),
          analyticsApi.getTutorQuizStats(),
          analyticsApi.getTutorEnrollmentFunnel()
        ]);

        // Handle paginated response - courses could be in results or items array
        const coursesArray = Array.isArray(coursesResponse)
          ? coursesResponse
          : coursesResponse?.results || coursesResponse?.items || [];

        const profileEmail = profile?.email || user?.email;
        const profileId = profile?.id;
        const myCourses = coursesArray.filter((course) =>
          profileId ? course.tutor.id === profileId || course.tutor.email === profileEmail : profileEmail ? course.tutor.email === profileEmail : true
        );

        const myEvents = events.results.filter((event) =>
          profileId
            ? event.creator.id === profileId ||
              event.creator.email === profileEmail ||
              event.organizers.some((organizer) => organizer.id === profileId || organizer.email === profileEmail)
            : profileEmail
              ? event.creator.email === profileEmail || event.organizers.some((organizer) => organizer.email === profileEmail)
              : true
        );

        setStats([
          { label: 'My Courses', value: myCourses.length.toString(), href: '/tutor/courses', icon: 'fa-graduation-cap', tone: 'text-teal-500', bg: 'bg-teal-500/10', note: 'Owned courses in your workspace' },
          { label: 'Published', value: myCourses.filter((course) => course.is_published).length.toString(), href: '/tutor/analytics', icon: 'fa-chart-area', tone: 'text-cyan-500', bg: 'bg-cyan-500/10', note: 'Courses currently live' },
          { label: 'Events', value: myEvents.length.toString(), href: '/tutor/events', icon: 'fa-calendar-alt', tone: 'text-emerald-500', bg: 'bg-emerald-500/10', note: 'Sessions you host or organize' },
          { label: 'Drafts', value: myCourses.filter((course) => !course.is_published).length.toString(), href: '/tutor/courses', icon: 'fa-pen-ruler', tone: 'text-amber-500', bg: 'bg-amber-500/10', note: 'Items still in preparation' },
        ]);
        setRecentCourses(
          [...myCourses]
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 4)
        );
        setRecentEvents(
          [...myEvents]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 4)
        );
        setDashboardData(dashboard);
        setRevenueData(revenue);
        setQuizStats(quizzes);
        setFunnelData(funnel);
      } catch (error) {
        console.error('Failed to load tutor dashboard metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.email]);

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <WelcomeBanner 
          name={firstName}
          message="You have new insights on your courses and student performance. Check your analytics to see how your content is performing!"
          actionText="View Analytics"
          actionLink="/tutor/analytics"
        />
        <div className="rounded-[30px] border border-border bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface)),var(--color-bg-secondary))] p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">Tutor Dashboard</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-text sm:text-4xl">Build, publish, and refine your learning products.</h1>
              <p className="mt-3 max-w-2xl text-sm text-text-secondary sm:text-base">
                {firstName}, this is your dedicated tutor entry point. It focuses on your courses, analytics,
                materials, and events rather than the broader platform operations surface.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/tutor/courses/create" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover">
                <i className="fas fa-plus"></i>
                Create Course
              </Link>
              <Link to="/tutor/analytics" className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-accent hover:bg-surface-hover">
                <i className="fas fa-chart-line"></i>
                View Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <Link 
              key={stat.label} 
              to={stat.href} 
              className="group rounded-[20px] border border-border bg-surface p-4 transition-all hover:border-accent hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors group-hover:bg-accent/10",
                  stat.bg
                )}>
                  <i className={`fas ${stat.icon} text-base ${stat.tone}`}></i>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold uppercase tracking-widest text-text-muted">{stat.label}</p>
                  <p className="text-xl font-black text-text">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <div className="rounded-[24px] border border-border bg-surface p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <LineChart className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-text">Revenue Trends</h2>
              </div>
              <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700">Monthly</Badge>
            </div>
            {revenueChartData.length > 0 ? (
              <Chart type="line" data={revenueChartData} height={220} />
            ) : (
              <div className="h-[220px] flex items-center justify-center rounded-xl border border-dashed border-border bg-bg/50">
                <p className="text-xs text-text-muted uppercase font-bold tracking-widest">No revenue history</p>
              </div>
            )}
          </div>

          {/* Enrollment Trends */}
          <div className="rounded-[24px] border border-border bg-surface p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-text">Student Signups</h2>
              </div>
              <Badge variant="outline" className="bg-blue-50/50 text-blue-700">New Enrollments</Badge>
            </div>
            {enrollmentChartData.length > 0 ? (
              <Chart type="bar" data={enrollmentChartData} height={220} />
            ) : (
              <div className="h-[220px] flex items-center justify-center rounded-xl border border-dashed border-border bg-bg/50">
                <p className="text-xs text-text-muted uppercase font-bold tracking-widest">No enrollment data</p>
              </div>
            )}
          </div>

          {/* Enrollment Funnel */}
          <div className="rounded-[24px] border border-border bg-surface p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <h2 className="text-lg font-bold text-text">Course Lifecycle Funnel</h2>
              </div>
              <p className="mt-1 text-xs text-text-muted">Conversion stages from enrollment to completion</p>
            </div>
            {funnelChartData.length > 0 ? (
              <Chart type="bar" data={funnelChartData} height={200} />
            ) : (
              <div className="h-[200px] flex items-center justify-center rounded-xl border border-dashed border-border bg-bg/50">
                <p className="text-xs text-text-muted uppercase font-bold tracking-widest">No funnel data available</p>
              </div>
            )}
          </div>

          {/* Quiz Performance */}
          <div className="rounded-[24px] border border-border bg-surface p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <PieChartIcon className="h-4 w-4 text-rose-600" />
                </div>
                <h2 className="text-lg font-bold text-text">Global Quiz Metrics</h2>
              </div>
              <p className="mt-1 text-xs text-text-muted">Student pass/fail distribution across all quizzes</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-1/2">
                {quizStats && quizStats.total_attempts > 0 ? (
                  <Chart type="pie" data={quizChartData} height={180} />
                ) : (
                  <div className="h-[180px] flex items-center justify-center rounded-xl border border-dashed border-border bg-bg/50">
                    <p className="text-xs text-text-muted uppercase font-bold tracking-widest">No attempts</p>
                  </div>
                )}
              </div>
              <div className="grid w-full grid-cols-2 gap-3 sm:w-1/2">
                <div className="rounded-xl border border-border bg-surface-alt/50 p-3">
                  <p className="text-[10px] font-bold text-text-muted uppercase">Total</p>
                  <p className="text-lg font-black">{quizStats?.total_attempts || 0}</p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Passed</p>
                  <p className="text-lg font-black text-emerald-600">{quizStats?.passed || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-[24px] border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Recent Courses</p>
                <h2 className="mt-2 text-xl font-black text-text">Latest updates from your catalog</h2>
              </div>
              <Link to="/tutor/courses" className="text-sm font-semibold text-accent hover:text-accent-hover">
                Open all
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-border bg-bg px-4 py-5 text-sm text-text-secondary">Loading courses...</div>
              ) : recentCourses.length === 0 ? (
                <div className="rounded-2xl border border-border bg-bg px-4 py-5 text-sm text-text-secondary">No owned courses yet.</div>
              ) : (
                recentCourses.map((course) => (
                  <Link key={course.id} to={`/tutor/courses/${course.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-4 hover:border-accent hover:bg-surface-hover">
                    <div>
                      <p className="text-sm font-semibold text-text">{course.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-muted">
                        {course.is_published ? 'Published' : 'Draft'} · {course.modules?.reduce((sum: number, mod: any) => sum + (mod.materials?.length || 0), 0) || 0} materials
                      </p>
                    </div>
                    <span className="text-xs text-text-muted">{new Date(course.updated_at).toLocaleDateString()}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-text-muted">Upcoming Sessions</p>
                <h2 className="mt-2 text-xl font-black text-text">Events tied to your teaching work</h2>
              </div>
              <Link to="/tutor/events" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                View events
              </Link>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-border bg-bg px-4 py-5 text-sm text-text-secondary">Loading events...</div>
              ) : recentEvents.length === 0 ? (
                <div className="rounded-2xl border border-border bg-bg px-4 py-5 text-sm text-text-secondary">No upcoming sessions yet.</div>
              ) : (
                recentEvents.map((event) => (
                  <Link key={event.id} to={`/tutor/events/${event.id}`} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-4 py-4 hover:bg-teal-50 hover:border-teal-300">
                    <div>
                      <p className="text-sm font-semibold text-text">{event.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-text-muted">
                        {event.type} · {event.registrations_count}/{event.capacity} registered
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

export default TutorDashboardHome;
