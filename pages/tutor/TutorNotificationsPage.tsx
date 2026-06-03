import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import notificationsApi, { Notification } from '../../src/api/notifications';
import Pagination from '../../components/ui/Pagination';
import SendNotificationModal from '../admin/components/SendNotificationModal';

const TutorNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
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

  const handleSendSuccess = () => {
    loadData();
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
        <div className="rounded-3xl border border-amber-100 bg-surface p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">Tutor Notifications</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-text">Learner activity and teaching alerts.</h1>
        </div>
        <div className="flex items-center justify-center min-h-[300px]">
          <i className="fas fa-circle-notch fa-spin text-3xl text-amber-600"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-amber-100 bg-surface p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-600">Tutor Notifications</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-text">Learner activity and teaching alerts.</h1>
        <p className="mt-3 text-sm text-text-secondary">Stay updated on student engagement, course reviews, and event activity.</p>
        <div className="mt-4">
          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-sm font-medium"
          >
            <i className="fas fa-paper-plane mr-2"></i>Send Notification to Students
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'unread' ? 'bg-amber-600 text-white' : 'border border-border text-gray-700 hover:bg-bg'
          }`}
        >
          {filter === 'all' ? 'Show Unread' : 'Show All'}
        </button>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading === 'mark-all'}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'mark-all' ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
        <span className="ml-auto text-sm text-text-muted">
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </span>
      </div>

      {/* List */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="divide-y divide-gray-100">
          {notifications.map((notif) => (
            <div key={notif.id} className={`flex items-start gap-4 p-4 hover:bg-bg transition-colors ${!notif.is_read ? 'bg-amber-50/50' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notif.type)}`}>
                <i className={`fas ${getIcon(notif.type)} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold ${!notif.is_read ? 'text-text' : 'text-gray-700'}`}>{notif.title}</h3>
                <p className="text-sm text-text-secondary mt-0.5">{notif.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Link
                    to={`${notif.id}`}
                    onClick={() => { if (!notif.is_read) handleMarkAsRead(notif.id); }}
                    className="text-xs font-medium text-text-muted hover:text-text"
                  >
                    Open
                  </Link>
                  {!notif.is_read && (
                    <button onClick={() => handleMarkAsRead(notif.id)} className="text-xs font-medium text-amber-600 hover:text-amber-700">Mark as read</button>
                  )}
                  {notif.action_url && (
                    <a href={notif.action_url} className="text-xs font-medium text-blue-600 hover:text-blue-700">View →</a>
                  )}
                  <button onClick={() => handleDelete(notif.id)} className="text-xs font-medium text-gray-400 hover:text-red-600">Delete</button>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(notif.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {notifications.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-surface-hover flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-bell text-2xl text-gray-400"></i>
            </div>
            <p className="text-sm font-medium text-text">No notifications</p>
            <p className="text-xs text-text-muted mt-1">You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && notifications.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSuccess={handleSendSuccess}
        userRole="TUTOR"
      />
    </div>
  );
};

export default TutorNotificationsPage;
