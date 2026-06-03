import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { coursesApi, Course } from '../../src/api/courses';

import { Button } from '../../components/ui/button';
import { useToast } from '../../src/hooks/useToast';
import { Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';

const TutorCourseDeletePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      if (!id) return;
      try {
        const data = await coursesApi.getCourse(parseInt(id, 10));
        setCourse(data);
      } catch (error) {
        console.error('Failed to load course for deletion:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await coursesApi.deleteCourse(parseInt(id, 10));
      toast.success('Course deleted successfully');
      navigate('/tutor/courses');
    } catch (error) {
      console.error('Failed to delete course:', error);
      toast.error('Failed to delete course');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-surface rounded-2xl border border-red-200 p-8 text-center space-y-6 shadow-xl shadow-red-500/5">
        <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto text-red-600">
          <AlertTriangle size={40} />
        </div>
        
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600 mb-2">Confirm Deletion</p>
          <h1 className="text-2xl font-black tracking-tight text-text">
            {course?.title || 'Course'}
          </h1>
          <p className="mt-4 text-sm text-text-muted leading-relaxed">
            You are about to permanently delete this course and all its associated modules, materials, and quizzes. This action cannot be reversed.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={deleting}
            className="w-full sm:w-auto min-w-[160px]"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Permanently Delete
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/tutor/courses')}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Keep Course
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorCourseDeletePage;
