import apiClient from './client';

export interface Order {
  id: number;
  order_number: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
  items: OrderItem[];
  subtotal: string;
  discount?: {
    code: string;
    amount: string;
    percentage: number;
  };
  tax: string;
  total: string;
  currency: string;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  type: 'course' | 'subscription' | 'event';
  course?: {
    id: number;
    title: string;
    thumbnail_url?: string;
  };
  price: string;
  quantity: number;
}

export interface OrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Order[];
}

const normalizeOrderListResponse = (data: unknown): OrderListResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data as Order[],
    };
  }

  if (data && typeof data === 'object') {
    const obj = data as Partial<OrderListResponse> & { items?: Order[] };
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

export interface CreateOrderData {
  items: {
    type: 'course' | 'subscription';
    id: number;
  }[];
  discount_code?: string;
  billing_address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface CreateOrderResponse {
  id: number;
  order_number: string;
  status: string;
  total: string;
  currency: string;
  payment_url?: string;
  message: string;
}

export interface Payment {
  id: number;
  payment_number: string;
  order: {
    id: number;
    order_number: string;
  };
  user: {
    id: number;
    username: string;
    email: string;
  };
  amount: string;
  currency: string;
  payment_method: string;
  payment_provider: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id: string;
  paid_at?: string;
  created_at: string;
}

export interface ProcessPaymentData {
  order_id: number;
  payment_method: 'card' | 'paypal' | 'crypto';
  payment_token: string;
}

export interface Transaction {
  id: number;
  user: number;
  amount: number;
  item_type: string;
  item_id: string;
  item_name: string;
  paystack_reference: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  created_at: string;
  updated_at: string;
  user_info?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
  transaction_type?: 'ENROLLMENT' | 'EVENT' | 'ONBOARDING';
  description?: string;
  enrollment?: {
    id: number;
    course_title: string;
  };
  course_title?: string;
  event_title?: string;
  event_id?: number;
  course_id?: number;
}

export interface TransactionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transaction[];
}

export const ordersApi = {
  /**
   * Get user's orders (via transactions in V5)
   */
  getOrders: async (page?: number, pageSize?: number, status?: string): Promise<OrderListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (status) params.append('status', status);
    
    const response = await apiClient.get(`/api/transactions/my-transactions/?${params.toString()}`);
    const data = response.data;
    const txResults = data.results || [];
    const orders: Order[] = txResults.map((tx: Transaction) => ({
      id: tx.id,
      order_number: tx.paystack_reference || `TXN-${tx.id}`,
      user: {
        id: tx.user,
        username: tx.user_info?.username || '',
        email: tx.user_info?.email || '',
        full_name: tx.user_info?.full_name || '',
      },
      items: [],
      subtotal: tx.amount.toString(),
      tax: '0',
      total: tx.amount.toString(),
      currency: 'NGN',
      status: tx.status === 'SUCCESS' ? 'completed' : tx.status === 'FAILED' ? 'cancelled' : 'pending',
      payment_method: 'online',
      payment_status: tx.status === 'SUCCESS' ? 'paid' : tx.status === 'FAILED' ? 'failed' : 'pending',
      created_at: tx.created_at,
      updated_at: tx.updated_at,
    }));
    return {
      count: data.count || orders.length,
      next: data.next,
      previous: data.previous,
      results: orders,
    };
  },

  /**
   * Get specific order by ID (via transaction lookup)
   */
  getOrder: async (id: number): Promise<Order> => {
    // Backend V5/V6 docs do not include GET /api/transactions/{id}/.
    // Resolve by searching within the user's transaction history.
    const pageSize = 200;
    for (let page = 1; page <= 5; page += 1) {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('page_size', String(pageSize));
      const response = await apiClient.get(`/api/transactions/my-transactions/?${params.toString()}`);
      const data = response.data as any;
      const txResults: Transaction[] = (data?.results ?? data?.items ?? []) as Transaction[];
      const match = txResults.find((t) => t.id === id);
      if (match) {
        const tx = match;
        return {
          id: tx.id,
          order_number: tx.paystack_reference || `TXN-${tx.id}`,
          user: {
            id: tx.user,
            username: tx.user_info?.username || '',
            email: tx.user_info?.email || '',
            full_name: tx.user_info?.full_name || '',
          },
          items: [],
          subtotal: tx.amount.toString(),
          tax: '0',
          total: tx.amount.toString(),
          currency: 'NGN',
          status: tx.status === 'SUCCESS' ? 'completed' : tx.status === 'FAILED' ? 'cancelled' : 'pending',
          payment_method: 'online',
          payment_status: tx.status === 'SUCCESS' ? 'paid' : tx.status === 'FAILED' ? 'failed' : 'pending',
          created_at: tx.created_at,
          updated_at: tx.updated_at,
        };
      }

      if (!data?.next) break;
    }

    throw new Error('Order not found.');
  },

  /**
   * Create a new order (checkout)
   * V5: Use coursesApi.enroll() instead
   */
  createOrder: async (data: CreateOrderData): Promise<CreateOrderResponse> => {
    const courseId = data.items.find((i) => i.type === 'course')?.id;
    if (courseId) {
      const callbackUrl = `${window.location.origin}/dashboard/payment/verify`;
      const enrollment = await apiClient.post('/api/enroll/', {
        course: courseId,
        callback_url: callbackUrl,
      });
      const paymentUrl = enrollment.data.authorization_url as string | undefined;
      const amount = enrollment.data.amount as number | undefined;
      const message = (enrollment.data.message as string | undefined) || (paymentUrl ? 'Payment required' : 'Enrolled');
      return {
        id: enrollment.data.id || 0,
        order_number: enrollment.data.reference || `ENROLL-${courseId}`,
        status: paymentUrl ? 'pending' : 'completed',
        total: typeof amount === 'number' ? String(amount) : '0',
        currency: 'NGN',
        payment_url: paymentUrl,
        message,
      };
    }
    return {
      id: 0,
      order_number: 'N/A',
      status: 'pending',
      total: '0',
      currency: 'NGN',
      message: 'Use coursesApi.enroll() for course enrollment',
    };
  },

  /**
   * Cancel an order
   * V5: Not directly supported - enrollments auto-manage
   */
  cancelOrder: async (_id: number): Promise<{
    id: number;
    order_number: string;
    status: string;
    cancelled_at: string;
    message: string;
  }> => {
    return {
      id: _id,
      order_number: `TXN-${_id}`,
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      message: 'Cancellation not supported in V5 API - use enrollment management',
    };
  },

  /**
   * Get payment details
   */
  getPayment: async (id: number): Promise<Payment> => {
    throw new Error('Viewing payment details is not supported.');
  },

  /**
   * Process payment for an order
   */
  processPayment: async (data: ProcessPaymentData): Promise<{
    id: number;
    payment_number: string;
    status: string;
    amount: string;
    transaction_id: string;
    message: string;
  }> => {
    throw new Error('Processing payments is not supported.');
  },

  getMyTransactions: async (
    page?: number,
    pageSize?: number,
    status?: string,
    type?: string
  ): Promise<TransactionListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    const response = await apiClient.get(`/api/transactions/my-transactions/?${params.toString()}`);
    return response.data;
  },

  getMyTransactionByReference: async (reference: string): Promise<Transaction> => {
    const response = await apiClient.get(`/api/transactions/my-transactions/${reference}/`);
    return response.data;
  },

  verifyTransaction: async (reference: string): Promise<{ message: string }> => {
    const response = await apiClient.get(`/api/transactions/verify/${reference}/`);
    return response.data;
  },

  /**
   * Get all transactions (Admin only)
   * GET /api/transactions/all/
   */
  getAllTransactions: async (
    page?: number,
    pageSize?: number,
    status?: string,
    userId?: number
  ): Promise<TransactionListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (status) params.append('status', status);
    if (userId) params.append('user', userId.toString());
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
   * Verify admin transaction
   */
  verifyAdminTransaction: async (reference: string): Promise<{ message: string }> => {
    // Backend V5/V6 only documents /api/transactions/verify/<ref>/.
    const response = await apiClient.get(`/api/transactions/verify/${reference}/`);
    return response.data;
  },
};

export default ordersApi;
