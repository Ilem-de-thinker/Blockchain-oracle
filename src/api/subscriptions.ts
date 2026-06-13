import apiClient from './client';

// ============ Interfaces ============

export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  currency: string;
  interval: 'month' | 'year';
  interval_count: number;
  features: string[];
  popular?: boolean;
  trial_days?: number;
  savings?: string;
  terms?: string;
}

export interface SubscriptionUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

export interface Subscription {
  id: number;
  subscription_number: string;
  user: SubscriptionUser;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  trial_start: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
  payment_method?: {
    type: string;
    last4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
  };
  billing_history?: BillingHistoryItem[];
}

export interface BillingHistoryItem {
  id: number;
  amount: string;
  currency: string;
  status: string;
  paid_at: string;
  invoice_url: string;
}

export interface SubscriptionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subscription[];
}

export interface CreateSubscriptionRequest {
  plan_id: number;
  payment_method: string;
  payment_token: string;
  coupon_code?: string;
}

export interface UpdateSubscriptionRequest {
  plan_id?: number;
  payment_method?: string;
  payment_token?: string;
  cancel_at_period_end?: boolean;
}

export interface SubscriptionAnalytics {
  total_subscriptions: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
  mrr: string;
  arr: string;
  currency: string;
  churn_rate: number;
  subscriptions_by_plan: Array<{
    plan_id: number;
    plan_name: string;
    count: number;
    revenue: string;
  }>;
  growth_trend: Array<{
    month: string;
    new_subscriptions: number;
    cancelled_subscriptions: number;
    revenue: string;
  }>;
}

// ============ API Functions ============

export const subscriptionsApi = {
  /**
   * Get all subscriptions for the authenticated user
   * GET /api/subscriptions/
   */
  getMySubscriptions: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
  }): Promise<SubscriptionListResponse> => {
    const response = await apiClient.get('/api/subscriptions/', { params });
    return response.data;
  },

  /**
   * Get details of a specific subscription
   * GET /api/subscriptions/{id}/
   */
  getSubscriptionDetails: async (id: number): Promise<Subscription> => {
    const response = await apiClient.get(`/api/subscriptions/${id}/`);
    return response.data;
  },

  /**
   * Subscribe to a plan
   * POST /api/subscriptions/
   */
  createSubscription: async (data: CreateSubscriptionRequest): Promise<Subscription & { message: string }> => {
    const response = await apiClient.post('/api/subscriptions/', data);
    return response.data;
  },

  /**
   * Update subscription details
   * PATCH /api/subscriptions/{id}/
   */
  updateSubscription: async (id: number, data: UpdateSubscriptionRequest): Promise<Subscription & { message: string }> => {
    const response = await apiClient.patch(`/api/subscriptions/${id}/`, data);
    return response.data;
  },

  /**
   * Cancel a subscription
   * DELETE /api/subscriptions/{id}/
   */
  cancelSubscription: async (id: number, immediate: boolean = false): Promise<any> => {
    const response = await apiClient.delete(`/api/subscriptions/${id}/`, {
      params: { immediate }
    });
    return response.data;
  },

  /**
   * Reactivate a cancelled subscription
   * POST /api/subscriptions/{id}/reactivate/
   */
  reactivateSubscription: async (id: number): Promise<Subscription & { message: string }> => {
    const response = await apiClient.post(`/api/subscriptions/${id}/reactivate/`);
    return response.data;
  },

  /**
   * Get all available subscription plans
   * GET /api/subscription-plans/
   */
  getSubscriptionPlans: async (): Promise<SubscriptionPlan[]> => {
    const response = await apiClient.get('/api/subscription-plans/');
    return response.data;
  },

  /**
   * Get details of a specific subscription plan
   * GET /api/subscription-plans/{id}/
   */
  getSubscriptionPlanDetails: async (id: number): Promise<SubscriptionPlan> => {
    const response = await apiClient.get(`/api/subscription-plans/${id}/`);
    return response.data;
  },

  // ============ Admin Endpoints ============

  /**
   * Get all subscriptions (Admin view)
   * GET /api/admin/subscriptions/
   */
  adminGetAllSubscriptions: async (params?: {
    page?: number;
    status?: string;
    plan_id?: number;
  }): Promise<SubscriptionListResponse> => {
    const response = await apiClient.get('/api/admin/subscriptions/', { params });
    return response.data;
  },

  /**
   * Get subscription analytics (Admin view)
   * GET /api/admin/subscriptions/analytics/
   */
  adminGetSubscriptionAnalytics: async (): Promise<SubscriptionAnalytics> => {
    const response = await apiClient.get('/api/admin/subscriptions/analytics/');
    return response.data;
  },
};

export default subscriptionsApi;
