import apiClient from './client';

// ============ Interfaces ============

export interface ContributorReferralCode {
  referral_code: string;
  created_at: string;
  expires_at: string | null;
  is_permanent: boolean;
}

export interface BulkCreateUser {
  full_name: string;
  email: string;
  role: string;
  age?: number;
  lga?: string;
  country?: string;
}

export interface BulkCreateRequest {
  users: BulkCreateUser[];
}

export interface SkippedUser {
  email: string;
  reason: string;
}

export interface CreatedUser {
  id: number;
  username: string;
  email: string;
}

export interface BulkCreateResponse {
  message: string;
  created_users: CreatedUser[];
  skipped_users: SkippedUser[];
}

export interface ContributorUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  date_joined: string;
  referred_by: string;
}

export interface CreatedUsersResponse {
  total_count: number;
  created_users: ContributorUser[];
}

// ============ API Functions ============

/**
 * Get current referral code status
 * GET /api/contributor/check-code/
 */
export const getReferralCode = async (): Promise<ContributorReferralCode> => {
  const response = await apiClient.get('/api/contributor/check-code/');
  return response.data;
};

/**
 * Bulk create users with contributor referral code
 * POST /api/contributor/bulk-create/
 */
export const bulkCreateUsers = async (data: BulkCreateRequest): Promise<BulkCreateResponse> => {
  const response = await apiClient.post('/api/contributor/bulk-create/', data);
  return response.data;
};

/**
 * Get list of all users created using contributor's referral code
 * GET /api/contributor/my-users/
 */
export const getCreatedUsers = async (): Promise<CreatedUsersResponse> => {
  const response = await apiClient.get('/api/contributor/my-users/');
  const data = response.data;
  return Array.isArray(data) ? { total_count: data.length, created_users: data } : data;
};

// ============ Consolidated API Object ============

export const contributorApi = {
  getReferralCode,
  bulkCreateUsers,
  getCreatedUsers,
};

export default contributorApi;