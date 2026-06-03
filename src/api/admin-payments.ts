import apiClient from './client';

export interface Transaction {
  id: number;
  user: number;
  user_info?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
  amount: number;
  paystack_reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  created_at: string;
  updated_at: string;
  transaction_type?: string;
  description?: string;
}

export interface TransactionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
}

export const adminPaymentsApi = {
  /**
   * Get all transactions (Admin only)
   * V7 Endpoint: GET /api/transactions/all/
   */
  getAllTransactions: async (
    page?: number,
    pageSize?: number,
    status?: string,
    userId?: number,
    startDate?: string,
    endDate?: string
  ): Promise<TransactionListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (status) params.append('status', status);
    if (userId) params.append('user_id', userId.toString());
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await apiClient.get(`/api/transactions/all/?${params.toString()}`);
    const data = response.data;
    
    if (Array.isArray(data)) {
      return {
        count: data.length,
        next: null,
        previous: null,
        results: data as Transaction[],
      };
    }
    return data;
  },

  /**
   * Verify a payment by reference
   * V7 Endpoint: GET /api/transactions/verify/<ref>/
   */
  verifyPayment: async (reference: string): Promise<{
    message: string;
    status?: string;
    amount?: string;
    user?: string;
  }> => {
    const response = await apiClient.get(`/api/transactions/verify/${reference}/`);
    return response.data;
  },
};

export default adminPaymentsApi;
