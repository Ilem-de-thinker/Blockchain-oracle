import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import RichTextEditor from '../../../components/ui/rich-text-editor';
import { Badge } from '../../../components/ui/badge';
import {
  CourseModule,
  CourseMaterial,
  CreateMaterialData,
  coursesApi,
} from '../../../src/api/courses';
import { uploadApi } from '../../../src/api/upload';
import { getErrorMessage } from '../../../src/api/errorHandler';
import {
  Plus,
  Trash2,
  Edit,
  MoreHorizontal,
  ArrowLeft,
  Video,
  FileText,
  Type,
  ExternalLink,
  Upload,
  X,
  Eye,
  GripVertical,
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

interface MaterialFormState extends CreateMaterialData {
  id?: number;
}

const EMPTY_MATERIAL_FORM: MaterialFormState = {
  type: 'video',
  title: '',
  order: 0,
  url: '',
  duration: 0,
  pages: 0,
  content: '',
};

const MaterialManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId: rawCourseId, moduleId: rawModuleId } = useParams<{ courseId: string; moduleId: string }>();

  const courseId = rawCourseId ? Number(rawCourseId) : NaN;
  const moduleId = rawModuleId ? Number(rawModuleId) : NaN;

  const basePath = location.pathname.startsWith('/super-admin')
    ? '/super-admin'
    : location.pathname.startsWith('/tutor')
    ? '/tutor'
    : '/admin';

  const [module, setModule] = useState<CourseModule | null>(null);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [materialForm, setMaterialForm] = useState<MaterialFormState>(EMPTY_MATERIAL_FORM);

  const fetchModuleData = async () => {
    if (isNaN(courseId) || isNaN(moduleId)) return;
    setIsLoading(true);
    try {
      const [moduleData, materialsData] = await Promise.all([
        coursesApi.getModules(courseId).then(modules =>
          modules.find(m => m.id === moduleId)
        ),
        coursesApi.getModuleMaterials(moduleId, courseId),
      ]);

      if (moduleData) {
        setModule(moduleData);
      }
      setMaterials(materialsData.sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error('Fetch module materials error:', err);
      setError('Failed to load module materials. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isNaN(courseId) || isNaN(moduleId)) {
      setError('Invalid course or module ID');
      setIsLoading(false);
      return;
    }
    fetchModuleData();
  }, [courseId, moduleId]);

  const stats = {
    videos: materials.filter(m => m.type === 'video').length,
    pdfs: materials.filter(m => m.type === 'pdf').length,
    texts: materials.filter(m => m.type === 'text').length,
  };

  const handleMaterialSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!moduleId || !materialForm.title.trim()) return;

    setIsSaving(true);
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
      } else {
        await coursesApi.createModuleMaterial(Number(moduleId), payload);
      }
      setMaterialForm(EMPTY_MATERIAL_FORM);
      setShowForm(false);
      await fetchModuleData();
    } catch (err: any) {
      console.error('Save material error:', err);
      setError(getErrorMessage(err) || 'Failed to save material.');
    } finally {
      setIsSaving(false);
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
    });
    setShowForm(true);
  };

  const handleDeleteMaterial = async (materialId: number) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await coursesApi.deleteMaterial(materialId);
      await fetchModuleData();
    } catch (err) {
      console.error('Delete material error:', err);
      alert('Failed to delete material.');
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-blue-500" />;
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'text': return <Type className="h-4 w-4 text-purple-500" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-8 text-center text-text-muted shadow-sm">
        Loading materials...
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
              <span>/</span>
              {isNaN(courseId) ? (
                <span>Modules</span>
              ) : (
                <Link to={`${basePath}/courses/${courseId}/modules`} className="hover:text-text transition-colors">
                  Modules
                </Link>
              )}
              <span>/</span>
              <span className="text-purple-600">{module?.title}</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">Material Management</h1>
            <p className="mt-2 text-sm text-text-muted">
              Add videos, PDFs, and text content to this module.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(isNaN(courseId) ? `${basePath}/courses` : `${basePath}/courses/${courseId}/modules`)} className="border-border/50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Modules
            </Button>
            <Button
              onClick={() => {
                setMaterialForm(EMPTY_MATERIAL_FORM);
                setShowForm(!showForm);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'Add Material'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats with Flat-Glass */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Video className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Videos</p>
              <p className="text-2xl font-semibold tracking-tight text-text">{stats.videos}</p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <FileText className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-text-muted">PDFs</p>
              <p className="text-2xl font-semibold tracking-tight text-text">{stats.pdfs}</p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Type className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-text-muted">Text Lessons</p>
              <p className="text-2xl font-semibold tracking-tight text-text">{stats.texts}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-md bg-red-50/80 border border-red-200/50 rounded-xl p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Material Form with Flat-Glass */}
      {showForm && (
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight text-text mb-4">
            {materialForm.id ? 'Edit Material' : 'Add New Material'}
          </h2>
          <form onSubmit={handleMaterialSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Title</label>
                <Input
                  value={materialForm.title}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="e.g., Introduction Video"
                  className="border-border/50 bg-surface/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Type</label>
                <select
                  value={materialForm.type}
                  onChange={(event) => setMaterialForm((prev) => ({
                    ...prev,
                    type: event.target.value as CreateMaterialData['type'],
                  }))}
                  className="w-full rounded-xl border border-border/50 bg-surface/80 px-3 py-2 text-sm text-text"
                >
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="text">Text</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Order</label>
                <Input
                  type="number"
                  min="0"
                  value={materialForm.order || 0}
                  onChange={(event) => setMaterialForm((prev) => ({ ...prev, order: Number(event.target.value) }))}
                  className="border-border/50 bg-surface/50"
                />
              </div>
              {materialForm.type === 'video' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Duration (minutes)</label>
                  <Input
                    type="number"
                    min="0"
                    value={materialForm.duration || 0}
                    onChange={(event) => setMaterialForm((prev) => ({ ...prev, duration: Number(event.target.value) }))}
                    className="border-border/50 bg-surface/50"
                  />
                </div>
              )}
              {materialForm.type === 'pdf' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-text">Pages</label>
                  <Input
                    type="number"
                    min="0"
                    value={materialForm.pages || 0}
                    onChange={(event) => setMaterialForm((prev) => ({ ...prev, pages: Number(event.target.value) }))}
                    className="border-border/50 bg-surface/50"
                  />
                </div>
              )}
            </div>

            {(materialForm.type === 'video' || materialForm.type === 'pdf') && (
              <div>
                <label className="mb-2 block text-sm font-medium text-text">File or URL</label>
                <div className="flex gap-2">
                  <Input
                    value={materialForm.url || ''}
                    onChange={(event) => setMaterialForm((prev) => ({ ...prev, url: event.target.value }))}
                    placeholder="https://... or upload below"
                    className="flex-1 border-border/50 bg-surface/50"
                  />
                </div>
                <div className="mt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-purple-600 hover:text-purple-700">
                    <Upload className="h-4 w-4" />
                    <span>Upload file</span>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="hidden"
                      accept={materialForm.type === 'pdf' ? '.pdf' : 'video/*'}
                    />
                  </label>
                  {uploadingFile && <p className="mt-2 text-xs text-text-muted">Uploading...</p>}
                </div>
              </div>
            )}

            {materialForm.type === 'text' && (
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Content</label>
                <RichTextEditor
                  value={materialForm.content || ''}
                  onChange={(html) => setMaterialForm((prev) => ({ ...prev, content: html }))}
                  placeholder="Write your content here..."
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" isLoading={isSaving} className="bg-purple-600 hover:bg-purple-700 text-white">
                {materialForm.id ? 'Update Material' : 'Create Material'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setMaterialForm(EMPTY_MATERIAL_FORM);
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

      {/* Materials List with Flat-Glass */}
      <div className="space-y-3">
        {materials.length === 0 ? (
          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-8 text-center shadow-sm">
            <Video className="h-12 w-12 mx-auto text-text-muted opacity-50 mb-3" />
            <p className="text-text-muted">No materials added yet.</p>
            <Button
              onClick={() => {
                setMaterialForm(EMPTY_MATERIAL_FORM);
                setShowForm(true);
              }}
              variant="outline"
              className="mt-4 border-border/50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Material
            </Button>
          </div>
        ) : (
          materials.map((material, index) => (
            <div
              key={material.id}
              className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1 text-text-muted">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="p-2 rounded-lg bg-surface/50 border border-border/30">
                    {getMaterialIcon(material.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-purple-600 bg-purple-600/10 px-2 py-0.5 rounded-lg">
                        #{index + 1}
                      </span>
                      <Badge variant="default" className="text-xs capitalize">
                        {material.type}
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold tracking-tight text-text">{material.title}</h3>
                    {material.url && (
                      <a
                        href={material.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-700 mt-1 inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Content
                      </a>
                    )}
                    {material.content && (
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {material.content}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {material.duration && (
                        <span className="text-xs text-text-muted">
                          <Video className="h-3 w-3 inline mr-1" />
                          {material.duration} min
                        </span>
                      )}
                      {material.pages && (
                        <span className="text-xs text-text-muted">
                          <FileText className="h-3 w-3 inline mr-1" />
                          {material.pages} pages
                        </span>
                      )}
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
                    <DropdownMenuLabel>Material Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => editMaterial(material)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    {material.url && (
                      <DropdownMenuItem asChild>
                        <a href={material.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Content
                        </a>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteMaterial(material.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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

export default MaterialManagementPage;
