import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationsApi, { Notification } from '../../src/api/notifications';
import Pagination from '../../components/ui/Pagination';

const InfluencerNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const pageSize = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [filter, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications(currentPage, pageSize, filter === 'unread');
      setNotifications(data.results);
      setTotalItems(data.count);
      setTotalPages(Math.ceil(data.count / pageSize));
      setError(null);
    } catch {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {
      setError('Failed to mark as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading('mark-all');
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {
      setError('Failed to mark all as read.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationsApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {
      setError('Failed to delete notification.');
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-600';
      case 'event': return 'bg-emerald-100 text-emerald-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'achievement': return 'bg-amber-100 text-amber-600';
      case 'system': return 'bg-surface-hover text-text-secondary';
      default: return 'bg-surface-hover text-text-secondary';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'course': return 'fa-book';
      case 'event': return 'fa-calendar';
      case 'payment': return 'fa-credit-card';
      case 'achievement': return 'fa-trophy';
      case 'system': return 'fa-info';
      default: return 'fa-bell';
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Notifications</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-text">Influencer alerts and updates.</h1>
        </div>
        <div className="flex items-center justify-center min-h-[300px]">
          <i className="fas fa-circle-notch fa-spin text-3xl text-primary"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Notifications</p>
        <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-text">Influencer alerts and updates.</h1>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-text-secondary">Campaign invitations, referral activity, and payout notifications.</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-sm text-red-300">{error}</div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'unread' ? 'bg-primary text-white' : 'border border-white/20 text-text hover:bg-surface/10'
          }`}
        >
          {filter === 'all' ? 'Show Unread' : 'Show All'}
        </button>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading === 'mark-all'}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
          >
            {actionLoading === 'mark-all' ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
        <span className="ml-auto text-sm text-text-muted">
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </span>
      </div>

      <div className="bg-surface/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <div className="divide-y divide-white/5">
          {notifications.map((notif) => (
            <div key={notif.id} className={`flex items-start gap-4 p-4 hover:bg-surface/5 transition-colors ${!notif.is_read ? 'bg-primary/10' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notif.type)}`}>
                <i className={`fas ${getIcon(notif.type)} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold ${!notif.is_read ? 'text-text' : 'text-text-secondary'}`}>{notif.title}</h3>
                <p className="text-sm text-text-muted mt-0.5">{notif.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Link
                    to={`${notif.id}`}
                    onClick={() => { if (!notif.is_read) handleMarkAsRead(notif.id); }}
                    className="text-xs font-medium text-text-muted hover:text-text"
                  >
                    Open
                  </Link>
                  {!notif.is_read && (
                    <button onClick={() => handleMarkAsRead(notif.id)} className="text-xs font-medium text-primary hover:text-primary-light">Mark as read</button>
                  )}
                  {notif.action_url && (
                    <a href={notif.action_url} className="text-xs font-medium text-blue-400 hover:text-blue-300">View →</a>
                  )}
                  <button onClick={() => handleDelete(notif.id)} className="text-xs font-medium text-text-muted hover:text-red-400">Delete</button>
                  <span className="text-xs text-text-muted ml-auto">{new Date(notif.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {notifications.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-surface/5 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-bell text-2xl text-white/30"></i>
            </div>
            <p className="text-sm font-medium text-text">No notifications</p>
            <p className="text-xs text-text-muted mt-1">You're all caught up!</p>
          </div>
        )}
      </div>

      {!loading && notifications.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default InfluencerNotificationsPage;
