import apiClient from './client';

// ============ Interfaces ============

export interface ActiveCode {
  code: string;
  created_at: string;
  expires_at: string;
  days_remaining: number;
  is_expired?: boolean;
}

export interface ReferralCodeHistory {
  code: string;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
}

export interface ReferralCodeResponse {
  active_code: ActiveCode;
  all_codes: ReferralCodeHistory[];
}

export interface RefreshCodeResponse {
  referral_code: string;
  created_at: string;
  expires_at: string;
}

export interface CodeAnalyticsItem {
  code: string;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
  referee_count: number;
}

export interface CodeAnalyticsResponse {
  analytics: CodeAnalyticsItem[];
}

export interface RefereeMonthlyData {
  month: string;
  count: number;
}

export interface RefereeSummary {
  total_referees: number;
  referees_by_month: RefereeMonthlyData[];
}

export interface Referee {
  id: number;
  username: string;
  email: string;
  full_name: string;
  date_joined: string;
  referred_by: string;
}

export interface RefereeListResponse {
  referees: Referee[];
}

export interface PayoutSummary {
  total_accumulated: number;
  pending: number;
  received: number;
}

export interface RefereePurchase {
  referee_id: number;
  full_name: string;
  email: string;
  course_name: string;
  amount_paid: number;
  payment_date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface DashboardSummary {
  summary: {
    total_referees: number;
    total_purchases: number;
    total_earnings: number;
    pending_payout: number;
    received_payout: number;
    conversion_rate?: number;
    repeat_purchase_rate?: number;
    avg_earnings_per_referee?: number;
    active_codes_count?: number;
    expired_codes_count?: number;
  };
  active_code: {
    code: string;
    days_remaining: number;
    referee_count: number;
    code_conversion_rate?: number;
  };
  monthly_stats: Array<{
    month: string;
    new_referees: number;
    purchases: number;
    earnings: number;
    conversion_rate?: number;
  }>;
}

export interface EnhancedDashboardSummaryResponse {
  summary: {
    total_referees: number;
    total_purchases: number;
    total_earnings: number;
    pending_payout: number;
    received_payout: number;
    conversion_rate: number;
    repeat_purchase_rate: number;
    avg_earnings_per_referee: number;
    active_codes_count: number;
    expired_codes_count: number;
  };
  active_code: {
    code: string;
    days_remaining: number;
    referee_count: number;
    code_conversion_rate: number;
  };
  monthly_stats: Array<{
    month: string;
    new_referees: number;
    purchases: number;
    earnings: number;
    conversion_rate: number;
  }>;
}

export interface MonthlyEarningsTrendResponse {
  monthly_earnings: Array<{
    month: string;
    amount: number;
    referees: number;
    purchases: number;
  }>;
  total_earnings: number;
  average_monthly: number;
}

export interface CodeEarningsItem {
  code: string;
  earnings: number;
  referee_count: number;
  purchases: number;
  conversion_rate: number;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
}

export interface CodeEarningsResponse {
  by_code: CodeEarningsItem[];
  total_earnings: number;
}

export interface CampaignComparisonItem {
  code: string;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
  days_remaining: number;
  metrics: {
    referees: number;
    purchases: number;
    earnings: number;
    conversion_rate: number;
    repeat_purchases: number;
  };
  monthly_breakdown: Array<{
    month: string;
    referees: number;
    purchases: number;
    earnings: number;
  }>;
}

export interface CampaignComparisonResponse {
  campaigns: CampaignComparisonItem[];
  summary: {
    total_campaigns: number;
    active_campaigns: number;
    total_referees: number;
    total_purchases: number;
    total_earnings: number;
    overall_conversion_rate: number;
  };
}

export interface PerformanceAnalyticsResponse {
  overview: {
    total_referees: number;
    total_purchases: number;
    total_earnings: number;
    conversion_rate: number;
    pending_payout: number;
    received_payout: number;
  };
  conversion_funnel: Array<{
    stage: string;
    count: number;
  }>;
  referee_activity: {
    active: number;
    inactive: number;
    by_code?: Array<{
      code: string;
      active: number;
      inactive: number;
    }>;
  };
  code_trends: Array<{
    code: string;
    monthly: Array<{
      month: string;
      referees: number;
      purchases?: number;
      earnings?: number;
    }>;
  }>;
  monthly_earnings: Array<{
    month: string;
    amount: number;
    referees: number;
    purchases: number;
  }>;
  best_performing_code: string;
  best_month: {
    month: string;
    earnings: number;
  };
}

export interface CodePurchase {
  code: string;
  referee: {
    id: number;
    full_name: string;
    email: string;
  };
  course: {
    id: number;
    name: string;
    price: number;
  };
  commission: number;
  payment_date: string;
  status: string;
}

export interface ConversionFunnelResponse {
  funnel: Array<{
    stage: string;
    count: number;
  }>;
}

export interface RefereeActivityResponse {
  active: number;
  inactive: number;
  by_code?: Array<{
    code: string;
    active: number;
    inactive: number;
  }>;
}

export interface CodeTrendItem {
  code: string;
  monthly: Array<{
    month: string;
    referees: number;
  }>;
}

export interface CodeTrendsResponse {
  codes: CodeTrendItem[];
}

// ============ API Functions ============

/**
 * Get current referral code status and history
 * V7 Endpoint: GET /api/influencer/check-code/
 */
export const getReferralCode = async (): Promise<ReferralCodeResponse> => {
  const response = await apiClient.get('/api/influencer/check-code/');
  return response.data;
};

/**
 * Generate a new referral code (expires previous one)
 * V7 Endpoint: POST /api/influencer/refresh-code/
 */
export const refreshReferralCode = async (): Promise<RefreshCodeResponse> => {
  const response = await apiClient.post('/api/influencer/refresh-code/');
  return response.data;
};

/**
 * Get code analytics with referee counts per code
 * V7 Endpoint: GET /api/influencer/code-analytics/
 */
export const getCodeAnalytics = async (): Promise<CodeAnalyticsResponse> => {
  const response = await apiClient.get('/api/influencer/code-analytics/');
  return response.data;
};

/**
 * Get referee summary with monthly breakdown
 * V7 Endpoint: GET /api/influencer/referee-summary/
 */
export const getRefereeSummary = async (): Promise<RefereeSummary> => {
  const response = await apiClient.get('/api/influencer/referee-summary/');
  return response.data;
};

/**
 * Get detailed list of all referred users
 * V7 Endpoint: GET /api/influencer/referees/
 */
export const getRefereeList = async (): Promise<RefereeListResponse> => {
  const response = await apiClient.get('/api/influencer/referees/');
  const data = response.data;
  return Array.isArray(data) ? { referees: data } : data;
};

/**
 * Get payout summary (accumulated, pending, received)
 * V7 Endpoint: GET /api/influencer/payouts/
 */
export const getPayoutSummary = async (): Promise<PayoutSummary> => {
  const response = await apiClient.get('/api/influencer/payouts/');
  return response.data;
};

/**
 * Get consolidated dashboard metrics
 * V7 Endpoint: GET /api/influencer/dashboard/
 */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await apiClient.get('/api/influencer/dashboard/');
  return response.data;
};

/**
 * Get enhanced dashboard summary
 * Endpoint: GET /api/influencer/charts/dashboard-summary/
 */
export const getEnhancedDashboardSummary = async (): Promise<EnhancedDashboardSummaryResponse> => {
  const response = await apiClient.get('/api/influencer/charts/dashboard-summary/');
  return response.data;
};

/**
 * Get referee purchases (courses purchased by referred users)
 * V7 Endpoint: GET /api/influencer/referee-purchases/
 */
export const getRefereePurchases = async (): Promise<{ results: RefereePurchase[] }> => {
  const response = await apiClient.get('/api/influencer/referee-purchases/');
  const data = response.data;
  return Array.isArray(data) ? { results: data } : data;
};

/**
 * Track purchases attributed to specific referral codes
 * V7 Endpoint: GET /api/influencer/code-purchases/
 */
export const getCodePurchases = async (): Promise<{ results: CodePurchase[] }> => {
  const response = await apiClient.get('/api/influencer/code-purchases/');
  const data = response.data;
  return Array.isArray(data) ? { results: data } : data;
};

/**
 * Get conversion funnel data (referees -> purchases -> repeat purchases)
 * V7 Endpoint: GET /api/influencer/conversion-funnel/
 */
export const getConversionFunnel = async (): Promise<ConversionFunnelResponse> => {
  const response = await apiClient.get('/api/influencer/conversion-funnel/');
  return response.data;
};

/**
 * Get referee activity status (active vs inactive)
 * V7 Endpoint: GET /api/influencer/referee-activity/
 */
export const getRefereeActivity = async (): Promise<RefereeActivityResponse> => {
  const response = await apiClient.get('/api/influencer/referee-activity/');
  return response.data;
};

/**
 * Get code performance trends (monthly signups per code)
 * V7 Endpoint: GET /api/influencer/code-trends/
 */
export const getCodeTrends = async (): Promise<CodeTrendsResponse> => {
  const response = await apiClient.get('/api/influencer/code-trends/');
  return response.data;
};

/**
 * Get monthly earnings trend
 * Endpoint: GET /api/influencer/charts/earnings-trend/
 */
export const getEarningsTrend = async (date_from?: string, date_to?: string): Promise<MonthlyEarningsTrendResponse> => {
  const params = new URLSearchParams();
  params.append('aggregate_by', 'month');
  if (date_from) params.append('date_from', date_from);
  if (date_to) params.append('date_to', date_to);
  const response = await apiClient.get(`/api/influencer/charts/earnings-trend/?${params.toString()}`);
  return response.data;
};

/**
 * Get earnings by referral code
 * Endpoint: GET /api/influencer/charts/code-earnings/
 */
export const getCodeEarnings = async (date_from?: string, date_to?: string): Promise<CodeEarningsResponse> => {
  const params = new URLSearchParams();
  if (date_from) params.append('date_from', date_from);
  if (date_to) params.append('date_to', date_to);
  const response = await apiClient.get(`/api/influencer/charts/code-earnings/?${params.toString()}`);
  return response.data;
};

/**
 * Get campaign comparison data (single API call for My Campaigns page)
 * Endpoint: GET /api/influencer/charts/campaign-comparison/
 */
export const getCampaignComparison = async (date_from?: string, date_to?: string, include_monthly: boolean = true): Promise<CampaignComparisonResponse> => {
  const params = new URLSearchParams();
  if (date_from) params.append('date_from', date_from);
  if (date_to) params.append('date_to', date_to);
  params.append('include_monthly', include_monthly.toString());
  const response = await apiClient.get(`/api/influencer/charts/campaign-comparison/?${params.toString()}`);
  return response.data;
};

/**
 * Get combined performance analytics (reduces multiple API calls to one)
 * Endpoint: GET /api/influencer/charts/performance-analytics/
 */
export const getPerformanceAnalytics = async (): Promise<PerformanceAnalyticsResponse> => {
  const response = await apiClient.get('/api/influencer/charts/performance-analytics/');
  return response.data;
};

// ============ Consolidated API Object ============

export const influencerApi = {
  getReferralCode,
  refreshReferralCode,
  getCodeAnalytics,
  getRefereeSummary,
  getRefereeList,
  getPayoutSummary,
  getDashboardSummary,
  getEnhancedDashboardSummary,
  getRefereePurchases,
  getCodePurchases,
  getConversionFunnel,
  getRefereeActivity,
  getCodeTrends,
  getEarningsTrend,
  getCodeEarnings,
  getCampaignComparison,
  getPerformanceAnalytics,
};

export default influencerApi;
