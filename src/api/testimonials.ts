import apiClient from './client';

export interface Testimonial {
  id: number;
  user?: {
    id: number;
    full_name: string;
    email: string;
    profile_picture?: string;
    role: string;
  };
  name?: string;
  role?: string;
  image?: string;
  quote: string;
  is_public: boolean;
  status: 'pending' | 'approved' | 'rejected';
  order: number;
  created_at: string;
  updated_at: string;
}

export interface TestimonialListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Testimonial[];
}

export interface SubmitTestimonialData {
  quote: string;
  make_public: boolean;
}

const testimonialsApi = {
  /**
   * Submit a new testimonial (logged-in user)
   */
  submitTestimonial: async (data: SubmitTestimonialData): Promise<Testimonial> => {
    const response = await apiClient.post('/api/core/testimonial/submit/', data);
    return response.data;
  },

  /**
   * Get my testimonials (logged-in user)
   */
  getMyTestimonials: async (): Promise<TestimonialListResponse> => {
    const response = await apiClient.get('/api/core/testimonial/my/');
    return response.data;
  },

  /**
   * Update my testimonial (owner only)
   */
  updateMyTestimonial: async (id: number, data: Partial<SubmitTestimonialData>): Promise<Testimonial> => {
    const response = await apiClient.patch(`/api/core/testimonial/${id}/`, data);
    return response.data;
  },

  /**
   * Delete my testimonial (owner only)
   */
  deleteMyTestimonial: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/core/testimonial/${id}/`);
  },

  /**
   * Get public testimonials for landing page (no auth required)
   */
  getPublicTestimonials: async (limit?: number): Promise<Testimonial[]> => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    const response = await apiClient.get(`/api/core/testimonial/public/?${params.toString()}`);
    return response.data;
  },

  /**
   * Admin: Get all testimonials
   */
  getAdminTestimonials: async (
    page?: number,
    pageSize?: number,
    status?: string,
    isPublic?: boolean
  ): Promise<TestimonialListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (status) params.append('status', status);
    if (isPublic !== undefined) params.append('is_public', isPublic.toString());

    const response = await apiClient.get(`/api/core/testimonial/admin/?${params.toString()}`);
    return response.data;
  },

  /**
   * Admin: Update testimonial status (approve/reject)
   */
  updateTestimonialStatus: async (id: number, status: 'approved' | 'rejected'): Promise<Testimonial> => {
    const response = await apiClient.patch(`/api/core/testimonial/${id}/status/`, { status });
    return response.data;
  },

  /**
   * Admin: Update testimonial
   */
  updateTestimonial: async (id: number, data: Partial<Testimonial>): Promise<Testimonial> => {
    const response = await apiClient.patch(`/api/core/testimonial/${id}/`, data);
    return response.data;
  },

  /**
   * Admin: Delete testimonial
   */
  deleteTestimonial: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/core/testimonial/${id}/`);
  },

  /**
   * Admin: Reorder testimonials
   */
  reorderTestimonials: async (order: number[]): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/core/testimonial/reorder/', { order });
    return response.data;
  },
};

export default testimonialsApi;
