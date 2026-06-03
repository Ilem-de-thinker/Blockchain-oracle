import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { Course, coursesApi } from '../../../src/api/courses';
import analyticsApi, { 
  TutorDashboard, 
  TutorDashboardSummary, 
  TutorRevenue, 
  TutorQuizStats,
  TutorEnrollmentFunnel,
  TutorRatings
} from '../../../src/api/analytics';
import { Chart } from '../../../components/ui/chart';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Star, 
  Activity, 
  ArrowUpRight, 
  PieChart as PieChartIcon, 
  LineChart, 
  BarChart3,
  RefreshCcw,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { ReportActions } from '../../../components/ui/ReportActions';
import { cn } from '@/lib/utils';

const TutorAnalyticsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tutorIdParam = searchParams.get('tutor_id');
  const tutorId = tutorIdParam ? parseInt(tutorIdParam) : undefined;

  const [courses, setCourses] = useState<Course[]>([]);
  const [dashboardData, setDashboardData] = useState<TutorDashboard | null>(null);
  const [summaryData, setSummaryData] = useState<TutorDashboardSummary | null>(null);
  const [revenueData, setRevenueData] = useState<TutorRevenue | null>(null);
  const [quizStats, setQuizStats] = useState<TutorQuizStats | null>(null);
const [funnelData, setFunnelData] = useState<TutorEnrollmentFunnel | null>(null);
   const [ratingsData, setRatingsData] = useState<TutorRatings | null>(null);
const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (location.state?.selectedCourseId) {
      setSelectedCourseId(location.state.selectedCourseId);
      // Clear state to avoid persisting across navigation
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        coursesData, 
        dashboard, 
        summary, 
        revenue, 
        quizzes,
        funnel,
        ratings
      ] = await Promise.all([
        coursesApi.getCourses(),
        analyticsApi.getTutorDashboard(tutorId),
        analyticsApi.getTutorDashboardSummary(tutorId),
        analyticsApi.getTutorRevenue('month', tutorId),
        analyticsApi.getTutorQuizStats(tutorId),
        analyticsApi.getTutorEnrollmentFunnel(tutorId),
        analyticsApi.getTutorRatings(tutorId)
      ]);

// Filter courses if viewing a specific tutor
       let filteredCourses = coursesData.items || [];
       if (tutorId) {
        filteredCourses = filteredCourses.filter((c: any) => c.tutor?.id === tutorId);
      }
      
      setCourses(filteredCourses);
      setDashboardData(dashboard);
      setSummaryData(summary);
      setRevenueData(revenue);
setQuizStats(quizzes);
       setFunnelData(funnel);
       setRatingsData(ratings);
    } catch (error) {
      console.error('Failed to fetch tutor analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [tutorId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCcw className="animate-spin h-10 w-10 text-emerald-600" />
        <p className="text-sm font-bold text-text-muted uppercase tracking-widest">Gathering Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/70">
              <Activity className="h-3.5 w-3.5" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Instructor Intelligence</p>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">Platform Performance.</h1>
            <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/80 sm:text-sm">
              Monitor your growth, student engagement, and revenue across all your course offerings. 
              {tutorId ? ` Viewing data for Tutor ID: ${tutorId}` : ' Scoped to your personal teaching workspace.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ReportActions />
            <Link 
              to={tutorId ? `/admin/courses/create?tutor_id=${tutorId}` : "/tutor/courses/create"} 
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-emerald-700 shadow-sm hover:bg-emerald-50 active:scale-95 transition-all"
            >
              <i className="fas fa-plus text-[10px]"></i>
              Create Course
            </Link>
          </div>
        </div>
        {/* Abstract background elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Revenue', value: formatCurrency(summaryData?.total_revenue || 0), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Students', value: summaryData?.total_students || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Courses', value: summaryData?.total_courses || 0, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Avg Rating', value: summaryData?.avg_rating || 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Completion', value: `${summaryData?.completion_rate || 0}%`, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Active This Week', value: summaryData?.active_students_this_week || 0, icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-accent">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2.5", stat.bg)}>
              <stat.icon className={cn("w-4 h-4", stat.color)} />
            </div>
            <p className="text-xl font-black text-text tracking-tight leading-none">{stat.value}</p>
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
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

      {/* Individual Course Selection & Charts */}
      <div className="rounded-[24px] border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border bg-bg/50 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-text">Course-Specific Performance</h2>
            <p className="text-[11px] text-text-muted">Select a course to analyze its specific student engagement and quiz metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              className="h-9 rounded-xl border border-border bg-surface px-3 text-xs font-bold text-text outline-none focus:ring-2 focus:ring-emerald-500/20 min-w-[200px]"
              value={selectedCourseId || ''}
              onChange={(e) => setSelectedCourseId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Select a Course...</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
            {selectedCourseId && (
              <Button variant="ghost" size="sm" className="h-9 text-[10px] font-bold uppercase tracking-wider" onClick={() => setSelectedCourseId(null)}>
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="p-5">
          {selectedCourseId ? (
            (() => {
              const courseId = Number(selectedCourseId);
              const course = dashboardData?.per_course?.find(c => Number(c.course_id) === courseId);
              const rating = ratingsData?.per_course?.find(c => Number(c.course_id) === courseId);
              const quiz = quizStats?.per_course?.find(c => Number(c.course_id) === courseId);
              const funnel = funnelData?.per_course?.find(c => Number(c.course_id) === courseId);

              if (!course && !isLoading) return (
                <div className="py-12 text-center">
                  <p className="text-sm font-bold text-text-muted">No specific data found for this course yet.</p>
                  <p className="text-xs text-text-muted mt-1">Analytics are generated periodically as students engage with the content.</p>
                </div>
              );              
              return (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border p-4 bg-bg/30">
                    <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Enrollments</h3>
                    <p className="text-xl font-black text-text">{course.enrollments}</p>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-bg/30">
                    <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Completion Rate</h3>
                    <p className="text-xl font-black text-text">{course.completion_rate}%</p>
                    <div className="w-full h-1.5 rounded-full bg-surface overflow-hidden mt-2">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${course.completion_rate}%` }} />
                    </div>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-bg/30">
                    <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-1">Average Rating</h3>
                    <p className="text-xl font-black text-text">{rating?.avg_rating || 'N/A'}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{rating?.total_reviews || 0} reviews</p>
                  </div>
                  <div className="rounded-xl border border-border p-4 bg-bg/30">
                    <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Quiz Performance</h3>
                    {(quiz?.passed || quiz?.failed) ? (
                      <div className="flex items-center gap-4">
                        <div className="w-1/2">
                          <Chart 
                            type="pie" 
                            data={[
                              { label: 'Passed', value: quiz.passed, color: '#22c55e' },
                              { label: 'Failed', value: quiz.failed, color: '#ef4444' }
                            ]} 
                            height={100} 
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 w-1/2">
                          <div className="rounded-lg border border-emerald-100 bg-emerald-50/30 p-1.5 px-2">
                            <p className="text-[8px] font-bold text-emerald-600 uppercase">Passed</p>
                            <p className="text-base font-black text-emerald-600">{quiz.passed}</p>
                          </div>
                          <div className="rounded-lg border border-rose-100 bg-rose-50/30 p-1.5 px-2">
                            <p className="text-[8px] font-bold text-rose-600 uppercase">Failed</p>
                            <p className="text-base font-black text-rose-600">{quiz.failed}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[100px] flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-bg/50">
                        <p className="text-[9px] text-text-muted uppercase font-bold tracking-widest">No quiz data</p>
                      </div>
                    )}
                  </div>
                  {funnel && (
                    <div className="md:col-span-2 rounded-xl border border-border p-4 bg-bg/30">
                      <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Enrollment Funnel</h3>
                      <Chart 
                        type="bar" 
                        data={[
                          { label: 'Enrolled', value: funnel.enrolled },
                          { label: 'In Progress', value: funnel.in_progress },
                          { label: 'Completed', value: funnel.completed }
                        ]} 
                        height={160} 
                      />
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <div className="flex flex-col items-center justify-center py-16 opacity-40">
              <BookOpen className="h-10 w-10 mb-3" />
              <p className="text-sm font-bold uppercase tracking-widest text-text-muted">Select a course to begin analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Courses Detailed List (Portfolio Analysis) */}
      <div className="rounded-[24px] border border-border bg-surface shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-border bg-bg/50 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-black text-text">Portfolio Analysis</h2>
            <p className="text-[11px] text-text-muted">Individual performance metrics across your entire course catalog</p>
          </div>
          <Link 
            to={tutorId ? `/admin/courses?tutor_id=${tutorId}` : "/tutor/courses"} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 group"
          >
            Manage all
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-surface-alt/30">
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted">Course Identity</th>
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted">Status</th>
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted text-center">Enrollments</th>
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted text-center">Comp. Rate</th>
                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted text-right">Revenue</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courses.length > 0 ? (
                courses.map((course) => {
                  const analytics = dashboardData?.per_course?.find(p => p.course_id === course.id);
                  const revenue = revenueData?.per_course?.find(r => r.course_id === course.id);
                  const isSelected = selectedCourseId === course.id;
                  
                  return (
                    <tr 
                      key={course.id} 
                      className={cn(
                        "group hover:bg-bg/40 transition-colors cursor-pointer",
                        isSelected && "bg-emerald-50/50 border-l-4 border-l-emerald-500"
                      )}
                      onClick={() => {
                        setSelectedCourseId(isSelected ? null : course.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail_url || '/Logo/logo.png'}
                            alt=""
                            className="h-10 w-16 rounded-lg object-cover border border-border shadow-sm group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-text group-hover:text-emerald-600 transition-colors">{course.title}</p>
                            <p className="text-[9px] font-medium text-text-muted uppercase tracking-wider">{course.category || 'Expert Course'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge 
                          variant={course.is_published ? "success" : "outline"}
                          className={cn("px-1.5 py-0.5 text-[8px] uppercase font-black", !course.is_published && "bg-amber-50 text-amber-600 border-amber-200")}
                        >
                          {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-center text-xs font-black text-text">
                        {analytics?.enrollments || 0}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold text-text">{analytics?.completion_rate || 0}%</span>
                          <div className="w-12 h-1 rounded-full bg-surface overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500" 
                              style={{ width: `${analytics?.completion_rate || 0}%` }} 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right font-black text-text text-xs">
                        {formatCurrency(revenue?.sales || 0)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link 
                          to={tutorId ? `/admin/courses/${course.id}` : `/tutor/courses/${course.id}`} 
                          className="p-1.5 rounded-lg bg-bg text-text-muted hover:bg-emerald-600 hover:text-white transition-all shadow-sm inline-block"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <BookOpen className="h-8 w-8 mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest">No courses found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TutorAnalyticsPage;

