import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Badge } from '../../../components/ui/badge';
import { coursesApi, CreateCourseData } from '../../../src/api/courses';
import { uploadApi } from '../../../src/api/upload';
import { getErrorMessage } from '../../../src/api/errorHandler';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { cn } from '@/lib/utils';
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  DollarSign,
  Image,
  Send,
  Loader2,
  Users as UsersIcon,
  CheckCircle2,
} from 'lucide-react';
import { usersApi, User } from '../../../src/api/users';

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

interface CourseFormData {
  title: string;
  description: string;
  category: string;
  level: CreateCourseData['level'];
  registration_fee: number;
  tuition_fee: number;
  certificate_fee: number;
  allow_installments: boolean;
  price: number;
  thumbnail_url: string;
  is_published: boolean;
  tutor_id?: number;
}

const EMPTY_FORM: CourseFormData = {
  title: '',
  description: '',
  category: '',
  level: 'Beginner',
  registration_fee: 0,
  tuition_fee: 0,
  certificate_fee: 0,
  allow_installments: false,
  price: 0,
  thumbnail_url: '',
  is_published: false,
};

const STEPS = [
  { id: 'info', label: 'Course Info', icon: BookOpen },
  { id: 'tutor', label: 'Assign Tutor', icon: UsersIcon },
  { id: 'pricing', label: 'Pricing', icon: DollarSign },
  { id: 'thumbnail', label: 'Thumbnail', icon: Image },
  { id: 'review', label: 'Review', icon: Send },
];

const CreateCourseWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = location.pathname.startsWith('/super-admin')
    ? '/super-admin'
    : location.pathname.startsWith('/tutor')
    ? '/tutor'
    : '/admin';

  const [currentStep, setCurrentStep] = useLocalStorage('course_create_wizard_step', 0);
  const [formData, setFormData] = useLocalStorage<CourseFormData>('course_create_wizard_data', EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [createdCourseId, setCreatedCourseId] = useState<number | null>(null);
  const [tutors, setTutors] = useState<User[]>([]);
  const [loadingTutors, setLoadingTutors] = useState(false);

  useEffect(() => {
    const fetchTutors = async () => {
      if (basePath === '/tutor') return;
      setLoadingTutors(true);
      try {
        const response = await usersApi.getTutors(1, '');
        setTutors(response.results);
      } catch (err) {
        console.error('Failed to fetch tutors:', err);
      } finally {
        setLoadingTutors(false);
      }
    };
    fetchTutors();
  }, [basePath]);

  // Adjust steps for tutors (remove assign tutor step)
  const activeSteps = useMemo(() => {
    if (basePath === '/tutor') {
      return STEPS.filter(step => step.id !== 'tutor');
    }
    return STEPS;
  }, [basePath]);

  const pricing = {
    registration: Number(formData.registration_fee || 0),
    tuition: Number(formData.tuition_fee || 0),
    certificate: Number(formData.certificate_fee || 0),
  };
  const totalPrice = pricing.registration + pricing.tuition + pricing.certificate;
  const effectiveTotal = totalPrice > 0 ? totalPrice : Number(formData.price || 0);

  const setField = (name: keyof CourseFormData, value: string | number | boolean | undefined) => {
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

  const validateStep = (step: number): boolean => {
    setError('');
    const stepId = activeSteps[step].id;

    switch (stepId) {
      case 'info':
        if (!formData.title.trim()) {
          setError('Course title is required.');
          return false;
        }
        if (!formData.description.trim()) {
          setError('Course description is required.');
          return false;
        }
        return true;
      case 'tutor':
        if (!formData.tutor_id) {
          setError('Please assign a tutor to this course.');
          return false;
        }
        return true;
      case 'pricing':
        if (effectiveTotal <= 0) {
          setError('Total price must be greater than 0.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, activeSteps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    setError('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    try {
      const courseData: CreateCourseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        registration_fee: formData.registration_fee,
        tuition_fee: formData.tuition_fee,
        certificate_fee: formData.certificate_fee,
        allow_installments: formData.allow_installments,
        price: effectiveTotal,
        thumbnail_url: formData.thumbnail_url || undefined,
        is_published: formData.is_published,
        tutor_id: formData.tutor_id,
      };

      const response = await coursesApi.createCourse(courseData);
      setCreatedCourseId(response.id);
      setCurrentStep(activeSteps.length - 1); // Go to review/complete step
      setFormData(EMPTY_FORM); // Clear persisted data so next visit starts fresh
    } catch (err: any) {
      console.error('Create course error:', err);
      setError(getErrorMessage(err) || 'Failed to create course.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const currentStepId = activeSteps[currentStep].id;

    switch (currentStepId) {
      case 'info':
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text">Course Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setField('title', e.target.value)}
                placeholder="e.g., Blockchain Fundamentals"
                className="border-border/50 bg-surface/50"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setField('category', e.target.value)}
                  className="w-full rounded-xl border border-border/50 bg-surface/80 px-3 py-2 text-sm text-text"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setField('level', e.target.value as CreateCourseData['level'])}
                  className="w-full rounded-xl border border-border/50 bg-surface/80 px-3 py-2 text-sm text-text"
                >
                  {levels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">Description</label>
              <Textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Describe what students will learn..."
                className="border-border/50 bg-surface/50"
              />
            </div>
          </div>
        );

      case 'tutor':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text">Assign a Tutor</h3>
            <p className="text-sm text-text-muted">Select the primary instructor for this course.</p>
            {loadingTutors ? (
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading tutors...
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {tutors.map(tutor => (
                  <button
                    key={tutor.id}
                    type="button"
                    onClick={() => setField('tutor_id', tutor.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                      formData.tutor_id === tutor.id
                        ? "border-purple-600 bg-purple-50"
                        : "border-border/30 hover:border-border/60 bg-surface/50"
                    )}
                  >
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                      {tutor.profile_picture ? (
                        <img src={tutor.profile_picture} alt={tutor.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <UsersIcon className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text truncate">{tutor.full_name}</p>
                      <p className="text-xs text-text-muted truncate">{tutor.email}</p>
                    </div>
                    {formData.tutor_id === tutor.id && (
                      <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Registration Fee ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.registration_fee}
                  onChange={(e) => setField('registration_fee', Number(e.target.value))}
                  className="border-border/50 bg-surface/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Tuition Fee ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.tuition_fee}
                  onChange={(e) => setField('tuition_fee', Number(e.target.value))}
                  className="border-border/50 bg-surface/50"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text">Certificate Fee ($)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.certificate_fee}
                  onChange={(e) => setField('certificate_fee', Number(e.target.value))}
                  className="border-border/50 bg-surface/50"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-text">Fallback Total Price ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setField('price', Number(e.target.value))}
                className="border-border/50 bg-surface/50"
                placeholder="Optional: Used if sum of fees is 0"
              />
            </div>

            <div className="backdrop-blur-md bg-surface/60 border border-border/30 rounded-xl p-4 space-y-3">
              <h3 className="text-sm font-semibold text-text">Price Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Registration</span>
                  <span className="text-text">${pricing.registration.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Tuition</span>
                  <span className="text-text">${pricing.tuition.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Certificate</span>
                  <span className="text-text">${pricing.certificate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border/30">
                  <span className="font-semibold text-text">Total</span>
                  <span className="text-lg font-bold text-purple-600">${effectiveTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-3 text-sm font-medium text-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_installments}
                  onChange={(e) => setField('allow_installments', e.target.checked)}
                  className="h-4 w-4 rounded border-border/50 text-purple-600"
                />
                Allow Installments
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-text cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setField('is_published', e.target.checked)}
                  className="h-4 w-4 rounded border-border/50 text-purple-600"
                />
                Publish Immediately
              </label>
            </div>
          </div>
        );

      case 'thumbnail':
        return (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-text">Course Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="w-full text-sm text-text-muted file:mr-4 file:rounded-lg file:border file:border-border/50 file:bg-surface/80 file:px-4 file:py-2"
              />
              {uploadingImage && (
                <div className="mt-2 flex items-center gap-2 text-sm text-text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </div>
              )}
            </div>

            {formData.thumbnail_url ? (
              <div className="backdrop-blur-md bg-surface/60 border border-border/30 rounded-xl p-4">
                <p className="text-sm font-medium text-text mb-3">Preview</p>
                <img
                  src={formData.thumbnail_url}
                  alt="Course thumbnail"
                  className="w-full h-48 object-cover rounded-lg border border-border/30"
                />
              </div>
            ) : (
              <div className="backdrop-blur-md bg-surface/60 border border-dashed border-border/30 rounded-xl p-8 text-center">
                <Image className="h-12 w-12 mx-auto text-text-muted opacity-50 mb-3" />
                <p className="text-sm text-text-muted">No thumbnail uploaded yet</p>
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            {createdCourseId ? (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Check className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-semibold text-text">Course Created Successfully!</h3>
                <p className="text-sm text-text-muted">Your course has been created. What's next?</p>

                <div className="flex flex-col gap-3 max-w-sm mx-auto">
                  <Button
                    onClick={() => navigate(`${basePath}/courses/${createdCourseId}/modules`)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Modules & Materials
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`${basePath}/courses/${createdCourseId}/edit`)}
                    className="border-border/50"
                  >
                    Edit Course Details
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFormData(EMPTY_FORM);
                      setCreatedCourseId(null);
                      setCurrentStep(0);
                    }}
                    className="border-border/50"
                  >
                    Create Another Course
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`${basePath}/courses`)}
                  >
                    Back to Course List
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-text">Review & Create</h3>
                <div className="backdrop-blur-md bg-surface/60 border border-border/30 rounded-xl p-4 space-y-3">
                  <div>
                    <span className="text-xs text-text-muted">Title</span>
                    <p className="font-medium text-text">{formData.title}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted">Category • Level</span>
                    <p className="font-medium text-text">{formData.category || 'Uncategorized'} • {formData.level}</p>
                  </div>
                  {formData.tutor_id && (
                    <div>
                      <span className="text-xs text-text-muted">Assigned Tutor</span>
                      <p className="font-medium text-text">
                        {tutors.find(t => t.id === formData.tutor_id)?.full_name || 'Selected Tutor'}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-text-muted">Price</span>
                    <p className="font-medium text-purple-600">${effectiveTotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-xs text-text-muted">Status</span>
                    <Badge variant={formData.is_published ? 'success' : 'warning'}>
                      {formData.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  isLoading={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Create Course
                </Button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto py-6 px-4">
      {/* Header with Flat-Glass */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-600">Create Course</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">New Course Setup</h1>
          </div>
          <Button variant="outline" onClick={() => navigate(`${basePath}/courses`)} className="border-border/50">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Stepper with Flat-Glass */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          {activeSteps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep || (index === activeSteps.length - 1 && createdCourseId);

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isActive && "bg-purple-600 text-white",
                      isCompleted && "bg-emerald-500 text-white",
                      !isActive && !isCompleted && "bg-surface/50 border border-border/50 text-text-muted"
                    )}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    isActive && "text-purple-600",
                    isCompleted && "text-emerald-600",
                    !isActive && !isCompleted && "text-text-muted"
                  )}>
                    {step.label}
                  </span>
                </div>
                {index < activeSteps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-0.5 mt-[-1.5rem]",
                    index < currentStep ? "bg-emerald-500" : "bg-border/30"
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="backdrop-blur-md bg-red-50/80 border border-red-200/50 rounded-xl p-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {/* Step Content with Flat-Glass */}
      <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm">
        {renderStepContent()}
      </div>

      {/* Navigation with Flat-Glass */}
      {currentStep < activeSteps.length - 1 && (
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-4 shadow-sm flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="border-border/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {currentStep < activeSteps.length - 2 ? (
            <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white">
              Create Course
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateCourseWizard;
