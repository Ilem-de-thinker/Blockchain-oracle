import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { progressApi, LearningProgress } from '@/src/api/progress';
import analyticsApi, {
  StudentActivity,
  StudentQuizSummary,
  StudentEnrollmentTimeline
} from '@/src/api/analytics';
import { Chart } from '@/components/ui/chart';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CourseAnalyticsModal from '@/components/dashboard/CourseAnalyticsModal';
import {
  RefreshCcw,
  Target,
  PieChart as PieChartIcon,
  Calendar,
  LineChart,
  LayoutList,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/src/hooks/useToast';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const ProgressPage: React.FC = () => {
  const [progressData, setProgressData] = useState<LearningProgress | null>(null);
  const [activityData, setActivityData] = useState<StudentActivity | null>(null);
  const [quizSummary, setQuizSummary] = useState<StudentQuizSummary | null>(null);
  const [timelineData, setTimelineData] = useState<StudentEnrollmentTimeline | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState<{ id: number; title: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [activityDays, setActivityDays] = useState(7);
  const [progressTab, setProgressTab] = useLocalStorage('progress_active_tab', 'courses');

  const { error: toastError } = useToast();

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      const [progress, activity, quiz, timeline] = await Promise.all([
        progressApi.getProgress(),
        analyticsApi.getStudentActivity(activityDays),
        analyticsApi.getStudentQuizSummary(),
        analyticsApi.getStudentEnrollmentTimeline()
      ]);
      setProgressData(progress);
      setActivityData(activity);
      setQuizSummary(quiz);
      setTimelineData(timeline);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      toastError('Failed to load progress data.');
    } finally {
      setLoading(false);
    }
  }, [activityDays, toastError]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const openAnalytics = (id: number, title: string) => {
    setSelectedCourse({ id, title });
    setIsModalOpen(true);
  };

  const activityChartData = useMemo(() => {
    if (!activityData?.daily) return { labels: [], datasets: [] };
    const labels = activityData.daily.map(d =>
      new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })
    );
    return {
      labels,
      datasets: [{
        label: 'Minutes',
        data: activityData.daily.map(d => d.minutes),
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        fill: true,
        tension: 0.4,
      }]
    };
  }, [activityData]);

  const quizChartData = useMemo(() => {
    if (!quizSummary) return [];
    return [
      { label: 'Passed', value: quizSummary.passed, color: '#22c55e' },
      { label: 'Failed', value: quizSummary.failed, color: '#ef4444' }
    ];
  }, [quizSummary]);

  const enrollmentTimelineData = useMemo(() => {
    if (!timelineData?.monthly_enrollments) return [];
    return timelineData.monthly_enrollments.map(m => ({
      label: m.month,
      value: m.count
    }));
  }, [timelineData]);

  const totalHours = progressData?.total_learning_time_minutes
    ? (progressData.total_learning_time_minutes / 60).toFixed(1)
    : '0';
  const avgScore = quizSummary?.average_score ?? 0;
  const certificates = progressData?.courses_completed ?? 0;
  const overallCompletion = progressData?.overall_completion_percentage ?? 0;

  if (loading && !progressData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <RefreshCcw className="animate-spin h-8 w-8 text-primary" />
        <p className="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">Loading telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-text tracking-tight uppercase">Performance Hub</h1>
          <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest">Growth metrics & course milestones</p>
        </div>
        <button
          onClick={loadProgress}
          className="h-9 px-4 text-xs font-bold rounded-full border border-border/50 bg-surface/50 text-text-muted hover:text-text transition-all flex items-center gap-2"
        >
          <RefreshCcw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Sync
        </button>
      </div>

      <Tabs value={progressTab} onValueChange={(v) => setProgressTab(v)}>
        <TabsList className="inline-flex items-center gap-2 p-1 bg-surface-alt/50 border-border rounded-xl h-10 mb-4">
          <TabsTrigger value="courses" className="rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wider gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
            <LayoutList className="h-3.5 w-3.5" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-md px-4 py-1.5 text-xs font-bold uppercase tracking-wider gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-white">
            <Target className="h-3.5 w-3.5" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4 animate-in duration-300">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Total Progress</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-text">{overallCompletion}</span>
                <span className="text-sm text-text-muted">%</span>
              </div>
            </div>
            <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Hours Logged</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-text">{totalHours}</span>
              </div>
            </div>
            <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Avg Assessment</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-text">{avgScore}</span>
                <span className="text-sm text-text-muted">%</span>
              </div>
            </div>
            <div className="bg-surface border border-border p-4 rounded-2xl shadow-sm">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-2">Certificates</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-text">{String(certificates).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {progressData?.courses.map((course) => (
              <div
                key={course.course_id}
                className="bg-surface border border-border rounded-2xl p-4 flex flex-col hover:border-primary/30 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <h2 className="text-base font-medium text-text truncate">{course.course_title}</h2>
                </div>
                <p className="text-xs text-text-muted mb-3">{course.status.replace('_', ' ')} &bull; {course.completion_percentage}% complete</p>
                <div className="mb-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase">{course.completion_percentage}%</span>
                  <div className="w-full h-1 bg-surface-alt rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${course.completion_percentage}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-auto">
                  <button
                    onClick={() => openAnalytics(course.course_id, course.course_title)}
                    className="text-xs font-medium text-primary hover:text-primary-hover underline underline-offset-4"
                  >
                    Analytics
                  </button>
                  <Link
                    to={`/dashboard/course/${course.course_id}`}
                    className="bg-primary text-white px-5 py-2 rounded-xl text-xs font-medium hover:opacity-90 transition-all ml-auto"
                  >
                    Continue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 animate-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold text-text uppercase tracking-wider">Learning Velocity</h3>
                </div>
                <div className="flex items-center gap-1">
                  {[7, 30, 90].map(days => (
                    <button
                      key={days}
                      onClick={() => setActivityDays(days)}
                      className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all",
                        activityDays === days
                          ? "bg-primary text-white"
                          : "bg-surface-alt text-text-muted hover:bg-surface-hover"
                      )}
                    >
                      {days}D
                    </button>
                  ))}
                </div>
              </div>
              {activityChartData.labels?.length > 0 ? (
                <Chart type="line" data={activityChartData} height={160} />
              ) : (
                <div className="h-[160px] flex items-center justify-center border border-dashed border-border rounded-xl bg-surface-alt/20">
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">No activity data</p>
                </div>
              )}
            </div>

            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <PieChartIcon className="h-4 w-4 text-emerald-500" />
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">Assessment Intelligence</h3>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-full md:w-1/2">
                  {quizChartData.length > 0 ? (
                    <Chart type="pie" data={quizChartData} height={160} />
                  ) : (
                    <div className="h-[160px] flex items-center justify-center border border-dashed border-border rounded-xl bg-surface-alt/20">
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">No quiz data</p>
                    </div>
                  )}
                </div>
                <div className="w-full md:w-1/2 grid grid-cols-2 gap-2">
                  {[
                    { label: 'Attempts', value: quizSummary?.total_attempts ?? 0 },
                    { label: 'Passed', value: quizSummary?.passed ?? 0, color: 'text-emerald-600' },
                    { label: 'Failed', value: quizSummary?.failed ?? 0, color: 'text-rose-600' },
                    { label: 'Avg Score', value: `${quizSummary?.average_score ?? 0}%`, color: 'text-blue-600' },
                  ].map((item, i) => (
                    <div key={i} className="p-2 rounded-lg bg-surface-alt/50 border border-border">
                      <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{item.label}</p>
                      <p className={cn("text-sm font-bold", item.color || 'text-text')}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-500" />
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">Enrollment Growth</h3>
              </div>
              {enrollmentTimelineData.length > 0 ? (
                <Chart type="bar" data={enrollmentTimelineData} height={160} />
              ) : (
                <div className="h-[160px] flex items-center justify-center border border-dashed border-border rounded-xl bg-surface-alt/20">
                  <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">No enrollment history</p>
                </div>
              )}
            </div>

            <div className="bg-surface border border-border rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-amber-500" />
                <h3 className="text-xs font-bold text-text uppercase tracking-wider">Module Summary</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Total Courses', value: progressData?.total_courses_enrolled ?? 0, color: 'text-text' },
                  { label: 'Completed', value: progressData?.courses_completed ?? 0, color: 'text-emerald-600' },
                  { label: 'In Progress', value: progressData?.courses_in_progress ?? 0, color: 'text-amber-600' },
                  { label: 'Completion', value: `${overallCompletion}%`, color: 'text-primary' },
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-xl bg-surface-alt/50 border border-border">
                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={cn("text-lg font-bold", item.color)}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {selectedCourse && (
        <CourseAnalyticsModal
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ProgressPage;
