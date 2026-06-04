import apiClient from './client';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  state?: string;
  country?: string;
  role: 'USER' | 'TUTOR' | 'ADMIN' | 'SUPER_ADMIN';
  bio?: string;
  profile_picture?: string;
  is_active: boolean;
  is_verified?: boolean;
  can_verify?: boolean;
  verification_status?: string;
  date_joined: string;
  last_login?: string;
  courses_enrolled?: number;
  courses_created?: number;
  active_referral_code?: string;
  tutor_rating?: number | null;
  student_rating?: number | null;
  user_category?: 'user' | 'nysc' | string | null;
}

export interface UserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

const normalizeUser = (raw: any): User => {
  const statusValue = typeof raw?.status === 'string' ? raw.status.toLowerCase() : '';
  const inferredActive =
    typeof raw?.is_active === 'boolean'
      ? raw.is_active
      : typeof raw?.is_suspended === 'boolean'
        ? !raw.is_suspended
        : statusValue
          ? !(statusValue === 'suspended' || statusValue === 'inactive' || statusValue === 'disabled')
          : true;

  return {
    id: Number(raw?.id ?? 0),
    username: raw?.username ?? '',
    email: raw?.email ?? '',
    full_name: raw?.full_name ?? raw?.username ?? '',
    phone_number: raw?.phone_number,
    address: raw?.address,
    state: raw?.state,
    country: raw?.country,
    role: (raw?.role ?? 'USER') as User['role'],
    bio: raw?.bio,
    profile_picture: raw?.profile_picture,
    is_active: inferredActive,
    is_verified: typeof raw?.is_verified === 'boolean' ? raw.is_verified : undefined,
    can_verify: typeof raw?.can_verify === 'boolean' ? raw.can_verify : undefined,
    kyc_status: raw?.kyc_status,
    date_joined: raw?.date_joined ?? '',
    last_login: raw?.last_login,
    courses_enrolled: typeof raw?.courses_enrolled === 'number' ? raw.courses_enrolled : undefined,
    courses_created: typeof raw?.courses_created === 'number' ? raw.courses_created : undefined,
    active_referral_code: raw?.active_referral_code,
    tutor_rating: raw?.tutor_rating ?? null,
    student_rating: raw?.student_rating ?? null,
    user_category: raw?.user_category ?? null,
  };
};

const normalizeUserListResponse = (data: unknown): UserListResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data.map((u) => normalizeUser(u)),
    };
  }

  if (data && typeof data === 'object') {
    const obj = data as Partial<UserListResponse> & { items?: User[] };
    const resultsArray = obj.results ?? obj.items ?? [];
    return {
      count: typeof obj.count === 'number' ? obj.count : Array.isArray(resultsArray) ? resultsArray.length : 0,
      next: obj.next ?? null,
      previous: obj.previous ?? null,
      results: Array.isArray(resultsArray) ? resultsArray.map((u) => normalizeUser(u)) : [],
    };
  }

  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
};

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  role?: 'USER' | 'TUTOR' | 'ADMIN' | 'SUPER_ADMIN';
  is_active?: boolean;
  can_verify?: boolean;
  user_category?: 'user' | 'nysc';
}

export interface CreateUserData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  phone_number?: string;
  address?: string;
  bio?: string;
  role: 'USER' | 'TUTOR' | 'ADMIN' | 'SUPER_ADMIN' | 'INFLUENCER' | 'CONTRIBUTOR';
  is_active?: boolean;
  country?: string;
}

export interface UserStats {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  users_by_role: {
    USER: number;
    TUTOR: number;
    ADMIN: number;
    SUPER_ADMIN: number;
    INFLUENCER: number;
    CONTRIBUTOR: number;
  };
}

export interface UserRating {
  id: number;
  username: string;
  full_name: string;
  email?: string;
  role?: string;
  tutor_rating?: number | null;
  student_rating?: number | null;
  date_joined?: string;
}

export interface UserRatingProfile extends UserRating {
  role: string;
}

export interface UserRatingListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserRating[];
}

const emptyUserStats: UserStats = {
  total_users: 0,
  active_users: 0,
  new_users_this_month: 0,
  users_by_role: {
    USER: 0,
    TUTOR: 0,
    ADMIN: 0,
    SUPER_ADMIN: 0,
    INFLUENCER: 0,
    CONTRIBUTOR: 0,
  },
};

export interface AppSetting {
  key: string;
  value: string | any;
  description?: string;
}

const normalizeUserRatingListResponse = (data: unknown): UserRatingListResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data as UserRating[],
    };
  }

  if (data && typeof data === 'object') {
    const obj = data as Partial<UserRatingListResponse> & { items?: UserRating[] };
    const resultsArray = obj.results ?? obj.items ?? [];
    return {
      count: typeof obj.count === 'number' ? obj.count : Array.isArray(resultsArray) ? resultsArray.length : 0,
      next: obj.next ?? null,
      previous: obj.previous ?? null,
      results: Array.isArray(resultsArray) ? resultsArray : [],
    };
  }

  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
};

const normalizeUserRating = (data: any): UserRatingProfile => ({
  id: data?.id,
  username: data?.username || '',
  full_name: data?.full_name || data?.username || '',
  email: data?.email,
  role: data?.role || '',
  tutor_rating: data?.tutor_rating ?? null,
  student_rating: data?.student_rating ?? null,
  date_joined: data?.date_joined,
});

export const usersApi = {
  /**
   * Get all users (Admin only)
   * V7 Endpoint: GET /api/admin/users/
   */
  getUsers: async (
    page?: number,
    role?: string,
    search?: string
  ): Promise<UserListResponse> => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (role) params.append('role', role);
      if (search) params.append('search', search);
      
      const response = await apiClient.get(`/api/admin/users/?${params.toString()}`);
      return normalizeUserListResponse(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { count: 0, next: null, previous: null, results: [] };
      }
      throw error;
    }
  },

  /**
   * Get specialized user lists (V7)
   */
  getTutors: async (page?: number, search?: string): Promise<UserListResponse> => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (search) params.append('search', search);
      const response = await apiClient.get(`/api/admin/tutors/?${params.toString()}`);
      return normalizeUserListResponse(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { count: 0, next: null, previous: null, results: [] };
      }
      throw error;
    }
  },

  getContributors: async (page?: number, search?: string): Promise<UserListResponse> => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (search) params.append('search', search);
      const response = await apiClient.get(`/api/admin/contributors/?${params.toString()}`);
      return normalizeUserListResponse(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { count: 0, next: null, previous: null, results: [] };
      }
      throw error;
    }
  },

  getInfluencers: async (page?: number, search?: string): Promise<UserListResponse> => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (search) params.append('search', search);
      const response = await apiClient.get(`/api/admin/influencers/?${params.toString()}`);
      return normalizeUserListResponse(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { count: 0, next: null, previous: null, results: [] };
      }
      throw error;
    }
  },

  /**
   * Global Settings (V7 Admin)
   */
  getSettings: async (): Promise<AppSetting[]> => {
    const response = await apiClient.get('/api/admin/settings/');
    return response.data;
  },

  createSetting: async (data: AppSetting): Promise<AppSetting> => {
    const response = await apiClient.post('/api/admin/settings/', data);
    return response.data;
  },

  updateSetting: async (key: string, value: string | any, description?: string): Promise<AppSetting> => {
    const response = await apiClient.patch(`/api/admin/settings/${key}/`, { value, description });
    return response.data;
  },

  /**
   * Get specific user by ID
   * Note: Not explicitly documented in V7 detailed summary but commonly used.
   */
  getUser: async (id: number): Promise<User | null> => {
    try {
      const response = await apiClient.get(`/api/admin/users/${id}/`);
      return normalizeUser(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new user (Super admin / admin backend surface)
   */
createUser: async (data: CreateUserData): Promise<User> => {
    const payload: any = {
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      role: data.role,
    };
    if (data.phone_number) payload.phone_number = data.phone_number;
    if (data.address) payload.address = data.address;
    if (data.bio) payload.bio = data.bio;
    if (data.country) payload.country = data.country;
    
    const response = await apiClient.post('/api/auth/admin/create-user/', payload);
    const created = response.data as { username: string; email: string; full_name: string; role: string };
    return {
      id: 0,
      username: created.username,
      email: created.email,
      full_name: created.full_name,
      role: created.role as any,
      is_active: true,
      date_joined: new Date().toISOString(),
    };
  },

  /**
   * Create a new user via auth endpoint (Super Admin only)
   * Uses /api/auth/admin/create-user/ as per backend docs
   */
  createUserViaAuth: async (data: {
    email: string;
    password: string;
    full_name: string;
    role: 'USER' | 'TUTOR' | 'ADMIN' | 'SUPER_ADMIN' | 'INFLUENCER';
  }): Promise<{ username: string; email: string; full_name: string; role: string }> => {
    const response = await apiClient.post('/api/auth/admin/create-user/', data);
    return response.data;
  },

  /**
   * Update user details
   */
  updateUser: async (id: number, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.patch(`/api/admin/users/${id}/`, data);
    return normalizeUser(response.data);
  },

  /**
   * Suspend or activate a user
   */
  toggleUserStatus: async (id: number, isActive: boolean): Promise<User> => {
    const response = await apiClient.patch(`/api/admin/users/${id}/`, { is_active: isActive });
    return normalizeUser(response.data);
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${id}/`);
  },

  getUserRatings: async (
    page?: number,
    search?: string,
    ordering?: string
  ): Promise<UserRatingListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (search) params.append('search', search);
    if (ordering) params.append('ordering', ordering);

    const response = await apiClient.get(`/api/auth/admin/users/ratings/?${params.toString()}`);
    return normalizeUserRatingListResponse(response.data);
  },

  getUserRatingProfile: async (id: number): Promise<UserRatingProfile> => {
    const response = await apiClient.get(`/api/auth/users/${id}/rating/`);
    return normalizeUserRating(response.data);
  },

  /**
   * Toggle a user's can_verify permission (Super Admin only)
   * Uses PATCH /api/admin/users/{id}/ since dedicated toggle endpoint may not exist
   */
  toggleCanVerify: async (id: number, currentCanVerify?: boolean): Promise<User> => {
    const newValue = !currentCanVerify;
    const response = await apiClient.patch(`/api/admin/users/${id}/`, { can_verify: newValue });
    return normalizeUser(response.data);
  },

  /**
   * Get user statistics using lightweight role-scoped queries.
   */
  getUserStats: async (): Promise<UserStats> => {
    try {
      const emptyList: UserListResponse = { count: 0, next: null, previous: null, results: [] };
      const [
        totalUsers,
        activeUsers,
        learners,
        tutors,
        admins,
        superAdmins,
        influencers,
        contributors,
      ] = await Promise.all([
        usersApi.getUsers(1),
        apiClient
          .get('/api/admin/users/?page_size=1&is_active=true')
          .then((response) => normalizeUserListResponse(response.data))
          .catch(() => emptyList),
        usersApi.getUsers(1, 'USER').catch(() => emptyList),
        usersApi.getUsers(1, 'TUTOR').catch(() => emptyList),
        usersApi.getUsers(1, 'ADMIN').catch(() => emptyList),
        usersApi.getUsers(1, 'SUPER_ADMIN').catch(() => emptyList),
        usersApi.getUsers(1, 'INFLUENCER').catch(() => usersApi.getInfluencers(1).catch(() => emptyList)),
        usersApi.getUsers(1, 'CONTRIBUTOR').catch(() => usersApi.getContributors(1).catch(() => emptyList)),
      ]);

      return {
        total_users: totalUsers.count,
        active_users: activeUsers.count,
        new_users_this_month: 0,
        users_by_role: {
          USER: learners.count,
          TUTOR: tutors.count,
          ADMIN: admins.count,
          SUPER_ADMIN: superAdmins.count,
          INFLUENCER: influencers.count,
          CONTRIBUTOR: contributors.count,
        },
      };
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return emptyUserStats;
    }
  },
};

export default usersApi;
