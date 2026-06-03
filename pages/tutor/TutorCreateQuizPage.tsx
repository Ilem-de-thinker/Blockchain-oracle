import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { quizzesApi, CreateQuizData, QuizQuestion } from '../../src/api/quizzes';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { coursesApi, Course, CourseModule } from '../../src/api/courses';
import { QuestionBuilder } from '../../components/quiz/QuestionBuilder';
import { getErrorMessage } from '../../src/api/errorHandler';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import {
  FileQuestion,
  Plus,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  BookOpen,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TutorCreateQuizPage: React.FC = () => {
  const { courseId: rawCourseId, moduleId: rawModuleId } = useParams<{ courseId?: string; moduleId?: string }>();
  const courseId = rawCourseId ? Number(rawCourseId) : NaN;
  const moduleId = rawModuleId ? Number(rawModuleId) : NaN;
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useLocalStorage('tutor_create_quiz_data', {
    course: isNaN(courseId) ? '' : String(courseId),
    module: isNaN(moduleId) ? '' : String(moduleId),
    title: '',
    description: '',
  });

  const [questions, setQuestions] = useLocalStorage<QuizQuestion[]>('tutor_create_quiz_questions', [
    {
      text: '',
      order: 1,
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
    },
  ]);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    if (courseId) {
      setFormData(prev => ({ ...prev, course: courseId, module: '' }));
      loadModules(parseInt(courseId));
    }
  }, [courseId]);

  useEffect(() => {
    if (moduleId) {
      setFormData(prev => ({ ...prev, module: moduleId }));
    }
  }, [moduleId]);

  const loadCourses = async () => {
    try {
      const response = await coursesApi.getCourses();
      setCourses(response.items || []);
    } catch (err) {
      console.error('Failed to load courses:', err);
    }
  };

  const loadModules = async (courseId: number) => {
    try {
      const modulesData = await coursesApi.getModules(courseId);
      setModules(modulesData || []);
    } catch (err) {
      console.error('Failed to load modules:', err);
      setModules([]);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        order: questions.length + 1,
        options: [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, idx) => idx !== index);
    setQuestions(updatedQuestions.map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  const handleQuestionUpdate = (index: number, question: QuizQuestion) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = question;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.course) {
      setError('Please select a course');
      setLoading(false);
      return;
    }

    if (!formData.module) {
      setError('Please select a module');
      setLoading(false);
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a quiz title');
      setLoading(false);
      return;
    }

    if (questions.some(q => !q.text.trim())) {
      setError('All questions must have text');
      setLoading(false);
      return;
    }

    if (questions.some(q => !q.options || q.options.length < 2)) {
      setError('All questions must have at least 2 options');
      setLoading(false);
      return;
    }

    if (questions.some(q => !q.options?.some(opt => opt.is_correct))) {
      setError('All questions must have a correct answer marked');
      setLoading(false);
      return;
    }

    try {
      const quizData: CreateQuizData = {
        module: parseInt(formData.module),
        title: formData.title,
        description: formData.description,
        questions: questions.map((q, idx) => ({
          text: q.text,
          order: idx + 1,
          options: q.options || [],
        })),
      };

      await quizzesApi.createQuiz(quizData);
      setSuccess('Quiz created successfully!');
      setFormData({ course: '', module: '', title: '', description: '' });
      setQuestions([{ text: '', order: 1, options: [{ text: '', is_correct: false }, { text: '', is_correct: false }] }]);

      setTimeout(() => {
        navigate(`/tutor/courses/${formData.course}/modules/${formData.module}`);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create quiz:', err);
      setError(getErrorMessage(err) || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-2 text-sm text-text-muted hover:text-text transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Create New Quiz</h1>
          <p className="text-sm text-text-muted mt-1">
            Add questions and set correct answers for your students
          </p>
        </div>

        {error && (
          <div className="backdrop-blur-md bg-red-50/80 border border-red-200/50 rounded-xl p-4 text-sm text-red-700 shadow-sm flex items-start gap-2 mb-6">
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="backdrop-blur-md bg-emerald-50/80 border border-emerald-200/50 rounded-xl p-4 text-sm text-emerald-700 shadow-sm flex items-start gap-2 mb-6">
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold tracking-tight text-text mb-4">Quiz Details</h2>
            <div className="mb-4 rounded-xl border border-emerald-200/50 bg-emerald-500/10 p-4 text-xs text-emerald-800">
              <strong>Note:</strong> Quizzes are attached to modules. Students receive 5 randomized questions per attempt and need 60% (3/5) to unlock the next module.
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Course *
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value, module: '' })}
                  disabled={!!courseId}
                  className="w-full px-3 py-2 text-sm border border-border/50 bg-surface/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 disabled:opacity-50"
                >
                  <option value="">Select a course...</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Module *
                </label>
                <select
                  value={formData.module}
                  onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border/50 bg-surface/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 disabled:opacity-50"
                  disabled={!formData.course}
                >
                  <option value="">Select a module...</option>
                  {modules.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Quiz Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Module 1 Assessment"
                  className="border-border/50 bg-surface/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this quiz..."
                  rows={3}
                  className="border-border/50 bg-surface/50"
                />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-6 shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold tracking-tight text-text">
                Questions ({questions.length})
              </h2>
              <Button
                type="button"
                onClick={handleAddQuestion}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, index) => (
              <QuestionBuilder
                key={index}
                question={question}
                index={index}
                onUpdate={handleQuestionUpdate}
                onRemove={handleRemoveQuestion}
                canRemove={questions.length > 1}
              />
            ))}
          </div>

          <div className="backdrop-blur-md bg-surface/80 border border-border/50 rounded-xl p-4 shadow-sm flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? 'Creating...' : 'Create Quiz'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TutorCreateQuizPage;
