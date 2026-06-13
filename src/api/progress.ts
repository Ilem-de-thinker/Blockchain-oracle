import apiClient from './client';
import coursesApi from './courses';

export interface LearningProgress {
  total_courses_enrolled: number;
  courses_completed: number;
  courses_in_progress: number;
  total_materials: number;
  materials_completed: number;
  overall_completion_percentage: number;
  total_learning_time_minutes: number;
  courses: CourseProgress[];
}

export interface CourseProgress {
  course_id: number;
  course_title: string;
  thumbnail_url?: string;
  enrollment_date: string;
  completion_percentage: number;
  materials_completed: number;
  total_materials: number;
  status: 'completed' | 'in_progress' | 'not_started';
  last_accessed: string;
  certificate_earned: boolean;
}

export interface CourseProgressDetail extends CourseProgress {
  time_spent_minutes: number;
  materials: MaterialProgress[];
  progress_percentage?: number;
  is_course_completed?: boolean;
  total_materials?: number;
  completed_materials?: number;
  modules?: Array<{
    module_id: number;
    title: string;
    total_materials: number;
    completed_materials: number;
    is_completed: boolean;
  }>;
}

export interface MaterialProgress {
  id: number;
  title: string;
  type: 'video' | 'pdf' | 'text';
  order: number;
  completed: boolean;
  completed_at?: string;
  duration?: number;
}

export interface LearningActivity {
  period_days: number;
  total_activity_minutes: number;
  daily_activity: DailyActivity[];
  recent_activity: ActivityItem[];
}

export interface DailyActivity {
  date: string;
  minutes: number;
  materials_completed: number;
}

export interface ActivityItem {
  id: number;
  activity_type: 'material_completed' | 'course_enrolled' | 'quiz_completed' | 'certificate_earned';
  course_title: string;
  material_title?: string;
  timestamp: string;
}

// Admin Analytics Types
export interface DashboardAnalytics {
  total_users: number;
  total_courses: number;
  total_enrollments: number;
  total_revenue: string;
  active_students: number;
  completion_rate: number;
  recent_enrollments: RecentEnrollment[];
  top_courses: TopCourse[];
}

export interface RecentEnrollment {
  user: {
    id: number;
    username: string;
    full_name: string;
  };
  course: {
    id: number;
    title: string;
  };
  enrolled_at: string;
}

export interface TopCourse {
  id: number;
  title: string;
  enrollments: number;
  revenue: string;
}

export interface CourseAnalytics {
  course_id: number;
  course_title: string;
  total_enrollments: number;
  active_students: number;
  completed_students: number;
  completion_rate: number;
  average_progress: number;
  total_revenue: string;
  rating_average: number;
  total_reviews: number;
  enrollment_trend: TrendData[];
  material_completion_rates: MaterialCompletionRate[];
}

export interface TrendData {
  date: string;
  enrollments?: number;
  revenue?: string;
}

export interface MaterialCompletionRate {
  material_id: number;
  title: string;
  completion_rate: number;
}

export interface UserAnalytics {
  total_users: number;
  new_users_this_month: number;
  active_users_this_month: number;
  users_by_role: Record<string, number>;
  registration_trend: { month: string; count: number }[];
  top_students: { id: number; full_name: string; email: string; courses_enrolled: number; completion_rate: number }[];
}

export interface RevenueAnalytics {
  total_revenue: string;
  revenue_this_month: string;
  average_order_value: string;
  total_transactions: number;
  revenue_trend: { month: string; revenue: string }[];
  revenue_by_source: { source: string; revenue: string; count: number }[];
  top_earning_courses: { id: number; title: string; revenue: string; enrollments: number }[];
}

export const progressApi = {
  /**
   * Get user's overall learning progress
   * Falls back to calculating from enrollments if endpoint 404s
   */
  getProgress: async (): Promise<LearningProgress> => {
    try {
      const response = await apiClient.get('/api/progress/');
      const data = response.data;
      
      // Backend returns: { overall_completion, courses: [{course_id, title, completion, status}], status_counts }
      const courses: CourseProgress[] = (data.courses || []).map((c: any) => ({
        course_id: c.course_id || 0,
        course_title: c.title || c.course_title || `Course ${c.course_id || ''}`,
        thumbnail_url: c.thumbnail_url || undefined,
        enrollment_date: '', // Not returned by /api/progress/
        completion_percentage: typeof c.completion === 'number' ? c.completion : (c.completion_percentage || 0),
        materials_completed: c.materials_completed || 0,
        total_materials: c.total_materials || 0,
        status: (c.status || 'Not Started').toLowerCase().replace(' ', '_'),
        last_accessed: '',
        certificate_earned: Boolean(c.certificate_earned || (typeof c.completion === 'number' && c.completion === 100))
      }));
      
      return {
        total_courses_enrolled: courses.length,
        courses_completed: courses.filter(c => c.status === 'completed').length,
        courses_in_progress: courses.filter(c => c.status === 'in_progress').length,
        total_materials: data.total_materials ?? 0,
        materials_completed: data.materials_completed ?? 0,
        overall_completion_percentage: data.overall_completion ?? data.overall_completion_percentage ?? 0,
        total_learning_time_minutes: data.total_learning_time_minutes ?? 0,
        courses
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        try {
          // Fallback: Calculate from enrollments
          const enrollments = await coursesApi.getEnrollments();
          const items = enrollments.results || [];
          
          const courses: CourseProgress[] = items.map(e => ({
            course_id: typeof e.course === 'number' ? e.course : e.course?.id || 0,
            course_title: e.course_title || e.course?.title || 'Course',
            thumbnail_url: e.course_thumbnail || e.course?.thumbnail_url,
            enrollment_date: e.enrolled_at || '',
            completion_percentage: e.progress_percentage ?? e.progress ?? 0,
            materials_completed: 0,
            total_materials: 0,
            status: e.is_course_completed ? 'completed' : 'in_progress',
            last_accessed: e.enrolled_at || '',
            certificate_earned: Boolean(e.is_completed && e.is_course_completed)
          }));
          
          const totalEnrolled = items.length;
          const completedCount = items.filter(e => e.is_course_completed).length;
          const inProgressCount = items.filter(e => !e.is_course_completed).length;
          const avgProgress = totalEnrolled > 0 
            ? Math.round(items.reduce((sum, e) => sum + (e.progress_percentage ?? e.progress ?? 0), 0) / totalEnrolled)
            : 0;
          
          return {
            total_courses_enrolled: totalEnrolled,
            courses_completed: completedCount,
            courses_in_progress: inProgressCount,
            total_materials: 0,
            materials_completed: 0,
            overall_completion_percentage: avgProgress,
            total_learning_time_minutes: totalEnrolled * 60,
            courses
          };
        } catch (fallbackError) {
          console.error('Failed to load progress (fallback failed):', fallbackError);
        }
      }
      console.error('Failed to load progress:', error?.response?.data || error?.message);
      return {
        total_courses_enrolled: 0,
        courses_completed: 0,
        courses_in_progress: 0,
        total_materials: 0,
        materials_completed: 0,
        overall_completion_percentage: 0,
        total_learning_time_minutes: 0,
        courses: []
      };
    }
  },

  /**
   * Get progress for a specific course
   */
  getCourseProgress: async (courseId: number): Promise<CourseProgressDetail> => {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}/progress/`);
      const data = response.data ?? {};
      return {
        course_id: courseId,
        course_title: data.course_title ?? '',
        thumbnail_url: undefined,
        enrollment_date: '',
        completion_percentage: Number(data.progress_percentage ?? 0),
        materials_completed: Number(data.completed_materials ?? 0),
        total_materials: Number(data.total_materials ?? 0),
        status: data.is_course_completed ? 'completed' : Number(data.progress_percentage ?? 0) > 0 ? 'in_progress' : 'not_started',
        last_accessed: '',
        certificate_earned: Boolean(data.is_course_completed),
        time_spent_minutes: 0,
        materials: [],
        progress_percentage: Number(data.progress_percentage ?? 0),
        is_course_completed: Boolean(data.is_course_completed),
        completed_materials: Number(data.completed_materials ?? 0),
        modules: Array.isArray(data.modules)
          ? data.modules.map((module: any) => ({
              module_id: Number(module?.module_id ?? 0),
              title: module?.title ?? '',
              total_materials: Number(module?.total_materials ?? 0),
              completed_materials: Number(module?.completed_materials ?? 0),
              is_completed: Boolean(module?.is_completed),
            }))
          : [],
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        const enrollments = await coursesApi.getEnrollments();
        const e = enrollments.results.find(en => (typeof en.course === 'number' ? en.course : en.course?.id) === courseId);
        
        if (!e) throw new Error('Enrollment not found');

        return {
          course_id: courseId,
          course_title: e.course_title || 'Unknown',
          thumbnail_url: e.course_thumbnail,
          enrollment_date: e.enrolled_at,
          completion_percentage: e.progress_percentage ?? e.progress ?? 0,
          materials_completed: 0,
          total_materials: 0,
          status: e.is_course_completed ? 'completed' : 'in_progress',
          last_accessed: e.enrolled_at,
          certificate_earned: Boolean(e.is_completed && e.is_course_completed),
          time_spent_minutes: 0,
          materials: [],
          progress_percentage: e.progress_percentage ?? e.progress ?? 0,
          is_course_completed: Boolean(e.is_course_completed),
          completed_materials: 0,
          modules: [],
        };
      }
      throw error;
    }
  },

  /**
   * Mark a material as complete
   */
  markMaterialComplete: async (materialId: number, completed: boolean = true): Promise<{
    detail: string;
    module_completed: boolean;
    course_completed: boolean;
  }> => {
    const response = await apiClient.post(`/api/courses/materials/${materialId}/complete/`, completed ? undefined : { completed });
    return response.data;
  },

  /**
   * Get learning activity history
   */
  getActivity: async (days: number = 7): Promise<LearningActivity> => {
    try {
      const response = await apiClient.get(`/api/progress/activity/?days=${days}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to load activity:', error?.response?.data || error?.message);
      return {
        period_days: days,
        total_activity_minutes: 0,
        daily_activity: [],
        recent_activity: []
      };
    }
  },

  /**
   * Get dashboard analytics (Admin/Tutor only)
   */
  getDashboardAnalytics: async (): Promise<DashboardAnalytics> => {
    try {
      const response = await apiClient.get('/api/analytics/dashboard/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to load dashboard analytics:', error?.response?.data || error?.message);
      return {
        total_users: 0,
        total_courses: 0,
        total_enrollments: 0,
        total_revenue: '0',
        active_students: 0,
        completion_rate: 0,
        recent_enrollments: [],
        top_courses: []
      };
    }
  },

  /**
   * Get analytics for a specific course (Admin/Tutor only)
   */
  getCourseAnalytics: async (courseId: number): Promise<CourseAnalytics> => {
    try {
      const response = await apiClient.get(`/api/analytics/course/${courseId}/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to load course analytics:', error?.response?.data || error?.message);
      return {
        course_id: courseId,
        course_title: '',
        total_enrollments: 0,
        active_students: 0,
        completed_students: 0,
        completion_rate: 0,
        average_progress: 0,
        total_revenue: '0',
        rating_average: 0,
        total_reviews: 0,
        enrollment_trend: [],
        material_completion_rates: []
      };
    }
  },

  getUserAnalytics: async (): Promise<UserAnalytics> => {
    try {
      const response = await apiClient.get('/api/analytics/users/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to load user analytics:', error?.response?.data || error?.message);
      return {
        total_users: 0,
        new_users_this_month: 0,
        active_users_this_month: 0,
        users_by_role: {},
        registration_trend: [],
        top_students: []
      };
    }
  },

  getRevenueAnalytics: async (): Promise<RevenueAnalytics> => {
    try {
      const response = await apiClient.get('/api/analytics/revenue/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to load revenue analytics:', error?.response?.data || error?.message);
      return {
        total_revenue: '0',
        revenue_this_month: '0',
        average_order_value: '0',
        total_transactions: 0,
        revenue_trend: [],
        revenue_by_source: [],
        top_earning_courses: []
      };
    }
  },
};

export default progressApi;
