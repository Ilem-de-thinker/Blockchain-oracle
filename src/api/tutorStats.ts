import api from './client';

export interface TutorStats {
  total_courses: number;
  total_enrollments: number;
  total_revenue: number;
  completion_rate: number;
}

export const tutorStatsApi = {
  getDashboardStats: async (): Promise<TutorStats> => {
    const { data } = await api.get('/api/analytics/dashboard/');
    return data;
  },
  
  getCourseAnalytics: async (courseId: number) => {
    const { data } = await api.get(`/api/analytics/course/${courseId}/`);
    return data;
  }
};
