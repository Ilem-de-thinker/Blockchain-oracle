import apiClient from './client';

export interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  is_online: boolean;
  event_url: string | null;
  location: string | null;
  image_url?: string;
  creator: {
    id: number;
    username: string;
    email: string;
    full_name: string;
  };
  organizers: Array<{
    id: number;
    username: string;
    email: string;
    full_name: string;
  }>;
  registrations_count: number;
  capacity: number;
  registration_fee?: string;
  event_fee?: string;
  is_registered: boolean;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  type: 'meetup' | 'bootcamp' | 'seminar' | 'conference' | 'workshop' | 'hackathon' | 'webinar' | 'panel' | 'networking' | 'other';
  created_at: string;
  updated_at: string;
}

export interface EventListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Event[];
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  is_online?: boolean;
  event_url?: string;
  location?: string;
  organizer_ids?: number[];
  image_url?: string;
  registration_fee?: number;
  event_fee?: number;
  capacity?: number;
  type?: 'meetup' | 'bootcamp' | 'seminar' | 'conference' | 'workshop' | 'hackathon' | 'webinar' | 'panel' | 'networking' | 'other';
}

export interface EventApplication {
  id: number;
  event: {
    id: number;
    title: string;
    date: string;
    description?: string;
    location?: string;
    is_online?: boolean;
    event_url?: string;
    image_url?: string;
    type?: string;
  };
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    profile_picture?: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  updated_at?: string;
  notes?: string;
}

export interface EventApplicationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: EventApplication[];
}

export interface EventRegistrationPaymentResponse {
  message: string;
  authorization_url: string;
  reference: string;
}

export type EventRegistrationResponse =
  | EventApplication
  | EventRegistrationPaymentResponse
  | {
      id: number;
      event: number;
      status: string;
      message: string;
    };

const normalizeEventListResponse = (data: unknown): EventListResponse => {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data as Event[],
    };
  }

  if (data && typeof data === 'object') {
    const eventData = data as Partial<EventListResponse> & { items?: Event[] };
    const resultsArray = eventData.results ?? eventData.items ?? [];
    return {
      count: typeof eventData.count === 'number' ? eventData.count : Array.isArray(resultsArray) ? resultsArray.length : 0,
      next: eventData.next ?? null,
      previous: eventData.previous ?? null,
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

const normalizeEventApplicationsResponse = (data: unknown): EventApplicationsResponse => {
  const normalizeApp = (item: any): EventApplication => {
    if (item && typeof item.event === 'number') {
      return {
        id: item.id,
        event: {
          id: item.event,
          title: item.event_title || 'Untitled Event',
          date: item.event_date || '',
          description: item.event_description,
          location: item.event_location,
          is_online: item.event_is_online,
          event_url: item.event_url,
          image_url: item.event_image_url,
          type: item.event_type || item.type,
        },
        user: item.user || { id: 0, username: '', email: '', full_name: '' },
        status: item.status || 'pending',
        applied_at: item.applied_at,
        updated_at: item.updated_at,
        notes: item.notes,
      };
    }
    return item as EventApplication;
  };

  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data.map(normalizeApp),
    };
  }

  if (data && typeof data === 'object') {
    const applicationsData = data as Partial<EventApplicationsResponse> & { items?: EventApplication[] };
    const rawResults = Array.isArray(applicationsData.results)
      ? applicationsData.results
      : Array.isArray(applicationsData.items)
      ? applicationsData.items
      : [];

    return {
      count: typeof applicationsData.count === 'number' ? applicationsData.count : rawResults.length,
      next: applicationsData.next ?? null,
      previous: applicationsData.previous ?? null,
      results: rawResults.map(normalizeApp),
    };
  }

  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
};

export const eventsApi = {
  /**
   * Get all events (public)
   */
  getEvents: async (page?: number, pageSize?: number, type?: string): Promise<EventListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (type) params.append('type', type);

    const response = await apiClient.get(`/api/events/?${params.toString()}`);
    return normalizeEventListResponse(response.data);
  },

  /**
   * Get upcoming events (date >= now)
   */
  getUpcomingEvents: async (page?: number, pageSize?: number, type?: string): Promise<EventListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (type) params.append('type', type);

    const response = await apiClient.get(`/api/events/upcoming/?${params.toString()}`);
    return normalizeEventListResponse(response.data);
  },

  /**
   * Get past events (date < now)
   */
  getPastEvents: async (page?: number, pageSize?: number, type?: string): Promise<EventListResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    if (type) params.append('type', type);

    const response = await apiClient.get(`/api/events/past/?${params.toString()}`);
    return normalizeEventListResponse(response.data);
  },

  /**
   * Get specific event by ID
   */
  getEvent: async (id: number): Promise<Event | null> => {
    try {
      const response = await apiClient.get(`/api/events/${id}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new event
   */
  createEvent: async (data: CreateEventData): Promise<Event> => {
    const response = await apiClient.post('/api/events/', data);
    return response.data;
  },

  /**
   * Update an event
   */
  updateEvent: async (id: number, data: Partial<CreateEventData>): Promise<Event> => {
    const response = await apiClient.patch(`/api/events/${id}/`, data);
    return response.data;
  },

  /**
   * Delete an event
   */
  deleteEvent: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/events/${id}/`);
  },

  /**
   * Register for an event
   */
  registerForEvent: async (eventId: number, callbackUrl?: string): Promise<EventRegistrationResponse> => {
    const data: { event: number; callback_url?: string } = {
      event: eventId,
    };
    if (callbackUrl) {
      data.callback_url = callbackUrl;
    }
    const response = await apiClient.post('/api/event-applications/', data);
    return response.data;
  },

  /**
   * Get my event registrations
   */
  getMyRegistrations: async (page?: number, pageSize?: number): Promise<EventApplicationsResponse> => {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (pageSize) params.append('page_size', pageSize.toString());
    const response = await apiClient.get(`/api/event-applications/?${params.toString()}`);
    return normalizeEventApplicationsResponse(response.data);
  },

  /**
   * Get single registration detail
   */
  getRegistrationDetail: async (id: number): Promise<EventApplication> => {
    const response = await apiClient.get(`/api/event-applications/${id}/`);
    return response.data;
  },

  /**
   * Cancel event registration
   */
  cancelRegistration: async (id: number): Promise<{ message: string }> => {
    throw new Error('Canceling event registrations is not supported.');
  },

  /**
   * Get event applications (for organizers/admins)
   */
  getEventApplications: async (eventId: number): Promise<EventApplicationsResponse> => {
    const response = await apiClient.get(`/api/events/${eventId}/applications/`);
    return normalizeEventApplicationsResponse(response.data);
  },

  /**
   * Update application status (for organizers/admins)
   */
  updateApplicationStatus: async (
    applicationId: number,
    status: 'accepted' | 'rejected'
  ): Promise<EventApplication> => {
    const response = await apiClient.patch(
      `/api/event-applications/${applicationId}/update-status/`,
      { status }
    );
    return response.data;
  },
};

export default eventsApi;
