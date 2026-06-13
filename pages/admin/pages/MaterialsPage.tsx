import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import RichTextEditor from '../../../components/ui/rich-text-editor';
import {
  Course,
  CourseMaterial,
  CourseModule,
  CreateMaterialData,
  CreateModuleData,
  coursesApi,
} from '../../../src/api/courses';
import { uploadApi } from '../../../src/api/upload';
import { getErrorMessage } from '../../../src/api/errorHandler';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { 
  Plus, 
  Trash2, 
  Edit, 
  MoreHorizontal, 
  Eye, 
  Video,
  FileText,
  Type,
  ExternalLink
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';

interface ModuleFormState extends CreateModuleData {
  id?: number;
}

interface MaterialFormState extends CreateMaterialData {
  id?: number;
  moduleId?: number;
}

const EMPTY_MODULE_FORM: ModuleFormState = {
  title: '',
  description: '',
  order: 0,
  is_published: false,
};

const EMPTY_MATERIAL_FORM: MaterialFormState = {
  type: 'video',
  title: '',
  order: 0,
  url: '',
  duration: 0,
  pages: 0,
  content: '',
  moduleId: undefined,
};

const MaterialsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();

  const basePath = location.pathname.startsWith('/tutor')
    ? '/tutor'
    : location.pathname.startsWith('/super-admin')
      ? '/super-admin'
      : '/admin';

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingModule, setIsSavingModule] = useState(false);
  const [isSavingMaterial, setIsSavingMaterial] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');
  const [moduleForm, setModuleForm] = useState<ModuleFormState>(EMPTY_MODULE_FORM);
  const [materialForm, setMaterialForm] = useState<MaterialFormState>(EMPTY_MATERIAL_FORM);

  const fetchCourseData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [courseData, modulesData, materialsData] = await Promise.all([
        coursesApi.getCourse(Number(id)),
        coursesApi.getModules(Number(id)),
        coursesApi.getMaterials(Number(id)),
      ]);
      setCourse(courseData);
      setModules(modulesData.sort((a, b) => a.order - b.order));
      setMaterials(materialsData.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error('Fetch course materials error:', err);
      setError('Failed to load course curriculum.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const materialsByModule = useMemo(() => {
    return modules.map((module) => ({
      module,
      items: materials.filter((material) => material.module === module.id),
    }));
  }, [materials, modules]);

  const stats = useMemo(() => {
    const videos = materials.filter((material) => material.type === 'video').length;
    const pdfs = materials.filter((material) => material.type === 'pdf').length;
    const texts = materials.filter((material) => material.type === 'text').length;
    return { videos, pdfs, texts };
  }, [materials]);

  const handleModuleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !moduleForm.title?.trim()) return;

    setIsSavingModule(true);
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
      await fetchCourseData();
    } catch (err: any) {
      console.error('Save module error:', err);
      setError(getErrorMessage(err) || 'Failed to save module.');
    } finally {
      setIsSavingModule(false);
    }
  };

  const handleMaterialSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !materialForm.title.trim()) return;

    setIsSavingMaterial(true);
    setError('');

    const payload: CreateMaterialData = {
      type: materialForm.type,
      title: materialForm.title,
      order: materialForm.order,
      url: materialForm.url,
      duration: materialForm.duration,
      pages: materialForm.pages,
      content: materialForm.content,
    };

    try {
      if (materialForm.id) {
        await coursesApi.updateMaterial(materialForm.id, payload);
      } else if (materialForm.moduleId) {
        await coursesApi.createModuleMaterial(materialForm.moduleId, payload);
      } else {
        setError('Please select a module before adding material.');
        return;
      }
      setMaterialForm(EMPTY_MATERIAL_FORM);
      await fetchCourseData();
    } catch (err: any) {
      console.error('Save material error:', err);
      setError(getErrorMessage(err) || 'Failed to save material.');
    } finally {
      setIsSavingMaterial(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setError('');
    try {
      const url = await uploadApi.uploadMaterial(file);
      setMaterialForm((prev) => ({ ...prev, url }));
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to upload file.');
    } finally {
      setUploadingFile(false);
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
  };

  const editMaterial = (material: CourseMaterial) => {
    setMaterialForm({
      id: material.id,
      type: material.type,
      title: material.title,
      order: material.order,
      url: material.url || '',
      duration: material.duration || 0,
      pages: material.pages || 0,
      content: material.content || '',
      moduleId: material.module,
    });
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!id || !window.confirm('Delete this module?')) return;
    try {
      await coursesApi.deleteModule(Number(id), moduleId);
      await fetchCourseData();
    } catch (err) {
      console.error('Delete module error:', err);
      alert('Failed to delete module.');
    }
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await coursesApi.deleteMaterial(materialId);
      await fetchCourseData();
    } catch (err) {
      console.error('Delete material error:', err);
      alert('Failed to delete material.');
    }
  };

  if (isLoading) {
    return <div className="rounded-3xl border border-border bg-surface p-8 text-center text-text-muted shadow-sm">Loading curriculum...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-text-muted">
              <Link to={`${basePath}/courses`} className="hover:text-text">Courses</Link>
              <span>/</span>
              <span>{course?.title}</span>
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-text">Curriculum manager</h1>
            <p className="mt-3 max-w-3xl text-sm text-text-muted">
              Create modules first, then attach videos, PDFs, or text lessons to build the course workflow.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate(`${basePath}/courses`)}>
            Back to courses
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Modules</p>
          <p className="mt-2 text-3xl font-black text-text">{modules.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Videos</p>
          <p className="mt-2 text-3xl font-black text-blue-600">{stats.videos}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">PDFs</p>
          <p className="mt-2 text-3xl font-black text-red-600">{stats.pdfs}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Text lessons</p>
          <p className="mt-2 text-3xl font-black text-purple-600">{stats.texts}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
        <div className="space-y-6">
          <form onSubmit={handleModuleSubmit} className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">{moduleForm.id ? 'Edit module' : 'Add module'}</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Module title</label>
                <Input value={moduleForm.title} onChange={(event) => setModuleForm((prev) => ({ ...prev, title: event.target.value }))} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Description</label>
                <Textarea rows={4} value={moduleForm.description || ''} onChange={(event) => setModuleForm((prev) => ({ ...prev, description: event.target.value }))} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Order</label>
                  <Input type="number" min="0" value={moduleForm.order || 0} onChange={(event) => setModuleForm((prev) => ({ ...prev, order: Number(event.target.value) }))} />
                </div>
                <label className="mt-8 flex items-center gap-3 text-sm font-medium text-text">
                  <input
                    type="checkbox"
                    checked={Boolean(moduleForm.is_published)}
                    onChange={(event) => setModuleForm((prev) => ({ ...prev, is_published: event.target.checked }))}
                    className="h-4 w-4 rounded border-border"
                  />
                  Published
                </label>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button type="submit" isLoading={isSavingModule}>
                {moduleForm.id ? 'Update module' : 'Create module'}
              </Button>
              {moduleForm.id && (
                <Button type="button" variant="outline" onClick={() => setModuleForm(EMPTY_MODULE_FORM)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>

          <form onSubmit={handleMaterialSubmit} className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">{materialForm.id ? 'Edit material' : 'Add material'}</h2>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Title</label>
                  <Input value={materialForm.title} onChange={(event) => setMaterialForm((prev) => ({ ...prev, title: event.target.value }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Type</label>
                  <select
                    value={materialForm.type}
                    onChange={(event) => setMaterialForm((prev) => ({ ...prev, type: event.target.value as CreateMaterialData['type'] }))}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                  >
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="text">Text</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Module</label>
                  <select
                    value={materialForm.moduleId || ''}
                    onChange={(event) => setMaterialForm((prev) => ({
                      ...prev,
                      moduleId: event.target.value ? Number(event.target.value) : undefined,
                    }))}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                  >
                    <option value="">Course root</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Order</label>
                  <Input type="number" min="0" value={materialForm.order || 0} onChange={(event) => setMaterialForm((prev) => ({ ...prev, order: Number(event.target.value) }))} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Duration (minutes)</label>
                  <Input type="number" min="0" value={materialForm.duration || 0} onChange={(event) => setMaterialForm((prev) => ({ ...prev, duration: Number(event.target.value) }))} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Pages</label>
                  <Input type="number" min="0" value={materialForm.pages || 0} onChange={(event) => setMaterialForm((prev) => ({ ...prev, pages: Number(event.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">File or URL</label>
                <Input value={materialForm.url || ''} onChange={(event) => setMaterialForm((prev) => ({ ...prev, url: event.target.value }))} placeholder="https://..." />
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="mt-3 w-full text-sm text-text-muted file:mr-4 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2"
                />
                {uploadingFile && <p className="mt-2 text-sm text-text-muted">Uploading asset...</p>}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Text content</label>
                <RichTextEditor value={materialForm.content || ''} onChange={(html) => setMaterialForm((prev) => ({ ...prev, content: html }))} />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button type="submit" isLoading={isSavingMaterial}>
                {materialForm.id ? 'Update material' : 'Create material'}
              </Button>
              {materialForm.id && (
                <Button type="button" variant="outline" onClick={() => setMaterialForm(EMPTY_MATERIAL_FORM)}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Modules</h2>
            <div className="mt-4 space-y-3">
              {modules.length === 0 ? (
                <p className="text-sm text-text-muted">No modules created yet.</p>
              ) : (
                modules.map((module) => (
                  <div key={module.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-text">{module.title}</p>
                          <Badge variant={module.is_published ? 'success' : 'warning'}>
                            {module.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-text-muted">Order {module.order + 1}</p>
                        <p className="mt-2 text-sm text-text-muted">{module.description || 'No description provided.'}</p>
                      </div>
                      <div className="shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="xs">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Module Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => editModule(module)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Module</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteModule(module.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Module</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface shadow-sm">
            <Table variant="striped">
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-text-muted">
                      No materials added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-semibold text-text">{material.title}</p>
                          <p className="text-xs text-text-muted">{material.url || material.content?.slice(0, 60) || 'No preview available'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-text-muted">
                        {modules.find((module) => module.id === material.module)?.title || 'Course root'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">{material.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-text-muted">{material.order + 1}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="xs">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Material Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => editMaterial(material)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Material</span>
                            </DropdownMenuItem>
                            {material.url && (
                              <DropdownMenuItem asChild>
                                <a href={material.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  <span>View Content</span>
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMaterial(material.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Material</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Curriculum overview</h2>
            <div className="mt-4 space-y-4">
              {materialsByModule.map(({ module, items }) => (
                <div key={module.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-text">{module.title}</p>
                    <span className="text-xs text-text-muted">{items.length} materials</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {items.length === 0 ? (
                      <p className="text-xs text-text-muted">No materials attached to this module.</p>
                    ) : (
                      items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-xl bg-primary/5 px-3 py-2 text-sm">
                          <span className="text-text">{item.title}</span>
                          <Badge variant="secondary">{item.type}</Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialsPage;
