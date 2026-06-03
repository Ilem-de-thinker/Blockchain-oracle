
import apiClient from './client';
import { UserRole } from '../../types';

// Backend role mapping
export const mapFrontendRoleToBackend = (role: UserRole): string => {
  const mapping: Record<UserRole, string> = {
    [UserRole.LEARNER]: 'USER',
    [UserRole.INSTRUCTOR]: 'TUTOR',
    [UserRole.INFLUENCER]: 'INFLUENCER',
    [UserRole.CONTRIBUTOR]: 'CONTRIBUTOR',
    [UserRole.ENTERPRISE]: 'USER', // Enterprise users register as USER initially
    [UserRole.ADMIN]: 'USER', // Admin must be created by super admin
    [UserRole.SUPER_ADMIN]: 'USER', // Super admin must be created by super admin
  };
  return mapping[role] || 'USER';
};

export const mapBackendRoleToFrontend = (role: string): UserRole => {
  const mapping: Record<string, UserRole> = {
    'USER': UserRole.LEARNER,
    'TUTOR': UserRole.INSTRUCTOR,
    'INFLUENCER': UserRole.INFLUENCER,
    'CONTRIBUTOR': UserRole.CONTRIBUTOR,
    'ADMIN': UserRole.ADMIN,
    'SUPER_ADMIN': UserRole.SUPER_ADMIN,
  };
  return mapping[role] || UserRole.LEARNER;
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  refresh: string;
  access: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone_number: string | null;
    address: string | null;
    role: string;
    country?: string | null;
    user_category?: string | null;
    onboarding_fee?: boolean | number | null;
    bio: string | null;
    profile_picture: string | null;
    active_referral_code?: string | null;
  };
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone_number?: string;
  address?: string;
  lga?: string;
  state?: string;
  country?: string;
  user_category?: 'nysc' | 'user' | string;
  onboarding_fee?: number | boolean;
  role: string;
  referred_by?: string;
}

interface RegisterResponse {
  username: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  address: string | null;
  role: string;
}

interface ForgotPasswordResponse {
  message: string;
  uid: string;
  token: string;
}

interface ResetPasswordResponse {
  message: string;
}

interface GoogleLoginResponse {
  refresh: string;
  access: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone_number: string | null;
    address: string | null;
    role: string;
    country?: string | null;
    user_category?: string | null;
    onboarding_fee?: boolean | number | null;
    bio: string | null;
    profile_picture: string | null;
    active_referral_code?: string | null;
  };
  created: boolean;
}

export interface ProfileData {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone_number: string | null;
  address: string | null;
  lga: string | null;
  state: string | null;
  country: string | null;
  role: string;
  user_category: string | null;
  onboarding_fee: boolean | number | null;
  bio: string | null;
  profile_picture: string | null;
  referred_by: string | null;
  active_referral_code: string | null;
  is_verified?: boolean;
  kyc_status?: 'pending' | 'verified' | 'rejected' | 'unverified' | string;
}

export interface ProfileUpdateData {
  email?: string;
  full_name?: string;
  phone_number?: string;
  address?: string;
  lga?: string;
  state?: string;
  country?: string;
  bio?: string;
  profile_picture?: string;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
}

export interface MessageResponse {
  message: string;
}

export interface UpdateProfilePictureResponse extends MessageResponse {
  profile_picture: string;
}

export interface AdminCreateUserData {
  email: string;
  password: string;
  full_name: string;
  role: string;
  phone_number?: string;
  address?: string;
  lga?: string;
  state?: string;
  referred_by?: string;
}

interface RefreshTokenResponse {
  access: string;
}

export const authApi = {
  // Demo users for testing
  demoUsers: [
    {
      email: 'user@test.com',
      password: 'password',
      role: 'USER',
      full_name: 'Test User',
    },
    {
      email: 'tutor@test.com',
      password: 'password',
      role: 'TUTOR',
      full_name: 'Test Tutor',
    },
    {
      email: 'admin@test.com',
      password: 'password',
      role: 'ADMIN',
      full_name: 'Test Admin',
    },
    {
      email: 'superadmin@test.com',
      password: 'password',
      role: 'SUPER_ADMIN',
      full_name: 'Test Super Admin',
    },
    {
      email: 'influencer@test.com',
      password: 'password',
      role: 'INFLUENCER',
      full_name: 'Test Influencer',
    },
    {
      email: 'contributor@test.com',
      password: 'password',
      role: 'CONTRIBUTOR',
      full_name: 'Test Contributor',
    },
  ],

  // Demo login - bypasses API for testing
  demoLogin: async (role: string): Promise<LoginResponse> => {
    const demoUser = authApi.demoUsers.find(u => u.role === role);
    if (!demoUser) {
      throw new Error('Invalid role');
    }

    // Create a fake JWT token
    const createFakeToken = (user: typeof demoUser) => {
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({
        exp: Date.now() + 24 * 60 * 60 * 1000,
        iat: Date.now(),
        user_id: 1,
        email: user.email,
        role: user.role,
      }));
      const signature = 'fake-signature';
      return `${header}.${payload}.${signature}`;
    };

    const response: LoginResponse = {
      refresh: createFakeToken(demoUser),
      access: createFakeToken(demoUser),
      user: {
        id: 1,
        username: demoUser.full_name.toLowerCase().replace(' ', '_'),
        email: demoUser.email,
        full_name: demoUser.full_name,
        phone_number: null,
        address: null,
        role: demoUser.role,
        bio: null,
        profile_picture: null,
      },
    };

    // Store tokens
    localStorage.setItem('access_token', response.access);
    localStorage.setItem('refresh_token', response.refresh);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  },

  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/login/', credentials);

    // Store tokens
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }

    return response.data;
  },

  googleLogin: async (idToken: string): Promise<GoogleLoginResponse> => {
    const response = await apiClient.post('/api/auth/google/', { id_token: idToken });

    // Store tokens
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
    }

    return response.data;
  },

  register: async (data: RegisterData): Promise<RegisterResponse> => {
    try {
      const response = await apiClient.post('/api/auth/register/', data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post('/api/auth/forgot-password/', { email });
    return response.data;
  },

  resetPassword: async (uidb64: string, token: string, newPassword: string): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post('/api/auth/reset-password/', {
      uidb64,
      token,
      new_password: newPassword
    });
    return response.data;
  },

  refreshToken: async (refresh: string): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post('/api/auth/token/refresh/', { refresh });
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
    }
    return response.data;
  },

  getProfile: async (): Promise<ProfileData> => {
    const response = await apiClient.get('/api/auth/profile/');
    return response.data;
  },

  getUserProfile: async (userId: number): Promise<ProfileData> => {
    const response = await apiClient.get(`/api/auth/users/${userId}/profile/`);
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateData): Promise<ProfileData> => {
    const response = await apiClient.patch('/api/auth/profile/', data);
    return response.data;
  },

  updateProfilePicture: async (file: File): Promise<ProfileData> => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    const response = await apiClient.put<UpdateProfilePictureResponse>('/api/auth/update-profile-picture/', formData);
    const profile = await authApi.getProfile();
    return {
      ...profile,
      profile_picture: response.data.profile_picture || profile.profile_picture,
    };
  },

  uploadProfilePicture: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('profile_picture', file);
    const response = await apiClient.put<UpdateProfilePictureResponse>('/api/auth/update-profile-picture/', formData);
    return response.data.profile_picture;
  },

  changePassword: async (data: ChangePasswordData): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/api/auth/change-password/', data);
    return response.data;
  },

  deleteAccount: async (): Promise<MessageResponse> => {
    const response = await apiClient.delete<MessageResponse>('/api/auth/delete-account/');
    return response.data;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await apiClient.post('/api/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear tokens and user
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  verifyKYC: async (data: KYCData): Promise<MessageResponse> => {
    const response = await apiClient.post<MessageResponse>('/api/auth/nin-kyc/', { nin: data.id_number });
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('access_token');
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  storeUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearStoredUser: () => {
    localStorage.removeItem('user');
  },

  adminCreateUser: async (data: AdminCreateUserData): Promise<{
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: string;
  }> => {
    const response = await apiClient.post('/api/auth/admin/create-user/', data);
    return response.data;
  },

  // Check if token is expired or about to expire (within 5 minutes)
  isTokenExpiring: (): boolean => {
    const token = localStorage.getItem('access_token');
    if (!token) return true;

    try {
      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      // Token is expiring if less than 5 minutes remaining
      return expiry - now < fiveMinutes;
    } catch {
      return true;
    }
  },

  // Get token expiry time
  getTokenExpiry: (): number | null => {
    const token = localStorage.getItem('access_token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000;
    } catch {
      return null;
    }
  },
};

export default authApi;
