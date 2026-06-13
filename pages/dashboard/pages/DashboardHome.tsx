import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ThemeLink } from '@/components/ui/theme-link';
import { ButtonLink } from '@/components/ui/button-link';
import { User, Enrollment } from '../../../types';
import { coursesApi } from '../../../src/api/courses';
import eventsApi from '../../../src/api/events';
import notificationsApi from '../../../src/api/notifications';
import { quizzesApi } from '../../../src/api/quizzes';
import analyticsApi, { StudentDashboardSummary } from '../../../src/api/analytics';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { cn } from '../../../lib/utils';
import { Progress } from '../../../components/ui/progress';
import { Chart } from '../../../components/ui/chart';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import {
  Play,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Compass,
  Calendar,
  ChevronRight,
  Bell,
  X,
  LayoutGrid,
  TrendingUp,
  CreditCard,
  BarChart3,
  Target,
  Zap,
  Trophy
} from 'lucide-react';

interface DashboardHomeProps {
  user: User | null;
}

interface EnrollmentWithProgress extends Enrollment {
  nextLesson?: string;
  is_course_completed?: boolean;
  progress_percentage?: number;
}

const isAcademicallyCompleted = (enrollment: EnrollmentWithProgress) =>
  Boolean(enrollment.is_course_completed ?? enrollment.completed);

const DashboardHome: React.FC<DashboardHomeProps> = ({ user }) => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithProgress[]>([]);
  const [exploreCourses, setExploreCourses] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState<StudentDashboardSummary | null>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [quizSummary, setQuizSummary] = useState<any>(null);

  // New State for Analytics Features
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [enrollmentSummary, setEnrollmentSummary] = useState<any>(null);
  const [eventSummary, setEventSummary] = useState<any>(null);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % announcements.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [announcements.length]);

  useEffect(() => {
    if (!leaderboardData?.courses) return;
    const timer = setTimeout(() => {
      document.querySelectorAll('.progress-bar').forEach((bar) => {
        const target = bar.getAttribute('data-target-width');
        if (target) (bar as HTMLElement).style.width = target;
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [leaderboardData]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        enrollmentsResponse,
        allCoursesResponse,
        eventsData,
        announcementsData,
        dashboardSummaryData,
        activityResponse,
        quizResponse,
        // Fetch new Analytics
        leaderboardResponse,
        enrollmentSummaryResponse,
        eventSummaryResponse
      ] = await Promise.allSettled([
        coursesApi.getEnrollments(),
        coursesApi.getCourses(1, 10),
        eventsApi.getEvents(1, 5),
        notificationsApi.getNotifications(1, 3, false, 'system'),
        analyticsApi.getStudentDashboardSummary(),
        analyticsApi.getStudentActivity(7),
        analyticsApi.getStudentQuizSummary(),
        analyticsApi.getStudentCourseProgress(),
        analyticsApi.getStudentEnrollmentSummary(),
        analyticsApi.getStudentEventSummary(),
      ]);

      const enrollmentsData = enrollmentsResponse.status === 'fulfilled'
        ? (enrollmentsResponse.value?.results || enrollmentsResponse.value?.items || [])
        : [];

      const enrolledIds = new Set(enrollmentsData.map((e: any) => e.course?.id || e.course));
      const allCourses = allCoursesResponse.status === 'fulfilled'
        ? (allCoursesResponse.value?.results || allCoursesResponse.value?.items || [])
        : [];

      const availableCourses = allCourses.filter((c: any) => !enrolledIds.has(c.id) && c.is_published).slice(0, 4);
      const eventsList = eventsData.status === 'fulfilled' ? eventsData.value.results || [] : [];
      const announcementsList = announcementsData.status === 'fulfilled' ? announcementsData.value.results || [] : [];

      setEnrollments(enrollmentsData);
      setExploreCourses(availableCourses);
      setAnnouncements(announcementsList);
      setUpcomingEvents(eventsList.slice(0, 3));

      if (dashboardSummaryData.status === 'fulfilled' && dashboardSummaryData.value) setDashboardSummary(dashboardSummaryData.value);
      if (activityResponse.status === 'fulfilled' && activityResponse.value) setActivityData(activityResponse.value);
      if (quizResponse.status === 'fulfilled' && quizResponse.value) setQuizSummary(quizResponse.value);

      // Update Analytics State
      if (leaderboardResponse.status === 'fulfilled') setLeaderboardData(leaderboardResponse.value);
      if (enrollmentSummaryResponse.status === 'fulfilled') setEnrollmentSummary(enrollmentSummaryResponse.value);
      if (eventSummaryResponse.status === 'fulfilled') setEventSummary(eventSummaryResponse.value);

    } catch (error) {
      console.error('Dashboard data load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chart data
  const activityChartData = useMemo(() => {
    if (!activityData?.daily) return { labels: [], datasets: [] };
    return {
      labels: activityData.daily.map((d: any) => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [{
        label: 'Minutes Studied',
        data: activityData.daily.map((d: any) => d.minutes),
        borderColor: '#9333ea',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  }, [activityData]);

  const quizChartData = useMemo(() => {
    if (!quizSummary) return { labels: [], datasets: [] };
    return {
      labels: ['Passed', 'Failed'],
      datasets: [{
        data: [quizSummary.passed || 0, quizSummary.failed || 0],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 0,
      }]
    };
  }, [quizSummary]);

  const formatAmount = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(num);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-bold text-text-muted animate-pulse uppercase tracking-widest">Initialising Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-32 lg:grid lg:grid-cols-12 lg:gap-8 lg:pb-20">

      {/* 1. ANNOUNCEMENTS / HERO */}
      {announcements.length > 0 && (
        <section className="lg:col-span-12 relative rounded-3xl overflow-hidden shadow-sm bg-gray-900 mt-6">
          {announcements.map((announcement: any, index: number) => {
            const isActive = index === currentAdIndex;
            const themes = [
              { badge: 'bg-blue-600', accent: 'text-blue-400', btn: 'bg-blue-600 hover:bg-blue-500' },
              { badge: 'bg-emerald-600', accent: 'text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500' },
              { badge: 'bg-purple-600', accent: 'text-purple-400', btn: 'bg-purple-600 hover:bg-purple-500' },
              { badge: 'bg-rose-600', accent: 'text-rose-400', btn: 'bg-rose-600 hover:bg-rose-500' },
              { badge: 'bg-amber-600', accent: 'text-amber-400', btn: 'bg-amber-600 hover:bg-amber-500' },
            ];
            const images = [
              'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
              'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=80',
              'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1600&q=80',
              'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1600&q=80',
              'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
            ];
            const badgeLabels = ['New Update', 'Important', 'Announcement', 'Featured', 'Notice'];
            const t = themes[index % themes.length];

            return (
              <div
                key={announcement.id}
                className={`slide transition-opacity duration-700 ease-in-out ${isActive ? 'relative z-10 opacity-100' : 'absolute inset-0 z-0 opacity-0 pointer-events-none'
                  }`}
              >
                <img
                  src={images[index % images.length]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover object-right"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent md:via-black/60" />

                <div className="relative flex flex-col justify-between p-5 md:p-8 text-white z-20">
                  <div>
                    <span className={`inline-block ${t.badge} text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-md mb-3`}>
                      {badgeLabels[index % badgeLabels.length]}
                    </span>
                    <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold max-w-2xl leading-tight tracking-tight uppercase text-white">
                      {announcement.title || 'New Announcement'}
                    </h2>
                    <p className="text-sm md:text-base text-gray-300 mt-2 max-w-lg font-medium leading-relaxed">
                      {announcement.message.length > 200
                        ? `${announcement.message.substring(0, 200)}...`
                        : announcement.message}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <Link
                      to={announcement.action_url || '#'}
                      className={`inline-flex items-center space-x-1.5 ${t.btn} text-white font-bold px-4 py-1.5 text-xs rounded-full shadow-sm transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      <span>VIEW DETAILS</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    <div className="flex items-center gap-x-4 text-xs text-gray-300 border-t border-white/10 pt-2">
                      <span>Source: <strong className="text-white">System</strong></span>
                      <span className="text-white/30">|</span>
                      <span>Priority: <strong className="text-white">High</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      <div className="lg:col-span-12">
        <WelcomeBanner
          name={user?.name?.split(' ')[0] || 'Learner'}
          actionLink="/dashboard/progress"
        />
      </div>

      {/* 3. KEY METRICS */}
      <section className="lg:col-span-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(dashboardSummary ? [
          { label: 'Overall Completion', value: `${dashboardSummary.overall_completion}%`, icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Active Courses', value: enrollments.filter(e => !isAcademicallyCompleted(e)).length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Completed', value: enrollments.filter(e => isAcademicallyCompleted(e)).length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Quizzes Passed', value: dashboardSummary.quizzes_passed, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ] : [
          { label: 'Active Courses', value: enrollments.filter(e => !isAcademicallyCompleted(e)).length, icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Completed', value: enrollments.filter(e => isAcademicallyCompleted(e)).length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Learning Hours', value: `${Math.round((activityData?.total_minutes || 0) / 60)}h`, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Achievements', value: enrollments.filter(e => isAcademicallyCompleted(e)).length, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ]).map((stat, i) => (
          <div key={i} className="backdrop-blur-md bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-sm">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", stat.bg)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <p className="text-xl font-bold text-text tracking-tight">{stat.value}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* 4. CHARTS SECTION */}
      {dashboardSummary && (
        <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface p-4 rounded-xl border border-border shadow-sm hover:shadow-sm">
            <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Weekly Activity
            </h3>
            {activityChartData.labels?.length > 0 ? (
              <Chart type="line" data={activityChartData} height={200} />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-muted text-xs uppercase">No activity data</div>
            )}
          </div>
          <div className="bg-surface p-4 rounded-xl border border-border shadow-sm hover:shadow-sm">
            <h3 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-500" />
              Quiz Pass Rate
            </h3>
            {quizChartData.labels?.length > 0 ? (
              <Chart type="pie" data={quizChartData} height={200} showLabels />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-text-muted text-xs uppercase">No quiz data</div>
            )}
          </div>
        </section>
      )}

      {/* Analytics Section */}
      <section className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* Course Progress Leaderboard */}
        <div className="w-full rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all duration-300 hover:shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <Trophy className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-text">
              Course Leaderboard
            </h3>
          </div>

          <div className="space-y-3">
            {leaderboardData?.courses ? (
              leaderboardData.courses.slice(0, 5).map((c: any, i: number) => (
                <div key={c.course_id} className="group relative flex h-9 w-full items-center overflow-hidden rounded-xl bg-surface-hover border border-border transition-transform duration-200 hover:scale-[1.01]">
                  <div
                    className="progress-bar absolute bottom-0 left-0 top-0 rounded-xl transition-all ease-out duration-1000"
                    style={{
                      width: '0%',
                      transitionDelay: `${i * 100}ms`,
                      backgroundColor: 'var(--color-primary)',
                      opacity: 0.85,
                    }}
                    data-target-width={`${c.completion}%`}
                  />
                  <div className="relative z-10 flex w-full items-center justify-between px-3 text-xs font-medium">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-gray-300 text-[10px] font-extrabold text-primary shadow-sm">
                        #{i + 1}
                      </span>
                      <span className="truncate text-text-secondary group-hover:text-text transition-colors duration-200">
                        {c.title}
                      </span>
                    </div>
                    <span className="ml-2 shrink-0 font-bold text-text">{c.completion}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted py-4 text-center">No leaderboard data</p>
            )}
          </div>
        </div>

        {/* Enrollment Summary */}
        <div className="bg-surface p-3 md:p-4 rounded-xl border border-border shadow-sm hover:shadow-sm transition-shadow">
          <h3 className="text-xs md:text-sm font-bold text-text mb-3 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
            Enrollment Summary
          </h3>
          {enrollmentSummary?.by_category ? (
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {enrollmentSummary.by_category.map((c: any) => (
                <span key={c.category} className="inline-flex items-center gap-1 px-2.5 py-1 md:px-3 md:py-1.5 bg-primary/5 border border-primary/10 rounded-full text-[11px] md:text-xs">
                  <span className="font-medium text-text">{c.category}</span>
                  <span className="text-text-muted">{c.count}</span>
                </span>
              ))}
            </div>
          ) : <p className="text-xs text-text-muted py-4 text-center">No summary data</p>}
        </div>

        {/* Event Summary */}
        <div className="bg-surface p-3 md:p-4 rounded-xl border border-border shadow-sm hover:shadow-sm transition-shadow">
          <h3 className="text-xs md:text-sm font-bold text-text mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-500" />
            Event Participation
          </h3>
          {eventSummary ? (
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-2.5 md:p-3 text-center">
                <p className="text-lg md:text-2xl font-bold text-emerald-500">{eventSummary.upcoming}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5 md:mt-1">Upcoming</p>
              </div>
              <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-2.5 md:p-3 text-center">
                <p className="text-lg md:text-2xl font-bold text-blue-500">{eventSummary.past}</p>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5 md:mt-1">Past</p>
              </div>
            </div>
          ) : <p className="text-xs text-text-muted py-4 text-center">No event data</p>}
        </div>
      </section>

      {/* 5. MAIN CONTENT AREA (CONTINUE LEARNING) */}
      <div className="lg:col-span-8 space-y-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-text tracking-tight">Active Learning</h2>
            <ThemeLink to="/dashboard/courses" variant="accent" className="text-xs font-bold">See All</ThemeLink>
          </div>

          {enrollments.filter(e => !isAcademicallyCompleted(e)).length > 0 ? (
            <div className="space-y-3">
              {enrollments.filter(e => !isAcademicallyCompleted(e)).slice(0, 2).map((enrollment) => {
                return (
                  <Link
                    key={enrollment.id}
                    to={`/dashboard/course/${enrollment.course?.id || (typeof enrollment.course === 'number' ? enrollment.course : '')}`}
                    className="block backdrop-blur-md bg-surface border border-border rounded-xl p-4 shadow-sm hover:shadow-sm hover:bg-surface/60 transition-all group"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-surface-alt">
                        <img
                          src={enrollment.course?.thumbnail_url || '/Logo/logo.png'}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-col">
                          <h3 className="text-sm font-bold text-text line-clamp-1 group-hover:text-primary transition-colors">{enrollment.course?.title || 'Course'}</h3>
                          <p className="text-xs text-text-muted truncate">Lesson: {enrollment.course?.tutor?.full_name || 'Expert Instructor'}</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{enrollment.progress_percentage ?? enrollment.progress ?? 0}% Complete</span>
                          </div>
                          <Progress
                            value={enrollment.progress_percentage ?? enrollment.progress ?? 0}
                            className="h-1.5 w-full bg-surface-alt"
                            indicatorClassName="bg-primary"
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm hover:shadow-sm">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}            </div>
          ) : (
            <div className="backdrop-blur-md bg-surface border-2 border-dashed border-border rounded-xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6 text-text-muted" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-text">No active courses</p>
                <p className="text-xs text-text-muted">Start your journey by exploring our catalog</p>
              </div>
              <ButtonLink to="/courses" size="sm" className="rounded-lg font-bold">
                Discover Content
              </ButtonLink>
            </div>
          )}
        </section>

        {/* 6. RECOMMENDED */}
        {exploreCourses.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-lg font-bold text-text tracking-tight">Recommended for You</h2>
              <ThemeLink to="/courses" variant="accent" className="text-xs font-bold">Explore</ThemeLink>
            </div>

            <p className="text-sm text-text-muted px-1">Tailored learning paths to elevate your technical stack and skills.</p>

            <div className="flex flex-col space-y-3">
              {exploreCourses.map((course) => {
                const initials = course.tutor?.full_name
                  ? course.tutor.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  : 'IN';
                return (
                  <Link
                    key={course.id}
                    to={`/dashboard/course/${course.id}`}
                    className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-surface border border-border rounded-xl shadow-sm transition-all duration-300 hover:border-accent/50 hover:shadow-accent/5 group"
                  >
                    {/* Left: Thumbnail */}
                    <div className="w-full sm:w-36 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-surface-alt relative">
                      <img
                        src={course.thumbnail_url || '/Logo/logo.png'}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-primary/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {course.level || 'Popular'}
                      </span>
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 flex flex-col min-w-0 space-y-1.5">
                      {/* Meta Info & Rating */}
                      <div className="flex items-center gap-2 text-[11px] text-text-muted font-medium flex-wrap">
                        <span className="text-accent font-semibold tracking-wider uppercase">{course.category || 'Course'}</span>
                        <span>&bull;</span>
                        <span>{course.modules?.length || 0} Modules</span>
                        {course.average_rating ? (
                          <>
                            <span>&bull;</span>
                            <div className="flex items-center text-amber-400">
                              <span className="mr-1">{Number(course.average_rating).toFixed(1)}</span>
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          </>
                        ) : null}
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-text leading-snug group-hover:text-accent transition-colors line-clamp-1">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-text-muted line-clamp-1 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Footer: Tutor & Price & Action */}
                      <div className="flex items-center justify-between pt-2 mt-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-accent to-primary flex items-center justify-center text-[8px] font-bold text-white shrink-0">
                            {initials}
                          </div>
                          <span className="text-[11px] font-medium text-text truncate">{course.tutor?.full_name || 'Instructor'}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase">
                            {(course.total_amount === '0' || course.total_amount === '0.00' || course.price === '0' || course.price === '0.00')
                              ? 'Free'
                              : formatAmount(course.total_amount || course.price)}
                          </span>
                          <span className="px-3 py-1 bg-surface-hover hover:bg-accent text-text hover:text-white text-[10px] font-bold rounded-lg transition-all duration-200 tracking-wide cursor-pointer">
                            View
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* SIDEBAR AREA (ON DESKTOP) / BOTTOM SECTIONS (ON MOBILE) */}
      <aside className="lg:col-span-4 space-y-6">

        {/* 7. QUICK ACTIONS */}
        <section className="space-y-4 mt-2">
          <h2 className="text-sm font-bold text-dark uppercase tracking-[0.2em] px-1 ">Quick Workspace</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Achievements', icon: Award, href: '/dashboard/certificates', color: 'text-amber-500' },
              { label: 'My Growth', icon: TrendingUp, href: '/dashboard/progress', color: 'text-blue-500' },
              { label: 'Payments', icon: CreditCard, href: '/dashboard/transactions', color: 'text-purple-500' },
              { label: 'Certificates', icon: Award, href: '/dashboard/certificates', color: 'text-emerald-500' },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.href}
                className="flex items-center gap-3 backdrop-blur-md bg-surface border border-border rounded-xl p-3 shadow-sm hover:shadow-sm hover:bg-surface/60 transition-all active:scale-[0.98]"
              >
                <div className="p-2 rounded-lg bg-surface-alt border border-border/30">
                  <action.icon className={cn("w-4 h-4", action.color)} />
                </div>
                <span className="text-xs font-bold text-text/80">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 8. UPCOMING EVENTS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-text-muted uppercase tracking-[0.2em]">Events</h2>
            <ThemeLink to="/dashboard/events" variant="accent" className="text-[10px] font-bold">View All</ThemeLink>
          </div>
          <div className="backdrop-blur-md bg-surface border border-border rounded-xl divide-y divide-border/30 overflow-hidden shadow-sm hover:shadow-sm">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 flex items-start gap-4 hover:bg-surface transition-colors cursor-pointer group">
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-lg bg-surface-alt border border-border">
                    <span className="text-[10px] font-bold text-primary leading-none uppercase">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-base font-bold text-text leading-none mt-0.5">{new Date(event.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-text truncate group-hover:text-primary transition-colors">{event.title}</h4>
                    <p className="text-[10px] text-text-muted font-medium mt-0.5">{new Date(event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} • {event.type || 'Workshop'}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted self-center" />
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Calendar className="w-6 h-6 text-text-muted mx-auto mb-2" />
                <p className="text-xs font-bold text-text-muted">No events scheduled</p>
              </div>
            )}
          </div>
        </section>
      </aside>

    </div>
  );
};

export default DashboardHome;
