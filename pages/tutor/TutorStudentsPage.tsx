import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { coursesApi, Course, CourseEnrollment } from '../../src/api/courses';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { quizzesApi, QuizResult } from '../../src/api/quizzes';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Chart } from '../../components/ui/chart';
import { Link } from 'react-router-dom';
import {
  Search, Users, Mail, MessageSquare, ChevronRight, Filter, TrendingUp,
  X, BookOpen, CheckCircle, Clock, Award, Loader2
} from 'lucide-react';
import SendNotificationModal from '../admin/components/SendNotificationModal';

interface StudentProgressModalProps {
  student: { id: number; full_name: string; email: string; profile_picture?: string };
  enrollment: {
    id: number;
    courseId: number;
    courseTitle: string;
    enrolled_at: string;
    progress_percentage?: number;
    is_course_completed?: boolean;
  };
  onClose: () => void;
}

const StudentProgressModal: React.FC<StudentProgressModalProps> = ({ student, enrollment, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [moduleProgress, setModuleProgress] = useState<Array<{
    module_id: number; title: string; total_materials: number;
    completed_materials: number; is_completed: boolean;
  }> | null>(null);
  const [courseProgressPct, setCourseProgressPct] = useState<number>(enrollment.progress_percentage ?? 0);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [course, progress] = await Promise.all([
        coursesApi.getCourse(enrollment.courseId),
        coursesApi.getCourseProgress(enrollment.courseId),
      ]);

      if (progress && progress.modules) {
        setModuleProgress(progress.modules);
        setCourseProgressPct(progress.progress_percentage);
      }

      const quizIdSet = new Set<number>();
      (course.modules || []).forEach((m) => {
        if (m.quiz_id) quizIdSet.add(m.quiz_id);
        (m.quizzes || []).forEach((q) => quizIdSet.add(q.id));
      });

      if (quizIdSet.size > 0) {
        const allResults = await Promise.all(
          Array.from(quizIdSet).map((qId) =>
            quizzesApi.getQuizResults(qId).catch(() => [] as QuizResult[])
          )
        );
        const flat = allResults.flat();
        setQuizResults(flat.filter((r) => r.user === student.id));
      }
    } catch (err) {
      console.error('Failed to load student progress', err);
    } finally {
      setLoading(false);
    }
  };

  const quizStats = useMemo(() => {
    if (!quizResults.length) return null;
    const total = quizResults.length;
    const passed = quizResults.filter((r) => r.is_passed).length;
    const scores = quizResults.map((r) => Number(r.score)).filter((s) => !isNaN(s));
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { total_attempts: total, passed, failed: total - passed, average_score: avg };
  }, [quizResults]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 rounded-full p-1 text-text-muted hover:bg-muted transition-colors">
          <X size={20} />
        </button>

        <div className="mb-6 flex items-center gap-4">
          {student.profile_picture ? (
            <img src={student.profile_picture} alt="" className="h-14 w-14 rounded-full object-cover border-2 border-border" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-lg font-bold text-amber-600">
              {student.full_name.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-text">{student.full_name}</h2>
            <p className="text-sm text-text-muted">{student.email}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="bg-amber-50/50 border-amber-200">
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-muted">Course</p>
                  <p className="text-lg font-bold text-text">{enrollment.courseTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-muted">Enrolled</p>
                  <p className="text-sm font-semibold text-text">{new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Course Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-text-muted">Overall</span>
                      <span className="font-bold text-text">{Math.round(courseProgressPct)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all" style={{ width: `${Math.round(courseProgressPct)}%` }} />
                    </div>
                  </div>
                  {moduleProgress && moduleProgress.length > 0 && (
                    <div className="space-y-3">
                      {moduleProgress.map((m) => (
                        <div key={m.module_id} className="flex items-center gap-2 text-sm">
                          <div className={`h-2 w-2 shrink-0 rounded-full ${m.is_completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className="flex-1 truncate text-text-secondary">{m.title}</span>
                          <span className="text-xs text-text-muted shrink-0">{m.completed_materials}/{m.total_materials}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {!moduleProgress && (
                    <p className="text-sm text-text-muted py-4 text-center">Module-level progress not available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quiz Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {quizStats ? (
                    <>
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-muted/50 p-3 text-center">
                          <p className="text-2xl font-black text-text">{quizStats.total_attempts}</p>
                          <p className="text-xs text-text-muted">Total Attempts</p>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-3 text-center">
                          <p className="text-2xl font-black text-text">{quizStats.average_score}%</p>
                          <p className="text-xs text-text-muted">Avg Score</p>
                        </div>
                      </div>
                      <Chart type="pie" data={[
                        { label: 'Passed', value: quizStats.passed, color: '#22c55e' },
                        { label: 'Failed', value: quizStats.failed, color: '#ef4444' },
                      ]} height={160} />
                    </>
                  ) : (
                    <p className="text-sm text-text-muted py-8 text-center">No quiz data for this course</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {quizResults.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recent Quiz Attempts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quizResults.slice(-5).reverse().map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl bg-muted/30 p-3 text-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${r.is_passed ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="truncate font-medium text-text">{r.quiz_title || `Quiz #${r.quiz}`}</span>
                      </div>
                      <span className="shrink-0 text-text-muted">
                        {r.correct_answers}/{r.total_questions} ({r.score}%)
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TutorStudentsPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useLocalStorage('tutor_students_search', '');
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<number | undefined>(undefined);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<number | undefined>(undefined);
  const [progressModalStudent, setProgressModalStudent] = useState<{
    student: { id: number; full_name: string; email: string; profile_picture?: string };
    enrollment: { id: number; courseId: number; courseTitle: string; enrolled_at: string; progress_percentage?: number; is_course_completed?: boolean };
  } | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch tutor's courses
      const coursesData = await coursesApi.getCourses(1, 100);
      setCourses(coursesData.items);

      // Fetch all enrollments for all courses
      const allEnrollments: CourseEnrollment[] = [];
      await Promise.all(
        coursesData.items.map(async (course) => {
          const data = await coursesApi.getCourseEnrollments(course.id, 1, 100);
          const results = data.results || [];
          const enriched = results.map(e => ({ ...e, courseTitle: course.title, courseId: course.id }));
          allEnrollments.push(...enriched);
        })
      );
      setEnrollments(allEnrollments);
    } catch (err) {
      console.error('Failed to load students data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredEnrollments = enrollments.filter(e => {
    const matchesCourse = selectedCourseId === 'all' || e.courseId === Number(selectedCourseId);
    const matchesSearch = e.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         e.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const handleMessageIndividual = (userId: number) => {
    setSelectedRecipientId(userId);
    setSelectedCourseForModal(undefined);
    setShowSendModal(true);
  };

  const handleBroadcastToCourse = () => {
    if (selectedCourseId !== 'all') {
      setSelectedCourseForModal(Number(selectedCourseId));
      setSelectedRecipientId(undefined);
      setShowSendModal(true);
    } else {
      setSelectedCourseForModal(undefined);
      setSelectedRecipientId(undefined);
      setShowSendModal(true);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="rounded-3xl border border-amber-100 bg-surface p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">Student Management</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-text">Engage with your learners.</h1>
        <p className="mt-3 text-sm text-text-secondary">Track enrollment, monitor progress, and send updates to your students.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input 
            placeholder="Search students by name or email..." 
            className="pl-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <select 
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                    <option value="all">All Courses</option>
                    {courses.map(course => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                </select>
            </div>
            <Button 
                onClick={handleBroadcastToCourse}
                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl gap-2 shadow-lg shadow-amber-600/20"
            >
                <MessageSquare size={18} />
                <span className="hidden sm:inline">Broadcast</span>
            </Button>
        </div>
      </div>

      <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-text">Learner</th>
                <th className="px-6 py-4 font-semibold text-text hidden sm:table-cell">Course</th>
                <th className="px-6 py-4 font-semibold text-text hidden lg:table-cell">Enrolled On</th>
                <th className="px-6 py-4 text-right font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32"></div></td>
                    <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 bg-muted rounded w-24"></div></td>
                    <td className="px-6 py-4 hidden lg:table-cell"><div className="h-4 bg-muted rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-muted rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-muted">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No students found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {e.user.profile_picture ? (
                          <img src={e.user.profile_picture} alt="" className="h-10 w-10 rounded-full object-cover border border-border" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                            {e.user.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-text leading-none">{e.user.full_name}</p>
                          <p className="text-xs text-text-muted mt-1">{e.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <Badge variant="outline" className="font-medium">{e.courseTitle}</Badge>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-text-muted">
                      {new Date(e.enrolled_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:bg-amber-100 hover:text-amber-600 transition-colors"
                          onClick={() => handleMessageIndividual(e.user.id)}
                          title="Send Message"
                        >
                          <Mail size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          asChild
                        >
                          <Link to={`/tutor/students/${e.user.id}/analytics`} title="View Student Analytics">
                            <TrendingUp size={16} />
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full hover:bg-purple-100 hover:text-purple-600 transition-colors"
                          onClick={() => setProgressModalStudent({
                            student: { id: e.user.id, full_name: e.user.full_name, email: e.user.email, profile_picture: e.user.profile_picture },
                            enrollment: { id: e.id, courseId: e.courseId ?? 0, courseTitle: e.courseTitle ?? '', enrolled_at: e.enrolled_at, progress_percentage: e.progress_percentage, is_course_completed: e.is_course_completed },
                          })}
                          title="View Student Progress"
                        >
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {progressModalStudent && (
        <StudentProgressModal
          student={progressModalStudent.student}
          enrollment={progressModalStudent.enrollment}
          onClose={() => setProgressModalStudent(null)}
        />
      )}

      <SendNotificationModal
        isOpen={showSendModal}
        onClose={() => {
            setShowSendModal(false);
            setSelectedRecipientId(undefined);
            setSelectedCourseForModal(undefined);
        }}
        onSuccess={() => {
            // Success alert or similar
        }}
        userRole="TUTOR"
        initialData={selectedRecipientId ? {
            target: 'individual',
            recipient_id: selectedRecipientId,
            title: '',
            message: '',
            notification_type: 'general'
        } : selectedCourseForModal ? {
            target: 'course',
            course_id: selectedCourseForModal,
            title: '',
            message: '',
            notification_type: 'general'
        } : undefined}
      />
    </div>
  );
};

export default TutorStudentsPage;
