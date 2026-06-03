import apiClient from './client';

// ============ Interfaces ============

export interface SupportUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_support?: boolean;
}

export interface SupportTicketMessage {
  id: number;
  sender: SupportUser;
  message: string;
  attachments: string[];
  created_at: string;
}

export interface SupportTicket {
  id: number;
  ticket_number: string;
  user: SupportUser;
  subject: string;
  category: 'technical' | 'billing' | 'account' | 'course_content' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_customer' | 'resolved' | 'closed';
  description?: string;
  assigned_to?: SupportUser;
  related_course?: {
    id: number;
    title: string;
  };
  related_order?: any;
  tags?: string[];
  messages?: SupportTicketMessage[];
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: SupportTicket[];
}

export interface CreateTicketRequest {
  subject: string;
  description: string;
}

export interface FAQ {
  id: number;
  category: string;
  question: string;
  answer: string;
  order: number;
  helpful_count: number;
}

export interface ContextDocument {
  id: number;
  title: string;
  content: string;
  source_file: string;
  created_at: string;
  updated_at: string;
}

export interface SupportAnalytics {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  average_response_time_hours: number;
  average_resolution_time_hours: number;
  tickets_by_category: { [key: string]: number };
  tickets_by_priority: { [key: string]: number };
  agent_performance: Array<{
    agent_id: number;
    agent_name: string;
    tickets_handled: number;
    average_resolution_time_hours: number;
  }>;
}

// ============ API Functions ============

export const supportApi = {
  /**
   * Get all support tickets created by the authenticated user
   * GET /api/support/tickets/
   */
  getMyTickets: async (params?: {
    page?: number;
    page_size?: number;
    status?: string;
    priority?: string;
  }): Promise<SupportTicketListResponse> => {
    const response = await apiClient.get('/api/support/tickets/', { params });
    return response.data;
  },

  /**
   * Get details of a specific support ticket including messages
   * GET /api/support/tickets/{id}/
   */
  getTicketDetails: async (id: number): Promise<SupportTicket> => {
    const response = await apiClient.get(`/api/support/tickets/${id}/`);
    return response.data;
  },

  /**
   * Create a new support ticket
   * POST /api/support/tickets/
   */
  createTicket: async (data: CreateTicketRequest): Promise<SupportTicket & { message: string }> => {
    const response = await apiClient.post('/api/support/tickets/', data);
    return response.data;
  },

  /**
   * Add a reply to an existing support ticket
   * POST /api/support/tickets/{id}/messages/
   */
  replyToTicket: async (id: number, message: string, attachments?: string[]): Promise<SupportTicketMessage & { message: string }> => {
    const response = await apiClient.post(`/api/support/tickets/${id}/messages/`, {
      message,
      attachments,
    });
    return response.data;
  },

  /**
   * Close a support ticket
   * PATCH /api/support/tickets/{id}/
   */
  closeTicket: async (id: number, resolutionNotes?: string): Promise<SupportTicket & { message: string }> => {
    const response = await apiClient.patch(`/api/support/tickets/${id}/`, {
      status: 'closed',
      resolution_notes: resolutionNotes,
    });
    return response.data;
  },

  /**
   * Reopen a closed ticket
   * PATCH /api/support/tickets/{id}/
   */
  reopenTicket: async (id: number): Promise<SupportTicket & { message: string }> => {
    const response = await apiClient.patch(`/api/support/tickets/${id}/`, {
      status: 'open',
    });
    return response.data;
  },

  /**
   * Get all frequently asked questions
   * GET /api/faqs/
   */
  getFAQs: async (category?: string): Promise<FAQ[]> => {
    const response = await apiClient.get('/api/faqs/', { params: { category } });
    return response.data;
  },

  /**
   * Mark an FAQ as helpful
   * POST /api/faqs/{id}/helpful/
   */
  markFAQHelpful: async (id: number): Promise<{ id: number; helpful_count: number; message: string }> => {
    const response = await apiClient.post(`/api/faqs/${id}/helpful/`);
    return response.data;
  },

  // ============ Admin Endpoints ============

  /**
   * Get all support tickets (Admin view)
   * GET /api/support/tickets/admin/
   */
  adminGetAllTickets: async (params?: {
    page?: number;
    status?: string;
    priority?: string;
    category?: string;
    assigned_to?: number;
  }): Promise<SupportTicketListResponse> => {
    const response = await apiClient.get('/api/support/tickets/admin/', { params });
    return response.data;
  },

  /**
   * Assign a ticket to a support agent (Admin view)
   * PATCH /api/support/tickets/{id}/
   */
  adminAssignTicket: async (id: number, assignedToId: number): Promise<SupportTicket & { message: string }> => {
    const response = await apiClient.patch(`/api/support/tickets/${id}/`, {
      status: 'open',
      assigned_to: assignedToId,
    });
    return response.data;
  },

  /**
   * Update the status of a support ticket (Admin view)
   * PATCH /api/support/tickets/{id}/
   */
  adminUpdateTicketStatus: async (id: number, status: string): Promise<SupportTicket & { message: string }> => {
    const response = await apiClient.patch(`/api/support/tickets/${id}/`, { status });
    return response.data;
  },

  /**
   * Get support ticket analytics (Admin view)
   * GET /api/admin/support-tickets/analytics/
   */
  adminGetSupportAnalytics: async (): Promise<SupportAnalytics> => {
    const response = await apiClient.get('/api/admin/support-tickets/analytics/');
    return response.data;
  },

  // ============ Message Methods ============

  /**
   * Get messages for a specific ticket
   * GET /api/support/tickets/{id}/messages/
   */
  getTicketMessages: async (ticketId: number): Promise<SupportTicketMessage[]> => {
    const response = await apiClient.get(`/api/support/tickets/${ticketId}/messages/`);
    return response.data;
  },

  /**
   * Send a message to a ticket (alias for replyToTicket)
   * POST /api/support/tickets/{id}/messages/
   */
  sendMessage: async (ticketId: number, message: string): Promise<SupportTicketMessage & { message: string }> => {
    const response = await apiClient.post(`/api/support/tickets/${ticketId}/messages/`, { message });
    return response.data;
  },

  /**
   * Update a ticket (Admin view)
   * PATCH /api/support/tickets/{id}/
   */
  adminUpdateTicket: async (id: number, data: { status?: string }): Promise<SupportTicket & { message: string }> => {
    const response = await apiClient.patch(`/api/support/tickets/${id}/`, data);
    return response.data;
  },

  // ============ AI Context Methods ============

  /**
   * Get all context documents (Admin/Super Admin)
   * GET /api/support/context/
   */
  adminGetContextDocuments: async (): Promise<ContextDocument[]> => {
    const response = await apiClient.get('/api/support/context/');
    return response.data;
  },

  /**
   * Create a context document (Admin/Super Admin)
   * POST /api/support/context/
   */
  adminCreateContextDocument: async (data: { title: string; content: string; source_file?: string }): Promise<ContextDocument> => {
    const response = await apiClient.post('/api/support/context/', data);
    return response.data;
  },

  /**
   * Update a context document (Admin/Super Admin)
   * PATCH /api/support/context/{id}/
   */
  adminUpdateContextDocument: async (id: number, data: { title?: string; content?: string; source_file?: string }): Promise<ContextDocument> => {
    const response = await apiClient.patch(`/api/support/context/${id}/`, data);
    return response.data;
  },

  /**
   * Delete a context document (Admin/Super Admin)
   * DELETE /api/support/context/{id}/
   */
  adminDeleteContextDocument: async (id: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/support/context/${id}/`);
    return response.data;
  },

  /**
   * Seed context from files (Super Admin only)
   * POST /api/support/context/seed/
   */
  superAdminSeedContext: async (force: boolean = false): Promise<{ created: number; updated: number; skipped: number; errors: string[] }> => {
    const response = await apiClient.post(`/api/support/context/seed/?force=${force}`);
    return response.data;
  },
};

export default supportApi;
