import apiClient from './client';

export interface Notification {
  id: number;
  type: 'course' | 'event' | 'payment' | 'achievement' | 'system';
  title: string;
  message: string;
  notification_type?: string;
  sender?: number;
  sender_username?: string;
  recipient?: number;
  icon?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface NotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  unread_count: number;
  results: Notification[];
}

export interface NotificationPreferences {
  email_notifications: boolean;
  course_updates: boolean;
  event_reminders: boolean;
  marketing_emails: boolean;
  push_notifications: boolean;
}

export interface UpdatePreferencesData {
  email_notifications?: boolean;
  course_updates?: boolean;
  event_reminders?: boolean;
  marketing_emails?: boolean;
  push_notifications?: boolean;
}

export interface SendNotificationData {
  target: 'all' | 'students' | 'tutors' | 'individual' | 'course';
  title: string;
  message: string;
  recipient_id?: number;
  course_id?: number;
  notification_type?: string;
}

export interface AdminEmailData {
  subject: string;
  message: string;
  user_ids?: number[];
  action_text?: string;
  action_url?: string;
}

const defaultPreferences: NotificationPreferences = {
  email_notifications: true,
  course_updates: true,
  event_reminders: true,
  marketing_emails: true,
  push_notifications: true,
};

const mapBackendNotificationType = (backendType?: string): Notification['type'] => {
  const value = (backendType || '').toLowerCase();
  if (value.includes('course')) return 'course';
  if (value.includes('event')) return 'event';
  if (value.includes('payment') || value.includes('transaction') || value.includes('refund')) return 'payment';
  if (value.includes('achievement') || value.includes('certificate') || value.includes('badge')) return 'achievement';
  return 'system';
};

const normalizeNotification = (raw: any): Notification => {
  const derivedType: Notification['type'] =
    raw?.type && ['course', 'event', 'payment', 'achievement', 'system'].includes(String(raw.type))
      ? raw.type
      : mapBackendNotificationType(raw?.notification_type);

  return {
    id: raw?.id,
    type: derivedType,
    title: raw?.title ?? '',
    message: raw?.message ?? '',
    notification_type: raw?.notification_type,
    sender: raw?.sender,
    sender_username: raw?.sender_username,
    recipient: raw?.recipient,
    icon: raw?.icon,
    action_url: raw?.action_url,
    is_read: !!raw?.is_read,
    created_at: raw?.created_at ?? '',
    metadata: raw?.metadata ?? undefined,
  };
};

const normalizeNotificationListResponse = (data: unknown): NotificationListResponse => {
  if (Array.isArray(data)) {
    const normalized = data.map(normalizeNotification);
    return {
      count: normalized.length,
      next: null,
      previous: null,
      unread_count: normalized.filter((item) => !item.is_read).length,
      results: normalized,
    };
  }

  if (data && typeof data === 'object') {
    const obj = data as Partial<NotificationListResponse> & { items?: Notification[] };
    const resultsArray = obj.results ?? obj.items ?? [];
    const normalized = Array.isArray(resultsArray) ? resultsArray.map(normalizeNotification) : [];
    return {
      count: typeof obj.count === 'number' ? obj.count : normalized.length,
      next: obj.next ?? null,
      previous: obj.previous ?? null,
      unread_count:
        typeof obj.unread_count === 'number' ? obj.unread_count : normalized.filter((item) => !item.is_read).length,
      results: normalized,
    };
  }

  return {
    count: 0,
    next: null,
    previous: null,
    unread_count: 0,
    results: [],
  };
};

const normalizePreferences = (raw: any): NotificationPreferences => ({
  email_notifications:
    typeof raw?.email_notifications === 'boolean' ? raw.email_notifications : defaultPreferences.email_notifications,
  course_updates: typeof raw?.course_updates === 'boolean' ? raw.course_updates : defaultPreferences.course_updates,
  event_reminders:
    typeof raw?.event_reminders === 'boolean' ? raw.event_reminders : defaultPreferences.event_reminders,
  marketing_emails:
    typeof raw?.marketing_emails === 'boolean' ? raw.marketing_emails : defaultPreferences.marketing_emails,
  push_notifications:
    typeof raw?.push_notifications === 'boolean' ? raw.push_notifications : defaultPreferences.push_notifications,
});

export const notificationsApi = {
  getNotifications: async (
    page?: number,
    pageSize?: number,
    unreadOnly?: boolean,
    type?: string
  ): Promise<NotificationListResponse> => {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (pageSize) params.append('page_size', pageSize.toString());
      if (unreadOnly) params.append('unread_only', 'true');
      if (type) params.append('type', type);

      const response = await apiClient.get(`/api/notifications/?${params.toString()}`);
      return normalizeNotificationListResponse(response.data);
    } catch (error: any) {
      console.error('Failed to load notifications:', error?.response?.data || error?.message);
      return { count: 0, next: null, previous: null, unread_count: 0, results: [] };
    }
  },

  getNotification: async (id: number): Promise<Notification> => {
    try {
      const response = await apiClient.get(`/api/notifications/${id}/`, {
        suppressErrorLogging: true,
      } as any);
      return normalizeNotification(response.data);
    } catch {
      const list = await notificationsApi.getNotifications(1, 200);
      const found = list.results.find((notification) => notification.id === id);
      if (found) {
        return found;
      }
      throw new Error('Notification not found.');
    }
  },

  markAsRead: async (id: number): Promise<{ id: number; is_read: boolean; created_at?: string }> => {
    const response = await apiClient.patch(`/api/notifications/${id}/read/`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ marked_count: number; message: string }> => {
    const all = await notificationsApi.getNotifications(1, 500);
    const unreadIds = all.results.filter((notification) => !notification.is_read).map((notification) => notification.id);
    if (!unreadIds.length) {
      return { marked_count: 0, message: 'No unread notifications.' };
    }

    const results = await Promise.allSettled(unreadIds.map((notificationId) => notificationsApi.markAsRead(notificationId)));
    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    return { marked_count: successCount, message: `Marked ${successCount} notifications as read.` };
  },

  markMultipleAsRead: async (
    notificationIds: number[]
  ): Promise<{ marked_count: number; notification_ids: number[]; message: string }> => {
    if (!notificationIds.length) {
      return { marked_count: 0, notification_ids: [], message: 'No notifications provided.' };
    }

    const results = await Promise.allSettled(notificationIds.map((notificationId) => notificationsApi.markAsRead(notificationId)));
    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    return {
      marked_count: successCount,
      notification_ids: notificationIds,
      message: `Marked ${successCount} notifications as read.`,
    };
  },

  deleteNotification: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/notifications/${id}/delete/`);
  },

  deleteAllNotifications: async (): Promise<{ deleted_count: number; message: string }> => {
    const all = await notificationsApi.getNotifications(1, 500);
    const ids = all.results.map((notification) => notification.id);
    if (!ids.length) {
      return { deleted_count: 0, message: 'No notifications to delete.' };
    }

    const results = await Promise.allSettled(ids.map((notificationId) => apiClient.delete(`/api/notifications/${notificationId}/delete/`)));
    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    return { deleted_count: successCount, message: `Deleted ${successCount} notifications.` };
  },

  deleteMultipleNotifications: async (
    notificationIds: number[]
  ): Promise<{ deleted_count: number; notification_ids: number[]; message: string }> => {
    if (!notificationIds.length) {
      return { deleted_count: 0, notification_ids: [], message: 'No notifications provided.' };
    }

    const results = await Promise.allSettled(
      notificationIds.map((notificationId) => apiClient.delete(`/api/notifications/${notificationId}/delete/`))
    );
    const successCount = results.filter((result) => result.status === 'fulfilled').length;
    return {
      deleted_count: successCount,
      notification_ids: notificationIds,
      message: `Deleted ${successCount} notifications.`,
    };
  },

  sendNotification: async (data: SendNotificationData): Promise<{ detail: string }> => {
    const response = await apiClient.post('/api/notifications/send/', data);
    return response.data;
  },

  notifyTutor: async (data: { course_id: number; title: string; message: string }): Promise<{ detail: string }> => {
    const response = await apiClient.post('/api/notifications/notify-tutor/', data);
    return response.data;
  },

  adminSendEmail: async (data: AdminEmailData): Promise<{ detail: string }> => {
    const response = await apiClient.post('/api/notifications/admin/send-email/', data);
    return response.data;
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get('/api/notifications/settings/');
    return normalizePreferences(response.data);
  },

  updatePreferences: async (data: UpdatePreferencesData): Promise<NotificationPreferences> => {
    const response = await apiClient.patch('/api/notifications/settings/', data);
    return normalizePreferences(response.data);
  },
};

export default notificationsApi;
