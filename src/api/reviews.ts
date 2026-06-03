import apiClient from './client';

// ============ Interfaces ============

export interface ReviewUser {
  id: number;
  username: string;
  full_name: string;
  profile_picture?: string;
}

export interface ReviewCourse {
  id: number;
  title: string;
  thumbnail_url?: string;
}

export interface Review {
  id: number;
  user: ReviewUser;
  course: number | ReviewCourse;
  rating: number;
  title?: string;
  comment?: string;
  content?: string;
  helpful_count?: number;
  verified_purchase?: boolean;
  status?: 'published' | 'hidden' | 'flagged';
  reports_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface ReviewListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  average_rating: number;
  rating_distribution: {
    [key: string]: number;
  };
  results: Review[];
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  content?: string;
  comment?: string;
}

export interface AdminReviewListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

const normalizeReview = (raw: any): Review => ({
  id: raw?.id,
  user: {
    id: raw?.user?.id,
    username: raw?.user?.username || '',
    full_name: raw?.user?.full_name || raw?.user?.username || 'Unknown User',
    profile_picture: raw?.user?.profile_picture,
  },
  course:
    typeof raw?.course === 'object' && raw?.course !== null
      ? {
          id: raw.course.id,
          title: raw.course.title || `Course #${raw.course.id}`,
          thumbnail_url: raw.course.thumbnail_url,
        }
      : raw?.course,
  rating: Number(raw?.rating || 0),
  title: raw?.title,
  comment: raw?.comment,
  content: raw?.content,
  helpful_count: raw?.helpful_count,
  verified_purchase: raw?.verified_purchase,
  status: raw?.status,
  reports_count: raw?.reports_count,
  created_at: raw?.created_at || '',
  updated_at: raw?.updated_at,
});

const normalizeAdminReviewListResponse = (data: unknown): AdminReviewListResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data.map(normalizeReview),
    };
  }

  if (data && typeof data === 'object') {
    const obj = data as Partial<AdminReviewListResponse> & { items?: any[] };
    const resultsArray = obj.results ?? obj.items ?? [];
    const results = Array.isArray(resultsArray) ? resultsArray.map(normalizeReview) : [];
    return {
      count: typeof obj.count === 'number' ? obj.count : results.length,
      next: obj.next ?? null,
      previous: obj.previous ?? null,
      results,
    };
  }

  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
};

// ============ API Functions ============

export const reviewsApi = {
  /**
   * Get all reviews for a specific course
   * GET /api/courses/{course_id}/reviews/
   */
  getCourseReviews: async (courseId: number, params?: {
    page?: number;
    page_size?: number;
    rating?: number;
    sort?: 'newest' | 'oldest' | 'highest' | 'lowest';
  }): Promise<Review[]> => {
    const response = await apiClient.get(`/api/courses/${courseId}/reviews/`, { params });
    const data = response.data;
    
    if (Array.isArray(data)) {
      return data.map(normalizeReview);
    }
    
    if (data && typeof data === 'object' && Array.isArray(data.results)) {
      return data.results.map(normalizeReview);
    }
    
    return [];
  },

  /**
   * Submit a review for a course
   * POST /api/courses/reviews/
   */
  createReview: async (courseId: number, data: CreateReviewRequest): Promise<Review & { message: string }> => {
    const response = await apiClient.post(`/api/courses/reviews/`, {
      course: courseId,
      ...data
    });
    return response.data;
  },

  /**
   * Get details of a specific review
   * GET /api/reviews/{id}/
   */
  getReviewDetails: async (id: number): Promise<Review> => {
    const response = await apiClient.get(`/api/reviews/${id}/`);
    return response.data;
  },

  /**
   * Update an existing review
   * PATCH /api/reviews/{id}/
   */
  updateReview: async (id: number, data: Partial<CreateReviewRequest>): Promise<Review> => {
    const response = await apiClient.patch(`/api/reviews/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a review
   * DELETE /api/reviews/{id}/
   */
  deleteReview: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/reviews/${id}/`);
  },

  /**
   * Mark a review as helpful
   * POST /api/reviews/{id}/helpful/
   */
  markHelpful: async (id: number): Promise<{
    id: number;
    helpful_count: number;
    user_marked_helpful: true;
    message: string;
  }> => {
    const response = await apiClient.post(`/api/reviews/${id}/helpful/`);
    return response.data;
  },

  /**
   * Remove helpful mark from a review
   * DELETE /api/reviews/{id}/helpful/
   */
  removeHelpful: async (id: number): Promise<{
    id: number;
    helpful_count: number;
    user_marked_helpful: false;
    message: string;
  }> => {
    const response = await apiClient.delete(`/api/reviews/${id}/helpful/`);
    return response.data;
  },

  /**
   * Report a review for inappropriate content
   * POST /api/reviews/{id}/report/
   */
  reportReview: async (id: number, reason: string): Promise<{
    report_id: number;
    review_id: number;
    status: string;
    message: string;
  }> => {
    const response = await apiClient.post(`/api/reviews/${id}/report/`, { reason });
    return response.data;
  },

  // ============ Admin Endpoints ============

  /**
   * Get all reviews across all courses (Admin view)
   * GET /api/admin/reviews/
   */
  adminGetAllReviews: async (params?: {
    page?: number;
    rating?: number;
    course?: number;
    user?: number;
    ordering?: string;
  }): Promise<AdminReviewListResponse> => {
    try {
      const response = await apiClient.get('/api/admin/reviews/', { params });
      return normalizeAdminReviewListResponse(response.data);
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.response?.status === 403) {
        try {
          const response = await apiClient.get('/api/courses/admin/reviews/', { params });
          return normalizeAdminReviewListResponse(response.data);
        } catch {
          // fallback to per-course endpoint if a specific course was requested
          if (params?.course) {
            try {
              const response = await apiClient.get(`/api/courses/${params.course}/reviews/`);
              const items = Array.isArray(response.data) ? response.data : response.data?.results || [];
              const results = items.map(normalizeReview);
              return { count: results.length, next: null, previous: null, results };
            } catch {
              // preserve original error
            }
          }
        }
      }
      throw error;
    }
  },

  /**
   * Change the visibility status of a review (Admin view)
   * PATCH /api/admin/reviews/{id}/status/
   */
  adminUpdateReviewStatus: async (id: number, status: 'published' | 'hidden' | 'flagged', reason?: string): Promise<{
    id: number;
    status: string;
    updated_at: string;
    message: string;
  }> => {
    const response = await apiClient.patch(`/api/admin/reviews/${id}/status/`, { status, reason });
    return response.data;
  },
};

export default reviewsApi;
