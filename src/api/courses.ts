import apiClient from './client';

export interface ModuleQuizSummary {
  id: number;
  title: string;
  description?: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail_url?: string;
  registration_fee?: string;
  tuition_fee?: string;
  certificate_fee?: string;
  total_amount?: string;
  allow_installments?: boolean;
  certificate_template?: string;
  price?: string;
  category?: string;
  level?: string;
  is_published: boolean;
  is_verified: boolean;
  verified_by?: {
    id: number;
    username: string;
    full_name: string;
    role: string;
  };
  tutor: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
    tutor_rating?: number;
    student_rating?: number;
    phone_number?: string;
    address?: string;
    lga?: string;
    state?: string;
    country?: string;
    bio?: string;
    profile_picture?: string;
    active_referral_code?: string;
    referred_by?: string;
    user_category?: string;
    onboarding_fee?: boolean;
  };
  modules: CourseModule[];
  average_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CourseMaterial {
  id: number;
  course: number;
  module?: number;
  type: 'video' | 'pdf' | 'text';
  title: string;
  order: number;
  url?: string;
  duration?: number;
  pages?: number;
  content?: string;
  is_completed?: boolean;
  created_at: string;
}

export interface CourseModule {
  id: number;
  course: number;
  title: string;
  description?: string;
  order: number;
  quiz_id?: number | null;
  quizzes?: ModuleQuizSummary[];
  is_published: boolean;
  materials?: CourseMaterial[];
  is_completed?: boolean;
  completion_stats?: {
    total: number;
    completed: number;
    percentage: number;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateModuleData {
  title: string;
  description?: string;
  order?: number;
  is_published?: boolean;
}

export interface UpdateModuleData {
  title?: string;
  description?: string;
  order?: number;
  is_published?: boolean;
}

export interface CreateCourseData {
  title: string;
  description: string;
  thumbnail_url?: string;
  registration_fee?: number;
  tuition_fee?: number;
  certificate_fee?: number;
  allow_installments?: boolean;
  certificate_template?: File | null;
  price?: number;
  category?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  is_published?: boolean;
  tutor_id?: number;
}

export interface CreateMaterialData {
  type: 'video' | 'pdf' | 'text';
  title: string;
  order?: number;
  url?: string;
  duration?: number;
  pages?: number;
  content?: string;
}

export interface CourseEnrollment {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone_number?: string;
    address?: string;
    lga?: string;
    state?: string;
    country?: string;
    role: string;
    bio?: string;
    profile_picture?: string;
  };
  enrolled_at: string;
  progress_percentage?: number;
  is_course_completed?: boolean;
  courseId?: number;
  courseTitle?: string;
}

export interface EnrollmentListItem {
  id: number;
  user?: number;
  tutor?: {
    id: number;
    name: string;
    email: string;
    profile_picture?: string;
  };
  course?: number | Course;
  course_title?: string;
  course_price?: number;
  course_thumbnail?: string;
  installment_plan?: string;
  amount_paid?: string;
  balance_remaining?: string;
  total_amount?: string;
  is_completed?: boolean;
  is_course_completed?: boolean;
  enrolled_at: string;
  progress?: number;
  progress_percentage?: number;
  completed?: boolean;
  completed_at?: string;
}

export interface EnrollmentDetail {
  id: number;
  user: number;
  course: Course;
  installment_plan: 'FULL' | '20' | '40' | '60' | null;
  amount_paid: string;
  balance_remaining: string;
  total_amount: string;
  payment_progress: number;
  is_completed: boolean;
  enrolled_at: string;
  completed_at?: string;
  payments?: Array<{
    id: number;
    amount: string;
    status: string;
    paid_at: string;
    reference: string;
  }>;
}

export type ModuleAccessLevel = 0 | 20 | 40 | 60 | 100;

export interface ModuleAccess {
  module_id: number;
  is_locked: boolean;
  access_level: ModuleAccessLevel;
  unlock_message?: string;
}

export interface EnrollmentListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EnrollmentListItem[];
}

export interface GetEnrollmentsParams {
  isCompleted?: boolean;
  courseCategory?: string;
  courseLevel?: string;
  search?: string;
  ordering?: string;
  userId?: number;
}

export interface CourseListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  items: Course[];
}

export interface EnrollmentPaymentResponse {
  message: string;
  authorization_url: string;
  reference: string;
}

export type EnrollResponse = EnrollmentListItem | EnrollmentPaymentResponse | Record<string, unknown>;

const normalizeCourseMaterial = (raw: any, fallbackCourseId?: number, fallbackModuleId?: number): CourseMaterial => ({
  id: raw?.id,
  course: raw?.course ?? fallbackCourseId ?? 0,
  module: raw?.module ?? fallbackModuleId,
  type: raw?.type ?? 'text',
  title: raw?.title ?? '',
  order: Number(raw?.order ?? 0),
  url: raw?.url,
  duration: typeof raw?.duration === 'number' ? raw.duration : raw?.duration ? Number(raw.duration) : undefined,
  pages: typeof raw?.pages === 'number' ? raw.pages : raw?.pages ? Number(raw.pages) : undefined,
  content: raw?.content,
  is_completed: typeof raw?.is_completed === 'boolean' ? raw.is_completed : undefined,
  created_at: raw?.created_at ?? '',
});

const normalizeCourseModule = (raw: any, fallbackCourseId?: number): CourseModule => ({
  id: raw?.id,
  course: raw?.course ?? fallbackCourseId ?? 0,
  title: raw?.title ?? '',
  description: raw?.description ?? '',
  order: Number(raw?.order ?? 0),
  quiz_id: raw?.quiz_id ?? raw?.quizzes?.[0]?.id ?? null,
  quizzes: Array.isArray(raw?.quizzes)
    ? raw.quizzes.map((quiz: any) => ({
        id: quiz?.id,
        title: quiz?.title ?? '',
        description: quiz?.description ?? '',
      }))
    : undefined,
  is_published: typeof raw?.is_published === 'boolean' ? raw.is_published : true,
  materials: Array.isArray(raw?.materials)
    ? raw.materials.map((material: any) => normalizeCourseMaterial(material, raw?.course ?? fallbackCourseId, raw?.id))
    : undefined,
  is_completed: typeof raw?.is_completed === 'boolean' ? raw.is_completed : undefined,
  completion_stats: raw?.completion_stats
    ? {
        total: Number(raw.completion_stats.total ?? 0),
        completed: Number(raw.completion_stats.completed ?? 0),
        percentage: Number(raw.completion_stats.percentage ?? 0),
      }
    : undefined,
  created_at: raw?.created_at ?? '',
  updated_at: raw?.updated_at ?? '',
});

const normalizeCourse = (raw: any): Course => ({
  ...raw,
  id: raw?.id,
  title: raw?.title ?? '',
  description: raw?.description ?? '',
  is_published: !!raw?.is_published,
  is_verified: !!raw?.is_verified,
  modules: Array.isArray(raw?.modules)
    ? raw.modules.map((module: any) => normalizeCourseModule(module, raw?.id))
    : [],
  certificate_template: raw?.certificate_template,
  created_at: raw?.created_at ?? '',
  updated_at: raw?.updated_at ?? '',
});

const toCoursePayload = (data: Partial<CreateCourseData> | FormData): Partial<CreateCourseData> | FormData => {
  if (data instanceof FormData) return data;

  const hasFile = data.certificate_template instanceof File;
  if (!hasFile) return data;

  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'boolean') {
      formData.append(key, value ? 'true' : 'false');
      return;
    }
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
};

const normalizeListResponse = <T>(data: unknown): { count: number; next: string | null; previous: string | null; items: T[] } => {
  if (Array.isArray(data)) {
    return { count: data.length, next: null, previous: null, items: data as T[] };
  }

  if (data && typeof data === 'object') {
    const obj = data as { results?: unknown; items?: unknown; count?: number; next?: string | null; previous?: string | null };
    const maybeResults = obj.results ?? obj.items;
    if (Array.isArray(maybeResults)) {
      return {
        count: obj.count ?? maybeResults.length,
        next: obj.next ?? null,
        previous: obj.previous ?? null,
        items: maybeResults as T[]
      };
    }
  }

  return { count: 0, next: null, previous: null, items: [] };
};

const normalizeEnrollmentListResponse = (data: unknown): EnrollmentListResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data as EnrollmentListItem[],
    };
  }

  if (data && typeof data === 'object') {
    const obj = data as Partial<EnrollmentListResponse> & { items?: EnrollmentListItem[] };
    const results = Array.isArray(obj.results) ? obj.results : Array.isArray(obj.items) ? obj.items : [];

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

export const coursesApi = {
  /**
   * Get all courses with optional filtering
   */
  getCourses: async (
    page?: number,
    pageSize?: number,
    category?: string,
    level?: string,
    search?: string,
    ordering?: string,
    price?: string | number,
    isPublished?: boolean
  ): Promise<CourseListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (category) params.append('category', category);
    if (level) params.append('level', level);
    if (search) params.append('search', search);
    if (ordering) params.append('ordering', ordering);
    if (price !== undefined && price !== null && price !== '') params.append('price', String(price));
    if (typeof isPublished === 'boolean') params.append('is_published', String(isPublished));
    
    const response = await apiClient.get(`/api/courses/?${params.toString()}`);
    const normalized = normalizeListResponse<any>(response.data);
    return {
      ...normalized,
      items: normalized.items.map(normalizeCourse),
    };
  },

  /**
   * Get course progress for the authenticated user
   * GET /api/courses/{course_id}/progress/
   */
  getCourseProgress: async (courseId: number): Promise<{
    course_title: string;
    progress_percentage: number;
    is_course_completed: boolean;
    total_materials: number;
    completed_materials: number;
    modules: Array<{
      module_id: number;
      title: string;
      total_materials: number;
      completed_materials: number;
      is_completed: boolean;
    }>;
  } | null> => {
    try {
      const response = await apiClient.get(`/api/courses/${courseId}/progress/`);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Get single course by ID
   */
  getCourse: async (id: number): Promise<Course> => {
    const response = await apiClient.get(`/api/courses/${id}/`);
    return normalizeCourse(response.data);
  },

  /**
   * Create a new course
   */
  createCourse: async (data: CreateCourseData): Promise<Course> => {
    const payload = toCoursePayload(data);
    const response = await apiClient.post('/api/courses/', payload);
    return normalizeCourse(response.data);
  },

  /**
   * Update a course
   */
  updateCourse: async (id: number, data: Partial<CreateCourseData>): Promise<Course> => {
    const payload = toCoursePayload(data);
    const response = await apiClient.patch(`/api/courses/${id}/`, payload);
    return normalizeCourse(response.data);
  },

  /**
   * Delete a course
   */
  deleteCourse: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/courses/${id}/`);
  },

  /**
   * Toggle course verification (Admin/Super Admin only)
   * PUT /api/courses/{id}/toggle-verification/
   */
  toggleVerification: async (id: number): Promise<{ detail: string }> => {
    const response = await apiClient.put(`/api/courses/${id}/toggle-verification/`);
    return response.data;
  },

  /**
   * Toggle course publish status (Tutor/Admin only)
   * PUT /api/courses/{id}/toggle-publish/
   */
  togglePublish: async (id: number): Promise<{ detail: string }> => {
    const response = await apiClient.put(`/api/courses/${id}/toggle-publish/`);
    return response.data;
  },

  /**
   * Get course materials (fetches via modules and flattens)
   * V5 API: Uses /api/courses/{course_id}/modules/ and extracts materials
   */
  getMaterials: async (courseId: number): Promise<CourseMaterial[]> => {
    const response = await apiClient.get(`/api/courses/${courseId}/modules/`);
    const modules = (Array.isArray(response.data)
      ? response.data
      : response.data.results || response.data.items || []).map((module: any) =>
        normalizeCourseModule(module, courseId)
      ) as CourseModule[];
    const materials: CourseMaterial[] = [];
    modules.forEach((module) => {
      if (module.materials) {
        module.materials.forEach((material) => {
          materials.push({ ...material, course: courseId, module: module.id });
        });
      }
    });
    return materials.sort((a, b) => a.order - b.order);
  },

  /**
   * Legacy (V4-only): Create course material directly under a course.
   *
   * V5/V6 removed this endpoint in favor of module-based materials.
   * Use `createModuleMaterial(moduleId, data)` instead.
   */
  createMaterial: async (): Promise<never> => {
    throw new Error('Creating course materials without selecting a module is not supported.');
  },

  /**
   * Update course material
   */
  updateMaterial: async (materialId: number, data: Partial<CreateMaterialData>): Promise<CourseMaterial> => {
    const response = await apiClient.patch(`/api/materials/${materialId}/`, data);
    return normalizeCourseMaterial(response.data);
  },

  /**
   * Delete course material
   */
  deleteMaterial: async (materialId: number): Promise<void> => {
    await apiClient.delete(`/api/materials/${materialId}/`);
  },

  /**
   * Get course modules
   */
  getModules: async (courseId: number): Promise<CourseModule[]> => {
    const response = await apiClient.get(`/api/courses/${courseId}/modules/`);
    if (Array.isArray(response.data)) {
      return response.data.map((module) => normalizeCourseModule(module, courseId)) as CourseModule[];
    }
    return (response.data.results || response.data.items || []).map((module: any) =>
      normalizeCourseModule(module, courseId)
    ) as CourseModule[];
  },

  /**
   * Create a module for a course
   */
  createModule: async (courseId: number, data: CreateModuleData): Promise<CourseModule> => {
    const response = await apiClient.post(`/api/courses/${courseId}/modules/`, data);
    return normalizeCourseModule(response.data, courseId);
  },

  /**
   * Update a module for a course
   * PUT/PATCH /api/courses/{course_id}/modules/{id}/
   */
  updateModule: async (courseId: number, moduleId: number, data: UpdateModuleData): Promise<CourseModule> => {
    const response = await apiClient.patch(`/api/courses/${courseId}/modules/${moduleId}/`, data);
    return normalizeCourseModule(response.data, courseId);
  },

  /**
   * Delete a module from a course
   * DELETE /api/courses/{course_id}/modules/{id}/
   */
  deleteModule: async (courseId: number, moduleId: number): Promise<void> => {
    await apiClient.delete(`/api/courses/${courseId}/modules/${moduleId}/`);
  },

  /**
   * Get materials for a specific module
   * Uses backend endpoint: /api/modules/{module_id}/materials/
   * Fallback: /api/courses/{course_id}/modules/{module_id}/materials/
   */
  getModuleMaterials: async (moduleId: number, courseId?: number): Promise<CourseMaterial[]> => {
    try {
      const response = await apiClient.get(`/api/modules/${moduleId}/materials/`);
      return Array.isArray(response.data)
        ? response.data.map((material) => normalizeCourseMaterial(material))
        : [];
    } catch (error: any) {
      if (courseId && error?.response?.status === 404) {
        const response = await apiClient.get(`/api/courses/${courseId}/modules/${moduleId}/materials/`);
        return Array.isArray(response.data)
          ? response.data.map((material) => normalizeCourseMaterial(material))
          : [];
      }
      throw error;
    }
  },

  /**
   * Create material for a specific module
   * Uses backend endpoint: /api/modules/{module_id}/materials/
   * Fallback: /api/courses/{course_id}/modules/{module_id}/materials/
   */
  createModuleMaterial: async (moduleId: number, data: CreateMaterialData, courseId?: number): Promise<CourseMaterial> => {
    try {
      const response = await apiClient.post(`/api/modules/${moduleId}/materials/`, data);
      return normalizeCourseMaterial(response.data);
    } catch (error: any) {
      if (courseId && error?.response?.status === 404) {
        const response = await apiClient.post(`/api/courses/${courseId}/modules/${moduleId}/materials/`, data);
        return normalizeCourseMaterial(response.data);
      }
      throw error;
    }
  },

  /**
   * Get enrollments for a specific user (Admin only)
   * GET /api/admin/users/{user_id}/enrollments/
   */
  getUserEnrollments: async (userId: number, page?: number, pageSize?: number): Promise<EnrollmentListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    
    const response = await apiClient.get(`/api/admin/users/${userId}/enrollments/?${params.toString()}`);
    return normalizeEnrollmentListResponse(response.data);
  },

  /**
   * Get user's enrollments
   */
  getEnrollments: async (
    page?: number,
    pageSize?: number,
    filters?: GetEnrollmentsParams
  ): Promise<EnrollmentListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (typeof filters?.isCompleted === 'boolean') params.append('is_completed', String(filters.isCompleted));
    if (filters?.courseCategory) params.append('course__category', filters.courseCategory);
    if (filters?.courseLevel) params.append('course__level', filters.courseLevel);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.userId) params.append('user_id', filters.userId.toString());
    
    const response = await apiClient.get(`/api/enrollments/?${params.toString()}`);
    return normalizeEnrollmentListResponse(response.data);
  },

  /**
   * Get single enrollment by ID
   */
  getEnrollment: async (id: number): Promise<any | null> => {
    try {
      const response = await apiClient.get(`/api/enrollments/${id}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Enroll in a course
   * POST /api/enroll/
   */
  enroll: async (
    courseId: number,
    installmentPlan?: 'FULL' | '20' | '40' | '60',
    referralCode?: string,
    callbackUrl?: string
  ): Promise<EnrollResponse> => {
    const data: { course: number; installment_plan?: string; referred_by?: string; callback_url?: string } = {
      course: courseId,
    };
    if (installmentPlan) {
      data.installment_plan = installmentPlan;
    }
    if (referralCode) {
      data.referred_by = referralCode;
    }
    if (callbackUrl) {
      data.callback_url = callbackUrl;
    }
    const response = await apiClient.post('/api/enroll/', data);
    return response.data;
  },

  /**
   * Pay remaining balance for an enrollment
   * POST /api/enrollments/{enrollment_id}/pay-balance/
   */
  payBalance: async (
    enrollmentId: number,
    callbackUrl?: string
  ): Promise<{
    message: string;
    authorization_url: string;
    reference: string;
    balance: number;
  }> => {
    const data: { callback_url?: string } = {};
    if (callbackUrl) {
      data.callback_url = callbackUrl;
    }
    const response = await apiClient.post(`/api/enrollments/${enrollmentId}/pay-balance/`, data);
    return response.data;
  },

  /**
   * Get course enrollments (Tutor/Admin view their students)
   * GET /api/courses/{course_id}/enrollments/
   */
  getCourseEnrollments: async (
    courseId: number,
    page?: number,
    pageSize?: number
  ): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: CourseEnrollment[];
  }> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    const response = await apiClient.get(`/api/courses/${courseId}/enrollments/?${params.toString()}`);
    const data = response.data;
    
    if (Array.isArray(data)) {
      return {
        count: data.length,
        next: null,
        previous: null,
        results: data as CourseEnrollment[],
      };
    }
    
    if (data && typeof data === 'object') {
      const results = (data.results || data.items || []) as CourseEnrollment[];
      return {
        count: data.count ?? results.length,
        next: data.next ?? null,
        previous: data.previous ?? null,
        results,
      };
    }
    
    return {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  },

  /**
   * Get module access status based on payment progress
   */
  getModuleAccessStatus: async (enrollmentId: number): Promise<{
    enrollment_id: number;
    total_paid_percentage: number;
    total_amount: number;
    amount_paid: number;
    balance_remaining: number;
    modules: Array<{
      id: number;
      title: string;
      is_locked: boolean;
      access_threshold: number;
    }>;
  }> => {
    const response = await apiClient.get(`/api/enrollments/${enrollmentId}/module-access/`);
    return response.data;
  },

  /**
   * Get payment breakdown for enrollment
   */
  getPaymentBreakdown: async (enrollmentId: number): Promise<{
    enrollment_id: number;
    registration_fee: number;
    tuition_fee: number;
    certificate_fee: number;
    total_amount: number;
    amount_paid: number;
    balance_remaining: number;
    payments: Array<{
      id: number;
      amount: number;
      due_date?: string;
      paid_at?: string;
      status: 'PAID' | 'PENDING' | 'OVERDUE';
    }>;
  }> => {
    const response = await apiClient.get(`/api/enrollments/${enrollmentId}/payment-breakdown/`);
    return response.data;
  },
};

export default coursesApi;
