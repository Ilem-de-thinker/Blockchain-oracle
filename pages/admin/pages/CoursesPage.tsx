import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Progress } from '../../../components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Course, coursesApi } from '../../../src/api/courses';
import { 
  Users, 
  BookOpen, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Globe, 
  EyeOff,
  Search,
  Plus,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { ReportActions } from '../../../components/ui/ReportActions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

const PAGE_SIZE = 12;

const formatMoney = (value?: string) => {
  const amount = Number(value || 0);
  return amount > 0 ? `$${amount.toFixed(2)}` : 'Free';
};

const CoursesPage: React.FC = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';
  const workspaceLabel = basePath === '/super-admin' ? 'Super Admin' : 'Admin';

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [ordering, setOrdering] = useState('-updated_at');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [busyCourseId, setBusyCourseId] = useState<number | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const response = await coursesApi.getCourses(
        currentPage,
        PAGE_SIZE,
        selectedCategory || undefined,
        selectedLevel || undefined,
        searchQuery || undefined,
        ordering || undefined,
      );
      setCourses(response.items);
      setTotalItems(response.count);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, ordering, searchQuery, selectedCategory, selectedLevel, selectedStatus]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (!selectedStatus) return true;
      return selectedStatus === 'published' ? course.is_published : !course.is_published;
    });
  }, [courses, selectedStatus]);

  const categories = useMemo(
    () => Array.from(new Set(courses.map((course) => course.category).filter(Boolean))),
    [courses],
  );

  const stats = useMemo(() => {
    const published = courses.filter((course) => course.is_published).length;
    const draft = courses.length - published;
    const modules = courses.reduce((sum, course) => sum + course.modules.length, 0);
    const materials = courses.reduce(
      (sum, course) => sum + course.modules.reduce((moduleTotal, module) => moduleTotal + module.materials.length, 0),
      0,
    );

    return { total: totalItems, published, draft, modules, materials };
  }, [courses, totalItems]);

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const handleTogglePublish = async (course: Course) => {
    if (!course.is_verified && !course.is_published) {
      alert('Course must be verified before it can be published.');
      return;
    }

    setBusyCourseId(course.id);
    try {
      await coursesApi.togglePublish(course.id);
      await fetchCourses();
    } catch (error) {
      console.error('Failed to update publish state:', error);
      alert('Failed to update course status.');
    } finally {
      setBusyCourseId(null);
    }
  };

  const handleToggleVerification = async (course: Course) => {
    setBusyCourseId(course.id);
    try {
      await coursesApi.toggleVerification(course.id);
      await fetchCourses();
    } catch (error) {
      console.error('Failed to update verification state:', error);
      alert('Failed to update course verification.');
    } finally {
      setBusyCourseId(null);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm('Delete this course? This action cannot be undone.')) return;

    setBusyCourseId(courseId);
    try {
      await coursesApi.deleteCourse(courseId);
      if (filteredCourses.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        await fetchCourses();
      }
    } catch (error) {
      console.error('Delete course error:', error);
      alert('Failed to delete course.');
    } finally {
      setBusyCourseId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{workspaceLabel} Courses</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-text">Course operations and publishing workflow.</h1>
            <p className="mt-3 max-w-3xl text-sm text-text-muted">
              Manage pricing, publishing state, curriculum coverage, and tutor ownership from one surface.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ReportActions />
            <Link to={`${basePath}/courses/create`}>
              <Button>
                <i className="fas fa-plus"></i>
                Create Course
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Total courses</p>
          <p className="mt-2 text-3xl font-black text-text">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Published</p>
          <p className="mt-2 text-3xl font-black text-emerald-600">{stats.published}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Drafts</p>
          <p className="mt-2 text-3xl font-black text-amber-600">{stats.draft}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Curriculum items</p>
          <p className="mt-2 text-3xl font-black text-text">{stats.modules + stats.materials}</p>
          <p className="mt-1 text-xs text-text-muted">{stats.modules} modules, {stats.materials} materials</p>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
          <Input
            type="text"
            placeholder="Search by title, tutor, or description"
            value={searchQuery}
            onChange={(event) => {
              setCurrentPage(1);
              setSearchQuery(event.target.value);
            }}
          />
          <select
            value={selectedCategory}
            onChange={(event) => {
              setCurrentPage(1);
              setSelectedCategory(event.target.value);
            }}
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
            onChange={(event) => {
              setCurrentPage(1);
              setSelectedLevel(event.target.value);
            }}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          >
            <option value="">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(event) => {
              setCurrentPage(1);
              setSelectedStatus(event.target.value);
            }}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={ordering}
            onChange={(event) => {
              setCurrentPage(1);
              setOrdering(event.target.value);
            }}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          >
            <option value="-updated_at">Recently updated</option>
            <option value="-created_at">Newest first</option>
            <option value="title">Title A-Z</option>
            <option value="-title">Title Z-A</option>
            <option value="total_amount">Price low-high</option>
            <option value="-total_amount">Price high-low</option>
          </select>
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
              <TableHead>Tutor</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-text-muted">
                  Loading courses...
                </TableCell>
              </TableRow>
            ) : filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-text-muted">
                  No courses match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredCourses.map((course) => {
                const moduleCount = course.modules.length;
                const materialCount = course.modules.reduce((sum, module) => sum + module.materials.length, 0);
                const coverage = moduleCount === 0 ? 0 : Math.min(100, Math.round((materialCount / Math.max(moduleCount, 1)) * 25));

                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={course.thumbnail_url || 'https://via.placeholder.com/80x60'}
                          alt={course.title}
                          className="h-14 w-20 rounded-xl border border-border object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text">{course.title}</p>
                          <p className="mt-1 truncate text-xs text-text-muted">{course.category || 'Uncategorized'} • {course.level || 'No level'}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-text-muted">{course.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge variant={course.is_published ? 'success' : 'warning'}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                        <Badge variant={course.is_verified ? 'default' : 'outline'} className={course.is_verified ? 'bg-blue-600 text-white' : ''}>
                          {course.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          isLoading={busyCourseId === course.id}
                          onClick={() => handleTogglePublish(course)}
                        >
                          {course.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-semibold text-text">{formatMoney(course.total_amount || course.price)}</p>
                      <p className="mt-1 text-xs text-text-muted">
                        Installments {course.allow_installments ? 'enabled' : 'disabled'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <p className="text-sm text-text">{moduleCount} modules • {materialCount} materials</p>
                        <Progress value={coverage} />
                        <p className="text-xs text-text-muted">Content coverage indicator</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-text">{course.tutor.full_name}</p>
                      <p className="text-xs text-text-muted">{course.tutor.email}</p>
                    </TableCell>
                    <TableCell className="text-sm text-text-muted">
                      {new Date(course.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="xs">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Course Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`${basePath}/courses/${course.id}/enrollments`}>
                              <Users className="mr-2 h-4 w-4" />
                              <span>Enrolled Students</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`${basePath}/courses/${course.id}/materials`}>
                              <BookOpen className="mr-2 h-4 w-4" />
                              <span>Course Materials</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`${basePath}/courses/${course.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Details</span>
                            </Link>
                          </DropdownMenuItem>
                          {basePath === '/super-admin' && (
                            <DropdownMenuItem
                              onClick={() => handleToggleVerification(course)}
                              className={course.is_verified ? 'text-amber-600 focus:text-amber-600' : 'text-blue-600 focus:text-blue-600'}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              <span>{course.is_verified ? 'Unverify Course' : 'Verify Course'}</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleTogglePublish(course)}
                            className={course.is_published ? 'text-amber-600 focus:text-amber-600' : 'text-emerald-600 focus:text-emerald-600'}
                          >
                            {course.is_published ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" />
                                <span>Unpublish Course</span>
                              </>
                            ) : (
                              <>
                                <Globe className="mr-2 h-4 w-4" />
                                <span>Publish Course</span>
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete Course</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-surface p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-text-muted">
          Page {currentPage} of {totalPages} • {totalItems} total course records
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
