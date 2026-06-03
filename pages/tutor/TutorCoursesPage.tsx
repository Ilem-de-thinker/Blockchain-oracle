import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../src/api/auth';
import { Course, coursesApi } from '../../src/api/courses';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { cn } from '@/lib/utils';
import { Filter, RefreshCcw, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

const TutorCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredStatus, setFilteredStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [ordering, setOrdering] = useState('-updated_at');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyCourseId, setBusyCourseId] = useState<number | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const [response, profile] = await Promise.all([
        coursesApi.getCourses(
          1,
          100,
          selectedCategory || undefined,
          selectedLevel || undefined,
          searchQuery || undefined,
          ordering || undefined,
          undefined,
          filteredStatus === '' ? undefined : filteredStatus === 'published'
        ),
        authApi.getProfile().catch(() => null),
      ]);

      const ownedCourses = profile
        ? response.items.filter((course) => course.tutor.id === profile.id || course.tutor.email === profile.email)
        : response.items;

      setCourses(ownedCourses);
    } catch (error) {
      console.error('Failed to load tutor courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    if (!course.is_verified && !course.is_published) {
      alert('Your course must be verified by an administrator before it can be published.');
      return;
    }

    setBusyCourseId(course.id);
    try {
      await coursesApi.togglePublish(course.id);
      await loadCourses();
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      alert('Failed to update course status.');
    } finally {
      setBusyCourseId(null);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [selectedCategory, selectedLevel, searchQuery, ordering, filteredStatus]);

  const visibleCourses = useMemo(() => {
    return courses;
  }, [courses]);

  const stats = useMemo(() => {
    const published = courses.filter((course) => course.is_published).length;
    const draft = courses.length - published;
    const modules = courses.reduce((sum, course) => sum + course.modules.length, 0);
    const materials = courses.reduce(
      (sum, course) => sum + course.modules.reduce((moduleTotal, module) => moduleTotal + module.materials.length, 0),
      0,
    );
    return { published, draft, modules, materials };
  }, [courses]);

  const categories = useMemo(
    () => Array.from(new Set(courses.map((course) => course.category).filter(Boolean))) as string[],
    [courses]
  );

  const hasActiveFilters = !!(searchQuery || filteredStatus || selectedCategory || selectedLevel || ordering !== '-updated_at');

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-teal-100 bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-600">Tutor Courses</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-text">Own your course pipeline.</h1>
            <p className="mt-3 max-w-3xl text-sm text-text-muted">
              Review publish state, curriculum depth, and course readiness without leaving the tutor workspace.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/tutor/courses/create" className='text-white'>
              <Button className='text-white'>
                <i className="fas fa-plus"></i>
                New Course
              </Button>
            </Link>
            <Link to="/tutor/analytics">
              <Button variant="outline">Analytics</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-accent">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Published</p>
          <p className="mt-1 text-2xl font-black text-emerald-600">{stats.published}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-accent">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Drafts</p>
          <p className="mt-1 text-2xl font-black text-amber-600">{stats.draft}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-accent">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Modules</p>
          <p className="mt-1 text-2xl font-black text-text">{stats.modules}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-all hover:border-accent">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Materials</p>
          <p className="mt-1 text-2xl font-black text-text">{stats.materials}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            placeholder="Search title, description, or category"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              className="h-10 w-full md:w-auto"
              onClick={() => setShowFilters((value) => !value)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm" className="h-10" onClick={loadCourses}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            showFilters ? 'max-h-60 mt-3 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="grid gap-3 border-t border-border pt-3 md:grid-cols-2 xl:grid-cols-4">
            <select
              value={filteredStatus}
              onChange={(event) => setFilteredStatus(event.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            >
              <option value="">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select
              value={ordering}
              onChange={(event) => setOrdering(event.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
            >
              <option value="-updated_at">Recently updated</option>
              <option value="updated_at">Oldest updated</option>
              <option value="title">Title A-Z</option>
              <option value="-title">Title Z-A</option>
              <option value="price">Price low-high</option>
              <option value="-price">Price high-low</option>
            </select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 justify-self-start px-2 text-[10px] font-bold uppercase"
                onClick={() => {
                  setFilteredStatus('');
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedLevel('');
                  setOrdering('-updated_at');
                }}
              >
                <X className="mr-1 h-3 w-3" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface shadow-sm">
        <Table variant="striped">
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Curriculum</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-text-muted">Loading courses...</TableCell>
              </TableRow>
            ) : visibleCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-text-muted">No tutor-owned courses found.</TableCell>
              </TableRow>
            ) : (
              visibleCourses.map((course) => {
                const moduleCount = course.modules.length;
                const materialCount = course.modules.reduce((sum, module) => sum + module.materials.length, 0);
                const readiness = moduleCount === 0 ? 0 : Math.min(100, Math.round((materialCount / moduleCount) * 25));

                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-border shadow-sm">
                          <img
                            src={course.thumbnail_url || '/Logo/logo.png'}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-text leading-tight">{course.title}</p>
                          <p className="mt-0.5 text-[10px] font-medium text-text-muted uppercase tracking-wider">
                            {course.category || 'Expert Course'} • {course.level || 'Beginner'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <Badge variant={course.is_published ? 'success' : 'warning'}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant={course.is_verified ? 'default' : 'outline'} className={cn(
                          "w-fit",
                          course.is_verified ? "bg-blue-600 text-white border-none" : ""
                        )}>
                          {course.is_verified ? 'Verified' : 'Pending Verification'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold text-text">₦{Number(course.total_amount || course.price || 0).toFixed(2)}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        Installments {course.allow_installments ? 'enabled' : 'disabled'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-text">{moduleCount} modules • {materialCount} materials</p>
                      <div className="mt-2">
                        <Progress value={readiness} />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-text-muted">{new Date(course.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          isLoading={busyCourseId === course.id}
                          onClick={() => handleTogglePublish(course)}
                          className='text-white!'
                        >
                          {course.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Link to={`/tutor/courses/${course.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                        <Link to={`/tutor/courses/${course.id}/edit`}>
                          <Button size="sm" variant="secondary">Edit</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TutorCoursesPage;
