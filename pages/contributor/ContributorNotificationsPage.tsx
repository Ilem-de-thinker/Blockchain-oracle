import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';
import { notificationsApi, Notification } from '../../src/api/notifications';

interface ContributorNotificationsPageProps {
  user: User | null;
}

const ContributorNotificationsPage: React.FC<ContributorNotificationsPageProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await notificationsApi.getNotifications();
        setNotifications(Array.isArray(data) ? data : data.results || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
      }
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    }
    return diffDays === 1 ? 'Yesterday' : date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="app-surface mb-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-surface/5 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-400">
              Contributor Workspace
            </p>
            <h1 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              Notifications
            </h1>
          </div>
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-surface/5 px-4 py-2 text-sm font-semibold text-text transition hover:bg-surface/10"
            >
              <i className="fas fa-check-double"></i>
              Mark all as read
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-[24px] border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            {error}
          </div>
        )}

        <div className="app-surface overflow-hidden rounded-[28px] border border-white/10 bg-surface/5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <i className="fas fa-circle-notch fa-spin text-3xl text-blue-400"></i>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <i className="fas fa-bell-slash text-4xl text-white/20"></i>
              <p className="mt-4 text-white/60">No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group flex items-start gap-3 sm:gap-4 p-4 sm:p-5 transition hover:bg-surface/5 ${
                    !notification.is_read ? 'bg-blue-500/5' : ''
                  }`}
                >
                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                    <i className="fas fa-bell"></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`font-semibold ${!notification.is_read ? 'text-blue-300' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-white/70">{notification.message}</p>
                        <p className="mt-2 text-xs text-white/40">{formatDate(notification.created_at)}</p>
                        <div className="mt-3">
                          <Link
                            to={`${notification.id}`}
                            onClick={() => { if (!notification.is_read) markAsRead(notification.id); }}
                            className="text-xs font-medium text-blue-300 hover:text-blue-200"
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="rounded-full p-2 opacity-0 transition hover:bg-surface/10 group-hover:opacity-100"
                        >
                          <i className="fas fa-check text-xs text-white/50"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributorNotificationsPage;
