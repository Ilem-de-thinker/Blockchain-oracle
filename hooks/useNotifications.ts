import { useState, useEffect, useCallback } from 'react';
import notificationsApi, { Notification } from '../src/api/notifications';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
}

export const useNotifications = (
  pollingInterval: number = 30000,
  pageSize: number = 10
): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getNotifications(1, pageSize);
      setNotifications(data.results || data.items || []);
      setUnreadCount(data.unread_count || 0);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to fetch notifications');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollingInterval);
    return () => clearInterval(interval);
  }, [fetchNotifications, pollingInterval]);

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      setError('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      setError('Failed to delete notification');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await notificationsApi.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      setError('Failed to delete all notifications');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  };
};
