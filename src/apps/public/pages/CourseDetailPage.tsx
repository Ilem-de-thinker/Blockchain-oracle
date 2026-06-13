import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { coursesApi, Course } from '@/src/api/courses';
import { reviewsApi, Review } from '@/src/api/reviews';
import { authApi } from '@/src/api/auth';

const levelColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
};

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = authApi.isAuthenticated();

  useEffect(() => {
    if (!id) return;
    const fetchCourse = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await coursesApi.getCourse(parseInt(id));
        if (!data) {
          setError('Course not found');
          return;
        }
        setCourse(data);

        reviewsApi.getCourseReviews(parseInt(id)).then(setReviews).catch(() => {});
      } catch (err) {
        setError('Failed to load course details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    navigate(`/dashboard/course/${id}`);
  };

  const formatCurrency = (amount?: string | number) => {
    if (!amount) return 'FREE';
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (value === 0) return 'FREE';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-500 text-sm mb-6">{error || 'The course you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg transition-all"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const totalModules = course.modules?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <button onClick={() => navigate('/courses')} className="hover:text-emerald-600 transition-colors">Courses</button>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{course.title}</li>
          </ol>
        </nav>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100"
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Image */}
            <div className="h-full min-h-[320px] relative">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                  <span className="text-white/30 text-8xl font-black">{course.title.charAt(0)}</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="bg-emerald-100 text-emerald-700 text-sm px-4 py-1 rounded-full font-medium">
                    Online Course
                  </span>
                  {course.level && (
                    <span className={`${levelColors[course.level] || 'bg-gray-100 text-gray-700'} text-sm px-4 py-1 rounded-full`}>
                      {course.level}
                    </span>
                  )}
                  {course.is_verified && (
                    <span className="bg-blue-100 text-blue-700 text-sm px-4 py-1 rounded-full">
                      Verified
                    </span>
                  )}
                </div>

                {/* Title & Instructor */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900">
                    {course.title}
                  </h1>
                  {course.tutor && (
                    <p className="text-gray-500 mt-3 text-lg">
                      By {course.tutor.full_name}
                    </p>
                  )}
                  {course.average_rating !== undefined && course.average_rating > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(course.average_rating || 0) ? 'text-amber-400' : 'text-gray-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {course.average_rating.toFixed(1)}
                      </span>
                      {reviews.length > 0 && (
                        <span className="text-sm text-gray-400">
                          ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-7">{course.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Modules</p>
                    <h3 className="font-bold text-gray-900 mt-1 text-lg">{totalModules}</h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Level</p>
                    <h3 className="font-bold text-gray-900 mt-1 text-lg">{course.level || 'N/A'}</h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Category</p>
                    <h3 className="font-bold text-gray-900 mt-1 text-lg">{course.category || 'General'}</h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Price</p>
                    <h3 className="font-bold text-gray-900 mt-1 text-lg">{formatCurrency(course.total_amount)}</h3>
                  </div>
                </div>

                {/* Modules / Curriculum */}
                {course.modules && course.modules.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
                    <div className="space-y-2">
                      {course.modules.map((module, index) => (
                        <div
                          key={module.id}
                          className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100"
                        >
                          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{module.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-4 mt-10 flex-wrap pt-6 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Course Price</p>
                  <h2 className="text-3xl font-bold text-gray-900">{formatCurrency(course.total_amount)}</h2>
                  {parseFloat(course.total_amount || '0') > 0 && course.allow_installments && (
                    <p className="text-xs text-emerald-600 font-semibold mt-1">Installments available</p>
                  )}
                </div>
                <button
                  onClick={handleEnroll}
                  className="bg-emerald-600 hover:bg-emerald-700 transition-all text-white px-8 py-4 rounded-2xl font-bold shadow-md hover:shadow-lg"
                >
                  {isAuthenticated ? 'Enroll Now' : 'Login to Enroll'}
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-10 bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 p-8 md:p-10"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(review.user.full_name || review.user.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-gray-900">{review.user.full_name || review.user.username}</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 mt-2 text-sm leading-relaxed">{review.comment}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
};

export default CourseDetailPage;
