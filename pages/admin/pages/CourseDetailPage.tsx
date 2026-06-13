import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { coursesApi, Course } from '../../../src/api/courses';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useToast } from '../../../src/hooks/useToast';
import {
  ArrowLeft,
  Edit,
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Globe,
  Users,
  Star,
  Calendar,
  FileText,
  Eye,
} from 'lucide-react';

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const basePath = location.pathname.startsWith('/super-admin') ? '/super-admin' : '/admin';

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const [errorCode, setErrorCode] = useState<number | null>(null);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getCourse(parseInt(id!));
      setCourse(data);
    } catch (error: any) {
      console.error('Failed to load course:', error);
      if (error?.response?.status === 404) {
        setErrorCode(404);
      } else {
        toast.error('Failed to load course');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount?: string | number) => {
    if (!amount) return 'Free';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (num <= 0) return 'Free';
    return `₦${num.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  if (errorCode === 404 || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <i className="fas fa-folder-open text-3xl text-primary"></i>
        </div>
        <h2 className="text-xl font-bold text-text mb-2">Course Not Found</h2>
        <p className="text-text-muted mb-6 max-w-md">
          The course you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex gap-3">
          <Link
            to={`${basePath}/courses`}
            className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-primary"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back to Courses
          </Link>
          <Link
            to={basePath}
            className="px-5 py-2.5 rounded-xl font-bold border hover:bg-surface-hover"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
          >
            <i className="fas fa-home mr-2"></i>
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <Link to={`${basePath}/courses`} className="hover:text-primary">
              Courses
            </Link>
            <span>/</span>
            <span className="text-primary">{course.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-text">{course.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`${basePath}/courses/${course.id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" /> Edit Course
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            {course.thumbnail_url && (
              <div className="w-full h-56 bg-surface-hover overflow-hidden">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{course.category || 'Uncategorized'}</Badge>
                <Badge variant="outline">{course.level}</Badge>
                <Badge variant={course.is_published ? 'success' : 'destructive'}>
                  {course.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>

              <div>
                <h2 className="text-sm font-bold text-text mb-2">Description</h2>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {course.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6">
            <h2 className="text-sm font-bold text-text mb-4">Modules & Materials</h2>
            {course.modules && course.modules.length > 0 ? (
              <div className="space-y-3">
                {course.modules.map((module, idx) => (
                  <div key={module.id} className="border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text">{module.title}</p>
                          {module.description && (
                            <p className="text-xs text-text-muted mt-0.5">{module.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    {module.materials && module.materials.length > 0 && (
                      <div className="mt-3 pl-11 space-y-1.5">
                        {module.materials.map((material) => (
                          <div key={material.id} className="flex items-center gap-2 text-xs text-text-muted">
                            <FileText className="h-3 w-3" />
                            <span>{material.title}</span>
                            <span className="text-[10px] uppercase opacity-60">({material.type})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted">No modules defined for this course.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-sm font-bold text-text">Course Details</h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Category</span>
                <span className="font-medium text-text">{course.category || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Level</span>
                <span className="font-medium text-text">{course.level || '—'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Status</span>
                <Badge variant={course.is_published ? 'success' : 'destructive'} className="text-[10px]">
                  {course.is_published ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Verification</span>
                <Badge variant={course.is_verified ? 'success' : 'outline'} className="text-[10px]">
                  {course.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Installments</span>
                <span className="font-medium text-text">{course.allow_installments ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Created</span>
                <span className="font-medium text-text">{formatDate(course.created_at)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Updated</span>
                <span className="font-medium text-text">{formatDate(course.updated_at)}</span>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-sm font-bold text-text">Pricing</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Total Amount</span>
                <span className="font-bold text-text text-lg">{formatMoney(course.total_amount)}</span>
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Registration Fee</span>
                  <span className="font-medium text-text">{formatMoney(course.registration_fee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Tuition Fee</span>
                  <span className="font-medium text-text">{formatMoney(course.tuition_fee)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Certificate Fee</span>
                  <span className="font-medium text-text">{formatMoney(course.certificate_fee)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 space-y-4">
            <h2 className="text-sm font-bold text-text">Tutor</h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {course.tutor?.profile_picture ? (
                  <img src={course.tutor.profile_picture} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-primary">
                    {course.tutor?.full_name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{course.tutor?.full_name}</p>
                <p className="text-xs text-text-muted">{course.tutor?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 space-y-3">
            <Link to={`${basePath}/courses/${course.id}/modules`}>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" /> Manage Modules
              </Button>
            </Link>
            <Link to={`${basePath}/courses/${course.id}/enrollments`}>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" /> View Enrollments
              </Button>
            </Link>
            <Link to={`${basePath}/courses/${course.id}/edit`}>
              <Button variant="outline" className="w-full justify-start">
                <Edit className="mr-2 h-4 w-4" /> Edit Course
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
