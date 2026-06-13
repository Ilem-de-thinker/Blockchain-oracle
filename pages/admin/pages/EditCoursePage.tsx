import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { Course, CreateCourseData, coursesApi } from '../../../src/api/courses';
import { uploadApi } from '../../../src/api/upload';
import RichTextEditor from '../../../components/ui/rich-text-editor';
import { getErrorMessage } from '../../../src/api/errorHandler';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const categories = [
  'Blockchain',
  'Development',
  'DeFi',
  'NFTs',
  'Trading',
  'Finance',
  'Technology',
  'Business',
];

const levels: Array<CreateCourseData['level']> = ['Beginner', 'Intermediate', 'Advanced'];

const EditCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [certificateTemplateFile, setCertificateTemplateFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const basePath = location.pathname.startsWith('/tutor')
    ? '/tutor'
    : location.pathname.startsWith('/super-admin')
      ? '/super-admin'
      : '/admin';
  const workspaceLabel = basePath === '/tutor' ? 'Tutor' : basePath === '/super-admin' ? 'Super Admin' : 'Admin';

  const DEFAULT_FORM: CreateCourseData = {
    title: '',
    description: '',
    thumbnail_url: '',
    registration_fee: 0,
    tuition_fee: 0,
    certificate_fee: 0,
    allow_installments: false,
    price: 0,
    category: '',
    level: 'Beginner',
    is_published: false,
  };

  const [formData, setFormData] = useLocalStorage<CreateCourseData>(`edit_course_${id}_data`, DEFAULT_FORM);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await coursesApi.getCourse(Number(id));
        setCourse(data);
        setFormData(prev => {
          const isDefault = JSON.stringify(prev) === JSON.stringify(DEFAULT_FORM);
          return isDefault
            ? {
                title: data.title,
                description: data.description,
                thumbnail_url: data.thumbnail_url || '',
                registration_fee: Number(data.registration_fee || 0),
                tuition_fee: Number(data.tuition_fee || 0),
                certificate_fee: Number(data.certificate_fee || 0),
                allow_installments: Boolean(data.allow_installments),
                price: Number(data.total_amount || data.price || 0),
                category: data.category || '',
                level: (data.level as CreateCourseData['level']) || 'Beginner',
                is_published: data.is_published,
              }
            : prev;
        });
      } catch (err) {
        console.error('Fetch course error:', err);
        setError('Failed to load course.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const pricing = useMemo(() => {
    const registration = Number(formData.registration_fee || 0);
    const tuition = Number(formData.tuition_fee || 0);
    const certificate = Number(formData.certificate_fee || 0);
    const manualPrice = Number(formData.price || 0);
    const total = registration + tuition + certificate;
    return {
      registration,
      tuition,
      certificate,
      total,
      effectiveTotal: total > 0 ? total : manualPrice,
    };
  }, [formData]);

  const setField = (name: keyof CreateCourseData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    setUploadingImage(true);
    setError('');
    try {
      const url = await uploadApi.uploadThumbnail(file);
      setField('thumbnail_url', url);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id) return;

    setIsSaving(true);
    setError('');
    try {
      await coursesApi.updateCourse(Number(id), {
        ...formData,
        certificate_template: certificateTemplateFile,
        price: pricing.effectiveTotal,
      });
      setFormData(DEFAULT_FORM);
      navigate(`${basePath}/courses`);
    } catch (err: any) {
      console.error('Update course error:', err);
      setError(getErrorMessage(err) || 'Failed to update course.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCertificateTemplateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setCertificateTemplateFile(null);
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Certificate template must be a PDF file.');
      return;
    }

    setError('');
    setCertificateTemplateFile(file);
  };

  if (isLoading) {
    return <div className="rounded-3xl border border-border bg-surface p-8 text-center text-text-muted shadow-sm">Loading course...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">{workspaceLabel} Course Editor</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-text">{course?.title || 'Edit course'}</h1>
            <p className="mt-3 max-w-3xl text-sm text-text-muted">
              Update commercial settings, publishing state, and presentation before managing curriculum items.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`${basePath}/courses/${id}/materials`)}>
              Materials
            </Button>
            <Button variant="outline" onClick={() => navigate(`${basePath}/courses`)}>
              Back
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Course information</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-text">Course title</label>
                <Input value={formData.title} onChange={(event) => setField('title', event.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Category</label>
                <select
                  value={formData.category}
                  onChange={(event) => setField('category', event.target.value)}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Level</label>
                <select
                  value={formData.level}
                  onChange={(event) => setField('level', event.target.value as CreateCourseData['level'])}
                  className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-text">Description</label>
                <RichTextEditor 
                  value={formData.description} 
                  onChange={(content) => setField('description', content)} 
                  minHeight="300px"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Pricing and access</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Registration fee</label>
                <Input type="number" min="0" step="0.01" value={formData.registration_fee} onChange={(event) => setField('registration_fee', Number(event.target.value))} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Tuition fee</label>
                <Input type="number" min="0" step="0.01" value={formData.tuition_fee} onChange={(event) => setField('tuition_fee', Number(event.target.value))} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Certificate fee</label>
                <Input type="number" min="0" step="0.01" value={formData.certificate_fee} onChange={(event) => setField('certificate_fee', Number(event.target.value))} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Fallback total price</label>
                <Input type="number" min="0" step="0.01" value={formData.price} onChange={(event) => setField('price', Number(event.target.value))} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-6 rounded-2xl border border-border bg-primary/5 p-4">
              <label className="flex items-center gap-3 text-sm font-medium text-text">
                <input
                  type="checkbox"
                  checked={formData.allow_installments}
                  onChange={(event) => setField('allow_installments', event.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Allow installments
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-text">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(event) => setField('is_published', event.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Published
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Thumbnail</h2>
            <div className="mt-4 space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full text-sm text-text-muted file:mr-4 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2"
              />
              {uploadingImage && <p className="text-sm text-text-muted">Uploading image...</p>}
              {formData.thumbnail_url ? (
                <img
                  src={formData.thumbnail_url}
                  alt="Course thumbnail"
                  className="h-48 w-full rounded-2xl border border-border object-cover"
                />
              ) : (
                <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border bg-primary/5 text-sm text-text-muted">
                  Thumbnail preview
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Certificate template</h2>
            <div className="mt-4 space-y-4">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleCertificateTemplateChange}
                className="w-full text-sm text-text-muted file:mr-4 file:rounded-md file:border file:border-border file:bg-surface file:px-3 file:py-2"
              />
              <p className="text-sm text-text-muted">
                Upload a new PDF to replace the backend certificate template for this course.
              </p>
              <div className="rounded-2xl border border-dashed border-border bg-primary/5 p-4 text-sm text-text-muted">
                {certificateTemplateFile
                  ? `Selected: ${certificateTemplateFile.name}`
                  : course?.certificate_template
                    ? 'A certificate template already exists for this course.'
                    : 'No replacement certificate template selected'}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Course health</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Verification</span>
                <Badge variant={course?.is_verified ? 'success' : 'outline'}>
                  {course?.is_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Tutor</span>
                <span className="font-medium text-text">{course?.tutor.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Modules</span>
                <span className="font-medium text-text">{course?.modules.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Materials</span>
                <span className="font-medium text-text">
                  {course?.modules.reduce((sum, module) => sum + module.materials.length, 0) || 0}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3">
                <span className="font-semibold text-text">Effective total</span>
                <span className="text-lg font-black text-text">${pricing.effectiveTotal.toFixed(2)}</span>
              </div>
            </div>
            <Button type="submit" className="mt-6 w-full" isLoading={isSaving}>
              Save changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCoursePage;
