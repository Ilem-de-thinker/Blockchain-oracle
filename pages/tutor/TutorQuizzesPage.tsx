import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizzesApi, Quiz } from '../../src/api/quizzes';
import { coursesApi, Course } from '../../src/api/courses';
import { Button } from '../../components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../src/hooks/useToast';
import {
  FileQuestion,
  Plus,
  BarChart2,
  BookOpen,
  Search,
  ChevronRight,
  Filter,
  Layers,
  RefreshCcw,
  X
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const TutorQuizzesPage: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useLocalStorage('tutor_quizzes_search', '');
  const [selectedCourseId, setSelectedCourseId] = useLocalStorage('tutor_quizzes_course', '');
  const [selectedModuleId, setSelectedModuleId] = useLocalStorage('tutor_quizzes_module', '');
  const [showFilters, setShowFilters] = useLocalStorage('tutor_quizzes_show_filters', false);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizzesData, coursesData] = await Promise.all([
        quizzesApi.getQuizzes(),
        coursesApi.getCourses(1, 100)
      ]);
      setQuizzes(quizzesData);
      setCourses(coursesData.items);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
      toast.error('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const getCourseTitle = (moduleId: number) => {
    const course = courses.find((item) => item.modules?.some((module) => module.id === moduleId));
    return course?.title || 'Unknown Course';
  };

  const getCourseIdForModule = (moduleId: number) => {
    const course = courses.find((item) => item.modules?.some((module) => module.id === moduleId));
    return course?.id;
  };

  const getModuleTitle = (moduleId: number) => {
    const module = courses.flatMap((course) => course.modules || []).find((item) => item.id === moduleId);
    return module?.title || 'Unknown Module';
  };

  const selectedCourse = courses.find((course) => course.id === Number(selectedCourseId));
  const availableModules = selectedCourse?.modules || [];

  const filteredQuizzes = quizzes.filter(q => 
    (
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCourseTitle(q.module).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getModuleTitle(q.module).toLowerCase().includes(searchQuery.toLowerCase())
    ) &&
    (!selectedCourseId || getCourseIdForModule(q.module) === Number(selectedCourseId)) &&
    (!selectedModuleId || q.module === Number(selectedModuleId))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Quiz Management</h1>
          <p className="text-sm text-text-muted">Create and monitor assessments across your courses</p>
        </div>
        <div className="flex items-center gap-3">
           <Button
            asChild={!!selectedCourseId}
            onClick={!selectedCourseId ? () => toast.info('Select a course first to create a module quiz') : undefined}
           >
            {selectedCourseId ? (
              <Link to={`/tutor/courses/${selectedCourseId}/quiz/create`}>
                <Plus className="mr-2 h-4 w-4" /> New Quiz
              </Link>
            ) : (
              <span>
                <Plus className="mr-2 h-4 w-4" /> New Quiz
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm" className="h-10" onClick={loadData}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm transition-all hover:border-accent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileQuestion className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Total Quizzes</p>
              <p className="text-xl font-black text-text">{quizzes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm transition-all hover:border-accent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <BookOpen className="text-accent h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Modules</p>
              <p className="text-xl font-black text-text">
                {new Set(quizzes.map(q => q.module)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm transition-all hover:border-accent col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <BarChart2 className="text-emerald-500 h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Submissions</p>
              <p className="text-xl font-black text-text">Live</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-2xl border border-border p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <Input
              placeholder="Search quizzes, courses, or modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            className="h-10 w-full sm:w-auto"
            onClick={() => setShowFilters((value) => !value)}
          >
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            showFilters ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-2">
            <select
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSelectedModuleId('');
              }}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              disabled={!selectedCourseId}
              className="h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
            >
              <option value="">All Modules</option>
              {availableModules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>

            {(searchQuery || selectedCourseId || selectedModuleId) && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-self-start px-2 text-[10px] font-bold uppercase"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCourseId('');
                  setSelectedModuleId('');
                }}
              >
                <X className="mr-1 h-3 w-3" /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quizzes Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        <Table variant="striped">
          <TableHeader>
            <TableRow className="bg-surface-alt/50">
              <TableHead>Quiz Title</TableHead>
              <TableHead>Course / Module</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuizzes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileQuestion className="h-10 w-10 text-text-muted opacity-20 mb-2" />
                    <p className="text-text-muted">No quizzes found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuizzes.map((quiz) => (
                <TableRow key={quiz.id} className="group">
                  <TableCell>
                    <div>
                      <p className="font-bold text-text">{quiz.title}</p>
                      <p className="text-xs text-text-muted truncate max-w-[250px]">{quiz.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="secondary" className="font-medium">
                        {getCourseTitle(quiz.module)}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-text-muted">
                        <Layers className="h-3 w-3" />
                        <span>{getModuleTitle(quiz.module)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text">{quiz.questions?.length || 0}</span>
                      <span className="text-xs text-text-muted">questions</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-text-secondary">
                    {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/tutor/quizzes/${quiz.id}/results`}>
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <BarChart2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Results</span>
                        </Button>
                      </Link>
                      <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-primary transition-colors" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TutorQuizzesPage;
