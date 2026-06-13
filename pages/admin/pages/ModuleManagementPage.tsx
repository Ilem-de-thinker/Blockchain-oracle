import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import {
  Course,
  CourseModule,
  coursesApi,
  CreateModuleData,
  UpdateModuleData,
} from '../../../src/api/courses';
import { getErrorMessage } from '../../../src/api/errorHandler';
import {
  Plus,
  Trash2,
  Edit,
  MoreHorizontal,
  ArrowLeft,
  GripVertical,
  BookOpen,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ModuleFormState extends CreateModuleData {
  id?: number;
}

const EMPTY_MODULE_FORM: ModuleFormState = {
  title: '',
  description: '',
  order: 0,
  is_published: false,
};

const ModuleManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const basePath = location.pathname.startsWith('/super-admin')
    ? '/super-admin'
    : location.pathname.startsWith('/tutor')
    ? '/tutor'
    : '/admin';

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [moduleForm, setModuleForm] = useState<ModuleFormState>(EMPTY_MODULE_FORM);
  const [showForm, setShowForm] = useState(false);

  const fetchCourseData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [courseData, modulesData] = await Promise.all([
        coursesApi.getCourse(Number(id)),
        coursesApi.getModules(Number(id)),
      ]);
      setCourse(courseData);
      setModules(modulesData.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error('Fetch course modules error:', err);
      setError('Failed to load course modules.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const stats = useMemo(() => {
    const published = modules.filter((m) => m.is_published).length;
    const draft = modules.length - published;
    const totalMaterials = modules.reduce((sum, m) => sum + m.materials.length, 0);
    return { total: modules.length, published, draft, totalMaterials };
  }, [modules]);

  const handleModuleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !moduleForm.title?.trim()) return;

    setIsSaving(true);
    setError('');
    try {
      if (moduleForm.id) {
        await coursesApi.updateModule(Number(id), moduleForm.id, {
          title: moduleForm.title,
          description: moduleForm.description,
          order: moduleForm.order,
          is_published: moduleForm.is_published,
        });
      } else {
        await coursesApi.createModule(Number(id), {
          title: moduleForm.title,
          description: moduleForm.description,
          order: moduleForm.order,
          is_published: moduleForm.is_published,
        });
      }
      setModuleForm(EMPTY_MODULE_FORM);
      setShowForm(false);
      await fetchCourseData();
    } catch (err: any) {
      console.error('Save module error:', err);
      setError(getErrorMessage(err) || 'Failed to save module.');
    } finally {
      setIsSaving(false);
    }
  };

  const editModule = (module: CourseModule) => {
    setModuleForm({
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.order,
      is_published: module.is_published,
    });
    setShowForm(true);
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!id || !window.confirm('Delete this module and all its materials?')) return;
    try {
      await coursesApi.deleteModule(Number(id), moduleId);
      await fetchCourseData();
    } catch (err) {
      console.error('Delete module error:', err);
      alert('Failed to delete module.');
    }
  };

  const togglePublish = async (module: CourseModule) => {
    if (!id) return;
    try {
      await coursesApi.updateModule(Number(id), module.id, {
        is_published: !module.is_published,
      });
      await fetchCourseData();
    } catch (err) {
      console.error('Toggle publish error:', err);
      alert('Failed to update module.');
    }
  };

  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-8 text-center text-text-muted shadow-sm">
        Loading modules...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Flat-Glass */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-muted">
              <Link to={`${basePath}/courses`} className="hover:text-text transition-colors">
                Courses
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-purple-600">{course?.title}</span>
              <ChevronRight className="h-3 w-3" />
              <span>Modules</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">Module Management</h1>
            <p className="mt-2 text-sm text-text-muted">
              Create and organize course modules. Each module can contain multiple materials.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`${basePath}/courses`)} className="border-border/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
            <Button
              onClick={() => {
                setModuleForm(EMPTY_MODULE_FORM);
                setShowForm(!showForm);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'Add Module'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats with Flat-Glass */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-text-muted">Total Modules</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-text">{stats.total}</p>
        </div>
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-text-muted">Published</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-600">{stats.published}</p>
        </div>
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-text-muted">Drafts</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-600">{stats.draft}</p>
        </div>
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-text-muted">Total Materials</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-blue-600">{stats.totalMaterials}</p>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-md bg-red-50/80 border border-red-200/50 rounded-xl p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Module Form with Flat-Glass */}
      {showForm && (
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-text mb-4">
            {moduleForm.id ? 'Edit Module' : 'Create New Module'}
          </h2>
          <form onSubmit={handleModuleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text">Module Title</label>
              <Input
                value={moduleForm.title}
                onChange={(event) => setModuleForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="e.g., Introduction to Blockchain"
                className="border-border/50 bg-surface/50"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">Description</label>
              <Textarea
                rows={3}
                value={moduleForm.description || ''}
                onChange={(event) => setModuleForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Brief description of what this module covers"
                className="border-border/50 bg-surface/50"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Order</label>
                <Input
                  type="number"
                  min="0"
                  value={moduleForm.order || 0}
                  onChange={(event) => setModuleForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
                  className="border-border/50 bg-surface/50"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-3 text-sm font-medium text-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(moduleForm.is_published)}
                    onChange={(event) => setModuleForm((prev) => ({ ...prev, is_published: event.target.checked }))}
                    className="h-4 w-4 rounded border-border/50 text-purple-600"
                  />
                  Published
                </label>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" isLoading={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white">
                {moduleForm.id ? 'Update Module' : 'Create Module'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setModuleForm(EMPTY_MODULE_FORM);
                  setShowForm(false);
                }}
                className="border-border/50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Modules List with Flat-Glass */}
      <div className="space-y-3">
        {modules.length === 0 ? (
          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-8 text-center shadow-sm">
            <BookOpen className="h-12 w-12 mx-auto text-text-muted opacity-50 mb-3" />
            <p className="text-text-muted">No modules created yet.</p>
            <Button
              onClick={() => {
                setModuleForm(EMPTY_MODULE_FORM);
                setShowForm(true);
              }}
              variant="outline"
              className="mt-4 border-border/50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Module
            </Button>
          </div>
        ) : (
          modules.map((module, index) => (
            <div
              key={module.id}
              className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 text-text-muted">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-purple-600 bg-purple-600/10 px-2 py-1 rounded-lg">
                        Module {index + 1}
                      </span>
                      <Badge variant={module.is_published ? 'success' : 'warning'} className="text-xs">
                        {module.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold tracking-tight text-text">{module.title}</h3>
                    <p className="text-sm text-text-muted mt-1">{module.description || 'No description provided.'}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-text-muted">
                        <BookOpen className="h-3 w-3 inline mr-1" />
                        {module.materials.length} materials
                      </span>
                      <Link
                        to={`${basePath}/courses/${id}/modules/${module.id}/materials`}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Manage Materials →
                      </Link>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 backdrop-blur-md bg-surface/95 border-border/50">
                    <DropdownMenuLabel>Module Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => editModule(module)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Module
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`${basePath}/courses/${id}/modules/${module.id}/materials`}>
                        <BookOpen className="mr-2 h-4 w-4" />
                        Manage Materials
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => togglePublish(module)}>
                      {module.is_published ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Publish
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteModule(module.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Module
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModuleManagementPage;
