import apiClient from './client';

export interface AdminOrder {
  id: number;
  order_number: string;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
  items: AdminOrderItem[];
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
  billing_address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AdminOrderItem {
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

export interface AdminOrderListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminOrder[];
}

export interface AdminTransactionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminTransaction[];
}

const normalizeAdminOrderListResponse = (data: unknown): AdminOrderListResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data as AdminOrder[],
    };
  }

  if (data && typeof data === 'object') {
    const obj = data as Partial<AdminOrderListResponse> & { items?: AdminOrder[] };
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

const normalizeAdminTransactionListResponse = (data: unknown): AdminTransactionListResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: (data as any[]).map(mapTransactionToAdminTransaction),
    };
  }

  if (data && typeof data === 'object') {
    const obj = data as Partial<AdminTransactionListResponse> & { items?: any[] };
    const resultsArray = obj.results ?? obj.items ?? [];
    return {
      count: typeof obj.count === 'number' ? obj.count : Array.isArray(resultsArray) ? resultsArray.length : 0,
      next: obj.next ?? null,
      previous: obj.previous ?? null,
      results: Array.isArray(resultsArray) ? resultsArray.map(mapTransactionToAdminTransaction) : [],
    };
  }

  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
};

const mapTransactionToAdminTransaction = (tx: any): AdminTransaction => ({
  id: tx.id,
  reference: tx.paystack_reference || tx.reference || tx.order_id || `TXN-${tx.id}`,
  amount: tx.amount || '0',
  currency: tx.currency || 'NGN',
  status: (tx.status || 'pending').toLowerCase(),
  payment_method: tx.payment_method || 'online',
  provider: tx.provider || 'paystack',
  description: tx.description || tx.note || 'Payment',
  user: tx.user ? {
    id: tx.user.id ?? tx.user,
    username: tx.user.username || '',
    email: tx.user.email || '',
    full_name: tx.user.full_name || tx.user.name || tx.user.first_name || 'User',
  } : undefined,
  created_at: tx.created_at || tx.date || new Date().toISOString(),
  updated_at: tx.updated_at || tx.created_at || new Date().toISOString(),
});

export interface AdminTransaction {
  id: number;
  reference: string;
  amount: string;
  currency: string;
  status: string;
  payment_method: string;
  provider: string;
  description: string;
  user?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AdminTransactionListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminTransaction[];
}

interface TransactionResponse {
  id: number;
  user: number;
  amount: string;
  paystack_reference: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const mapTransactionToOrder = (tx: TransactionResponse): AdminOrder => ({
  id: tx.id,
  order_number: tx.paystack_reference || `TXN-${tx.id}`,
  user: {
    id: tx.user,
    username: '',
    email: '',
    full_name: '',
  },
  items: [],
  subtotal: tx.amount,
  tax: '0',
  total: tx.amount,
  currency: 'NGN',
  status: tx.status === 'SUCCESS' ? 'completed' : tx.status === 'FAILED' ? 'cancelled' : 'pending',
  payment_method: 'online',
  payment_status: tx.status === 'SUCCESS' ? 'paid' : tx.status === 'FAILED' ? 'failed' : 'pending',
  created_at: tx.created_at,
  updated_at: tx.updated_at,
});

export const adminOrdersApi = {
  getOrders: async (page?: number, pageSize?: number, status?: string): Promise<AdminOrderListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (status) params.append('status', status);
    const response = await apiClient.get(`/api/transactions/all/?${params.toString()}`);
    const normalized = normalizeAdminTransactionListResponse(response.data);
    const orders = normalized.results.map(mapTransactionToOrder);
    return {
      count: normalized.count,
      next: normalized.next,
      previous: normalized.previous,
      results: orders,
    };
  },

  getOrder: async (id: number): Promise<AdminOrder> => {
    // Backend V5/V6 docs do not include GET /api/transactions/{id}/.
    // Resolve by searching within the admin transaction list.
    const pageSize = 200;
    for (let page = 1; page <= 5; page += 1) {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('page_size', String(pageSize));
      const response = await apiClient.get(`/api/transactions/all/?${params.toString()}`);
      const data = response.data as any;
      const txResults: TransactionResponse[] = (data?.results ?? data?.items ?? []) as TransactionResponse[];
      const match = txResults.find((t) => t.id === id);
      if (match) {
        return mapTransactionToOrder(match);
      }
      if (!data?.next) break;
    }
    throw new Error('Order not found.');
  },

  cancelOrder: async (_id: number): Promise<{ message: string }> => {
    return { message: 'Cancellation not supported in V5 API' };
  },

  getAllTransactions: async (page?: number, pageSize?: number): Promise<AdminTransactionListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    const response = await apiClient.get(`/api/transactions/all/?${params.toString()}`);
    return normalizeAdminTransactionListResponse(response.data);
  },
};

export default adminOrdersApi;
