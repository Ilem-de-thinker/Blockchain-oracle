import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { coursesApi, Course } from '../../../src/api/courses';
import {
  BookOpen,
  Edit,
  Trash2,
  MoreHorizontal,
  Globe,
  EyeOff,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Eye,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { ReportActions } from '../../../components/ui/ReportActions';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

const PAGE_SIZE = 12;

const formatMoney = (value?: string) => {
  const amount = Number(value || 0);
  return amount > 0 ? `$${amount.toFixed(2)}` : 'Free';
};

const CourseListingPage: React.FC = () => {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';
  const workspaceLabel = basePath === '/super-admin' ? 'Super Admin' : 'Admin';

  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useLocalStorage('course_listing_search', '');
  const [selectedCategory, setSelectedCategory] = useLocalStorage('course_listing_category', '');
  const [selectedLevel, setSelectedLevel] = useLocalStorage('course_listing_level', '');
  const [selectedStatus, setSelectedStatus] = useLocalStorage('course_listing_status', '');
  const [ordering, setOrdering] = useLocalStorage('course_listing_ordering', '-updated_at');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useLocalStorage('course_listing_page', 1);
  const [totalItems, setTotalItems] = useState(0);
  const [busyCourseId, setBusyCourseId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'list'>('course_listing_view_mode', 'list');
  const [filterOpen, setFilterOpen] = useLocalStorage('course_listing_filter_open', false);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      if (selectedStatus === '') {
        const [publishedRes, draftRes] = await Promise.all([
          coursesApi.getCourses(currentPage, PAGE_SIZE, selectedCategory || undefined, selectedLevel || undefined, searchQuery || undefined, ordering || undefined, undefined, true),
          coursesApi.getCourses(currentPage, PAGE_SIZE, selectedCategory || undefined, selectedLevel || undefined, searchQuery || undefined, ordering || undefined, undefined, false),
        ]);
        let merged = [...publishedRes.items, ...draftRes.items];
        merged.sort((a, b) => {
          switch (ordering) {
            case 'title': return (a.title || '').localeCompare(b.title || '');
            case '-title': return (b.title || '').localeCompare(a.title || '');
            case 'total_amount': return (parseFloat(a.total_amount || a.price || '0')) - (parseFloat(b.total_amount || b.price || '0'));
            case '-total_amount': return (parseFloat(b.total_amount || b.price || '0')) - (parseFloat(a.total_amount || a.price || '0'));
            case 'created_at': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            case '-created_at': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            default: return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          }
        });
        setCourses(merged);
        setTotalItems(publishedRes.count + draftRes.count);
      } else {
        const isPublished = selectedStatus === 'published' ? true
          : selectedStatus === 'draft' ? false
          : undefined;
        const response = await coursesApi.getCourses(
          currentPage,
          PAGE_SIZE,
          selectedCategory || undefined,
          selectedLevel || undefined,
          searchQuery || undefined,
          ordering || undefined,
          undefined,
          isPublished,
        );
        setCourses(response.items);
        setTotalItems(response.count);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
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
    setBusyCourseId(course.id);
    try {
      await coursesApi.togglePublish(course.id);
      await fetchCourses();
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to update course status.';
      alert(msg);
    } finally {
      setBusyCourseId(null);
    }
  };

  const handleToggleVerification = async (course: Course) => {
    setBusyCourseId(course.id);
    try {
      await coursesApi.toggleVerification(course.id);
      await fetchCourses();
    } catch (error: any) {
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail || error?.response?.data?.message || '';
      if (status === 401 || status === 403) {
        alert('You need "can_verify" permission to verify courses. Ask a Super Admin to enable it, then log out and log back in to refresh your session.');
      } else {
        alert(detail || 'Failed to update course verification.');
      }
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
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Failed to delete course.';
      alert(msg);
    } finally {
      setBusyCourseId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Flat-Glass */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-600">{workspaceLabel} Courses</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">Course Management</h1>
            <p className="mt-2 text-sm text-text-muted">
              Manage pricing, publishing state, curriculum coverage, and tutor ownership
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ReportActions />
            <Link to={`${basePath}/courses/create`}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards with Flat-Glass */}
      <div className="grid gap-3 grid-cols-2 max-[400px]:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl px-3 py-4 shadow-sm">
          <p className="text-xs text-text-muted">Total Courses</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-text">{stats.total}</p>
        </div>
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl px-3 py-4 shadow-sm">
          <p className="text-xs text-text-muted">Published</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-emerald-600">{stats.published}</p>
        </div>
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl px-3 py-4 shadow-sm">
          <p className="text-xs text-text-muted">Drafts</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-amber-600">{stats.draft}</p>
        </div>
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl px-3 py-4 shadow-sm">
          <p className="text-xs text-text-muted">Curriculum Items</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-text">{stats.modules + stats.materials}</p>
          <p className="mt-0.5 text-xs text-text-muted">{stats.modules} modules, {stats.materials} materials</p>
        </div>
      </div>

      {/* Filters - Collapsible */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl shadow-sm">
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          className="flex items-center justify-between w-full px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <span className="text-sm font-medium text-text">Filters</span>
            {(searchQuery || selectedCategory || selectedLevel || selectedStatus) && (
              <span className="w-2 h-2 rounded-full bg-purple-500" />
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
        </button>
        {filterOpen && (
          <div className="px-4 pb-4 border-t border-border/50 pt-3">
            <div className="grid gap-3 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))]">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setSearchQuery(event.target.value);
                  }}
                  className="pl-10 bg-surface/50 border-border/50"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(event) => {
                  setCurrentPage(1);
                  setSelectedCategory(event.target.value);
                }}
                className="rounded-xl border border-border/50 bg-surface/80 px-3 py-2 text-sm text-text"
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
                className="rounded-xl border border-border/50 bg-surface/80 px-3 py-2 text-sm text-text"
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
                className="rounded-xl border border-border/50 bg-surface/80 px-3 py-2 text-sm text-text"
              >
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <div className="flex items-center gap-2">
                <select
                  value={ordering}
                  onChange={(event) => {
                    setCurrentPage(1);
                    setOrdering(event.target.value);
                  }}
                  className="flex-1 rounded-xl border border-border/50 bg-surface/80 px-3 py-2 text-sm text-text"
                >
                  <option value="-updated_at">Recently updated</option>
                  <option value="-created_at">Newest first</option>
                  <option value="title">Title A-Z</option>
                  <option value="-title">Title Z-A</option>
                  <option value="total_amount">Price low-high</option>
                  <option value="-total_amount">Price high-low</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="border-border/50"
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Course List/Grid with Flat-Glass */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-text-muted">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-10 text-center text-text-muted">No courses match the current filters.</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-3">
            {filteredCourses.map((course) => (
              <div key={course.id} className="backdrop-blur-md bg-surface/60 border border-border/50 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-32 mb-2 rounded-lg overflow-hidden">
                  <img
                    src={course.thumbnail_url || 'https://via.placeholder.com/320x180'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    variant={course.is_published ? 'success' : 'warning'}
                    className="absolute top-2 right-2"
                  >
                    {course.is_published ? 'Published' : 'Draft'}
                  </Badge>
                  <Badge
                    variant={course.is_verified ? 'default' : 'outline'}
                    className={cn(
                      "absolute top-2 left-2",
                      course.is_verified ? "bg-blue-600 text-white border-none" : "bg-surface/80 text-text-muted"
                    )}
                  >
                    {course.is_verified ? (
                      <><CheckCircle className="h-3 w-3 mr-1" /> Verified</>
                    ) : (
                      <><XCircle className="h-3 w-3 mr-1" /> Unverified</>
                    )}
                  </Badge>
                </div>
                <h3 className="font-semibold tracking-tight text-text line-clamp-2">{course.title}</h3>
                <p className="text-xs text-text-muted mt-1">{course.category || 'Uncategorized'} • {course.level || 'No level'}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-semibold text-text">{formatMoney(course.total_amount || course.price)}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`${basePath}/courses/${course.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link to={`${basePath}/courses/${course.id}/modules`}>
                        <FileText className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 backdrop-blur-md bg-surface/95 border-border/50">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`${basePath}/courses/${course.id}/enrollments`}>
                            <Users className="mr-2 h-4 w-4" />
                            Enrolled Students
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`${basePath}/courses/${course.id}/modules`}>
                            <FileText className="mr-2 h-4 w-4" />
                            Modules & Materials
                          </Link>
                        </DropdownMenuItem>
                        {basePath === '/super-admin' && (
                          <DropdownMenuItem
                            onClick={() => handleToggleVerification(course)}
                            className={course.is_verified ? 'text-amber-600' : 'text-blue-600'}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {course.is_verified ? 'Unverify' : 'Verify'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(course)}
                          className={course.is_published ? 'text-amber-600' : 'text-emerald-600'}
                        >
                          {course.is_published ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Globe className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-semibold tracking-tight text-text-muted">Course</th>
                  <th className="text-left p-4 text-sm font-semibold tracking-tight text-text-muted">Status</th>
                  <th className="text-left p-4 text-sm font-semibold tracking-tight text-text-muted">Approval</th>
                  <th className="text-left p-4 text-sm font-semibold tracking-tight text-text-muted">Pricing</th>
                  <th className="text-left p-4 text-sm font-semibold tracking-tight text-text-muted">Curriculum</th>
                  <th className="text-left p-4 text-sm font-semibold tracking-tight text-text-muted">Tutor</th>
                  <th className="text-left p-4 text-sm font-semibold tracking-tight text-text-muted">Updated</th>
                  <th className="text-right p-4 text-sm font-semibold tracking-tight text-text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => {
                  const moduleCount = course.modules.length;
                  const materialCount = course.modules.reduce((sum, module) => sum + module.materials.length, 0);

                  return (
                    <tr key={course.id} className="border-b border-border/30 hover:bg-surface/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={course.thumbnail_url || 'https://via.placeholder.com/80x60'}
                            alt={course.title}
                            className="h-14 w-20 rounded-xl border border-border/50 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold tracking-tight text-text truncate">{course.title}</p>
                            <p className="text-xs text-text-muted">{course.category || 'Uncategorized'} • {course.level || 'No level'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={course.is_published ? 'success' : 'warning'}>
                          {course.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5">
                          <Badge variant={course.is_verified ? 'default' : 'outline'} className={cn(
                            "w-fit",
                            course.is_verified ? "bg-blue-600 text-white border-none" : "bg-surface/80 text-text-muted"
                          )}>
                            {course.is_verified ? 'Verified' : 'Unverified'}
                          </Badge>
                          {course.is_verified && course.verified_by && (
                            <p className="text-[10px] text-text-muted">
                              by <span className="font-medium text-text">{course.verified_by.full_name}</span>
                            </p>
                          )}
                          <Button 
                              size="xs" 
                              variant="outline" 
                              className="w-fit h-6 px-2 text-[10px]"
                              onClick={() => handleToggleVerification(course)}
                            >
                              {course.is_verified ? 'Unverify' : 'Verify'}
                            </Button>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-semibold text-text">{formatMoney(course.total_amount || course.price)}</p>
                        <p className="text-xs text-text-muted">
                          {course.allow_installments ? 'Installments enabled' : 'Full payment'}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-text">{moduleCount} modules • {materialCount} materials</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-text">{course.tutor?.full_name || 'Unassigned'}</p>
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                        {new Date(course.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 backdrop-blur-md bg-surface/95 border-border/50">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={`${basePath}/courses/${course.id}/enrollments`}>
                                <Users className="mr-2 h-4 w-4" />
                                Enrolled Students
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`${basePath}/courses/${course.id}/modules`}>
                                <FileText className="mr-2 h-4 w-4" />
                                Modules & Materials
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`${basePath}/courses/${course.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Details
                              </Link>
                            </DropdownMenuItem>
                            {basePath === '/super-admin' && (
                              <DropdownMenuItem
                                onClick={() => handleToggleVerification(course)}
                                className={course.is_verified ? 'text-amber-600' : 'text-blue-600'}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {course.is_verified ? 'Unverify' : 'Verify'}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleTogglePublish(course)}
                              className={course.is_published ? 'text-amber-600' : 'text-emerald-600'}
                            >
                              {course.is_published ? (
                                <>
                                  <EyeOff className="mr-2 h-4 w-4" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Globe className="mr-2 h-4 w-4" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(course.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination with Flat-Glass */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-text-muted">
          Page {currentPage} of {totalPages} • {totalItems} total courses
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
            className="border-border/50"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="border-border/50"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourseListingPage;
