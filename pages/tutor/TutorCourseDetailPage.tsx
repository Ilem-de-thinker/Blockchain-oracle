import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Course, coursesApi } from '../../src/api/courses';
import { Quiz, quizzesApi } from '../../src/api/quizzes';
import analyticsApi from '../../src/api/analytics';
import type { 
  TutorDashboard, 
  TutorEnrollmentFunnel, 
  TutorQuizStats, 
  TutorRatings 
} from '../../src/api/analytics';
import { Chart } from '../../components/ui/chart';
import { getErrorMessage } from '../../src/api/errorHandler';

interface CourseEnrollment {
  id: number;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  enrolled_at: string;
}

const TutorCourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [moduleQuizzes, setModuleQuizzes] = useState<Record<number, Quiz[]>>({});
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [courseDashboard, setCourseDashboard] = useState<TutorDashboard | null>(null);
  const [courseFunnel, setCourseFunnel] = useState<TutorEnrollmentFunnel | null>(null);
  const [courseQuizStats, setCourseQuizStats] = useState<TutorQuizStats | null>(null);
const [courseRatings, setCourseRatings] = useState<TutorRatings | null>(null);

  const courseSpecificData = React.useMemo(() => {
    if (!course || !courseDashboard || !courseFunnel || !courseQuizStats || !courseRatings) return null;
    const courseId = course.id;
    const dashboardCourse = courseDashboard.per_course?.find(c => c.course_id === courseId);
    const funnelCourse = courseFunnel.per_course?.find(c => c.course_id === courseId);
    const quizCourse = courseQuizStats.per_course?.find(c => c.course_id === courseId);
    const ratingsCourse = courseRatings.per_course?.find(c => c.course_id === courseId);
    return { dashboardCourse, funnelCourse, quizCourse, ratingsCourse };
  }, [course, courseDashboard, courseFunnel, courseQuizStats, courseRatings]);

  useEffect(() => {
    const loadCourse = async () => {
      if (!id) return;
      try {
        const [courseData, enrollmentData, dashboard, funnel, quizStats, ratings] = await Promise.all([
          coursesApi.getCourse(Number(id)),
          coursesApi.getCourseEnrollments(Number(id), 1, 10),
          analyticsApi.getTutorDashboard().catch(() => null),
          analyticsApi.getTutorEnrollmentFunnel().catch(() => null),
          analyticsApi.getTutorQuizStats().catch(() => null),
          analyticsApi.getTutorRatings().catch(() => null),
        ]);
        setCourse(courseData);
        setEnrollments((enrollmentData?.results as CourseEnrollment[]) || []);
        setCourseDashboard(dashboard);
        setCourseFunnel(funnel);
        setCourseQuizStats(quizStats);
        setCourseRatings(ratings);

        const quizLists = await Promise.all(
          (courseData.modules || []).map(async (module) => ({
            moduleId: module.id,
            quizzes: await quizzesApi.getQuizzes(module.id).catch(() => []),
          }))
        );
        setModuleQuizzes(
          quizLists.reduce<Record<number, Quiz[]>>((accumulator, item) => {
            accumulator[item.moduleId] = item.quizzes;
            return accumulator;
          }, {})
        );
      } catch (error) {
        console.error('Failed to load course detail:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  const handleTogglePublish = async () => {
    if (!course) return;
    setIsToggling(true);
    try {
      const result = await coursesApi.togglePublish(course.id);
      alert(result.detail || `Course ${course.is_published ? 'unpublished' : 'published'} successfully`);
      // Reload course data
      const updated = await coursesApi.getCourse(course.id);
      setCourse(updated);
    } catch (error) {
      alert(`Failed to toggle publish: ${getErrorMessage(error)}`);
    } finally {
      setIsToggling(false);
    }
  };

  const stats = useMemo(() => {
    if (!course) return { modules: 0, materials: 0, readiness: 0 };
    const modules = course.modules.length;
    const materials = course.modules.reduce((sum, module) => sum + module.materials.length, 0);
    const readiness = modules === 0 ? 0 : Math.min(100, Math.round((materials / modules) * 25));
    return { modules, materials, readiness };
  }, [course]);

  if (loading) {
    return <div className="rounded-3xl border border-border bg-surface p-8 text-sm text-text-muted shadow-sm">Loading course...</div>;
  }

  if (!course) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-sm text-red-700 shadow-sm">Course not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-600">Tutor Course Detail</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-text">{course.title}</h1>
            <p className="mt-3 max-w-3xl text-sm text-text-muted">{course.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={course.is_published ? 'success' : 'warning'}>
                {course.is_published ? 'Published' : 'Draft'}
              </Badge>
              <Badge variant="secondary">{course.category || 'Uncategorized'}</Badge>
              <Badge variant="default">{course.level || 'No level'}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/tutor/courses/${course.id}/edit`}>
              <Button variant="secondary">Edit Course</Button>
            </Link>
            <Link to={`/tutor/courses/${course.id}/materials`} className='text-white'>
              <Button className='text-white'>Manage Materials</Button>
            </Link>
            <Button className='text-white!'
              variant={course.is_published ? "destructive" : "default"}
              onClick={handleTogglePublish}
              disabled={isToggling}
            >
              {isToggling ? 'Processing...' : course.is_published ? 'Unpublish' : 'Publish'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/tutor/analytics', { state: { selectedCourseId: course.id } })}
            >
              View Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Course Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Price</p>
          <p className="mt-1 text-xl font-black text-text">₦{Number(course.total_amount || course.price || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Curriculum</p>
          <p className="mt-1 text-xl font-black text-text">{stats.modules} Modules</p>
          <p className="text-[10px] text-text-muted">{stats.materials} Materials ({stats.modules > 0 ? Math.round(stats.materials/stats.modules*100) : 0}%)</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Enrollments</p>
          <p className="mt-1 text-xl font-black text-text">{courseSpecificData?.dashboardCourse?.enrollments || enrollments.length}</p>
          <p className="text-[10px] text-text-muted">Active learners</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Completion</p>
          <p className="mt-1 text-xl font-black text-blue-600">{courseSpecificData?.dashboardCourse?.completion_rate || 0}%</p>
          <p className="text-[10px] text-text-muted">Avg. progress</p>
        </div>
      </div>

      {/* Secondary Metrics */}
      {courseSpecificData && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Quiz Pass Rate</p>
            <p className="mt-1 text-xl font-black text-emerald-600">
              {courseSpecificData.quizCourse && (courseSpecificData.quizCourse.passed + courseSpecificData.quizCourse.failed) > 0 
                ? Math.round((courseSpecificData.quizCourse.passed/(courseSpecificData.quizCourse.passed + courseSpecificData.quizCourse.failed))*100) 
                : 0}%
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Avg Rating</p>
            <p className="mt-1 text-xl font-black text-amber-500">{courseSpecificData.ratingsCourse?.avg_rating || 'N/A'}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Reviews</p>
            <p className="mt-1 text-xl font-black text-text">{courseSpecificData.ratingsCourse?.total_reviews || 0}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Submissions</p>
            <p className="mt-1 text-xl font-black text-text">{courseSpecificData.quizCourse?.passed + courseSpecificData.quizCourse?.failed || 0}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text">Curriculum readiness</h2>
            <span className="text-sm font-semibold text-text">{stats.readiness}%</span>
          </div>
          <div className="mt-4">
            <Progress value={stats.readiness} />
          </div>
          <div className="mt-6 space-y-4">
            {course.modules.length === 0 ? (
              <p className="text-sm text-text-muted">No modules yet. Use the materials page to start building curriculum.</p>
            ) : (
              course.modules.map((module) => (
                <div key={module.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-text">{module.title}</p>
                      <p className="mt-1 text-xs text-text-muted">{module.description || 'No description provided.'}</p>
                    </div>
                    <Badge variant={module.is_published ? 'success' : 'warning'}>
                      {module.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {module.quiz_id ? (
                      <>
                        <Badge variant="success">Quiz attached</Badge>
                        <Link to={`/tutor/quizzes/${module.quiz_id}/results`}>
                          <Button size="sm" variant="outline">View Quiz Results</Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Badge variant="warning">No quiz attached</Badge>
                        <Link to={`/tutor/courses/${course.id}/quiz/create`}>
                          <Button size="sm">Create Module Quiz</Button>
                        </Link>
                      </>
                    )}
                    {moduleQuizzes[module.id]?.length > 1 && (
                      <Badge variant="secondary">{moduleQuizzes[module.id].length} quizzes in module</Badge>
                    )}
                  </div>
                  <div className="mt-3 space-y-2">
                    {module.materials.length === 0 ? (
                      <p className="text-xs text-text-muted">No materials in this module.</p>
                    ) : (
                      module.materials.map((material) => (
                        <div key={material.id} className="flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2 text-sm">
                          <span className="text-text">{material.title}</span>
                          <Badge variant="secondary">{material.type}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
          <h2 className="text-lg font-bold text-text">Recent learners</h2>
          <div className="mt-4 space-y-3">
            {enrollments.length === 0 ? (
              <p className="text-sm text-text-muted">No learner enrollments yet.</p>
            ) : (
              enrollments.map((enrollment) => (
                <div key={enrollment.id} className="rounded-2xl border border-border p-4">
                  <p className="text-sm font-semibold text-text">{enrollment.user.full_name}</p>
                  <p className="mt-1 text-xs text-text-muted">{enrollment.user.email}</p>
                  <p className="mt-2 text-xs text-text-muted">
                    Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {courseSpecificData && (
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text mb-4">Course Analytics</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Enrollment Funnel */}
              {courseSpecificData.funnelCourse && (
                <div className="rounded-2xl border border-border p-5">
                  <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Enrollment Funnel</h3>
                  <Chart 
                    type="bar" 
                    data={[
                      { label: 'Enrolled', value: courseSpecificData.funnelCourse.enrolled },
                      { label: 'In Progress', value: courseSpecificData.funnelCourse.in_progress },
                      { label: 'Completed', value: courseSpecificData.funnelCourse.completed }
                    ]} 
                    height={200} 
                  />
                </div>
              )}

              {/* Quiz Performance */}
              {courseSpecificData.quizCourse && (
                <div className="rounded-2xl border border-border p-5">
                  <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Quiz Performance</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-1/2">
                      <Chart 
                        type="pie" 
                        data={[
                          { label: 'Passed', value: courseSpecificData.quizCourse.passed, color: '#22c55e' },
                          { label: 'Failed', value: courseSpecificData.quizCourse.failed, color: '#ef4444' }
                        ]} 
                        height={180} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-1/2">
                      <div className="rounded-xl border border-border bg-surface-alt/50 p-3">
                        <p className="text-[10px] font-bold text-text-muted uppercase">Passed</p>
                        <p className="text-lg font-black text-emerald-600">{courseSpecificData.quizCourse.passed}</p>
                      </div>
                      <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-3">
                        <p className="text-[10px] font-bold text-rose-600 uppercase">Failed</p>
                        <p className="text-lg font-black text-rose-600">{courseSpecificData.quizCourse.failed}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Rating */}
              {courseSpecificData.ratingsCourse && (
                <div className="rounded-2xl border border-border p-5">
                  <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4">Ratings</h3>
                  <p className="text-3xl font-black text-text">{courseSpecificData.ratingsCourse.avg_rating}</p>
                  <p className="text-sm text-text-muted mt-1">{courseSpecificData.ratingsCourse.total_reviews} reviews</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorCourseDetailPage;
