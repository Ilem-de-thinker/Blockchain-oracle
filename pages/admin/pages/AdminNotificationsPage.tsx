import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationsApi, { Notification } from '../../../src/api/notifications';
import Pagination from '../../../components/ui/Pagination';
import SendNotificationModal from '../components/SendNotificationModal';
import { ReportActions } from '../../../components/ui/ReportActions';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

const AdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useLocalStorage<'all' | 'unread'>('admin_notifications_filter', 'all');
  const [typeFilter, setTypeFilter] = useLocalStorage<string>('admin_notifications_type_filter', '');
  const [currentPage, setCurrentPage] = useLocalStorage('admin_notifications_page', 1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useLocalStorage('admin_notifications_show_send_modal', false);
  const pageSize = 15;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, typeFilter]);

  useEffect(() => {
    loadData();
  }, [filter, typeFilter, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications(currentPage, pageSize, filter === 'unread', typeFilter || undefined);
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

  const handleDeleteAll = async () => {
    if (!confirm('Delete ALL notifications?')) return;
    try {
      setActionLoading('delete-all');
      await notificationsApi.deleteAllNotifications();
      setNotifications([]);
    } catch {
      setError('Failed to delete all notifications.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendSuccess = () => {
    loadData(); // Refresh notifications
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
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-purple-600"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Notifications</h1>
          <p className="text-text-muted">Platform alerts and system notifications</p>
        </div>
        <div className="flex gap-2">
          <ReportActions />
          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium"
          >
            <i className="fas fa-paper-plane mr-2"></i>Send Notification
          </button>
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAll}
              className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium"
            >
              <i className="fas fa-trash mr-2"></i>Clear All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <i className="fas fa-exclamation-circle mr-2"></i>{error}
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'unread' ? 'bg-purple-600 text-white' : 'border border-border text-gray-700 hover:bg-bg'
          }`}
        >
          {filter === 'all' ? 'Show Unread' : 'Show All'}
        </button>
        {['course', 'event', 'payment', 'achievement', 'system'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              typeFilter === type ? 'bg-purple-600 text-white' : 'border border-border text-gray-700 hover:bg-bg'
            }`}
          >
            {type}
          </button>
        ))}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading === 'mark-all'}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'mark-all' ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
        <span className="ml-auto text-sm text-text-muted">{totalItems} total · {unreadCount} unread</span>
      </div>

      <div className="bg-surface rounded-2xl border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {notifications.map((notif) => (
            <div key={notif.id} className={`flex items-start gap-4 p-4 hover:bg-bg transition-colors ${!notif.is_read ? 'bg-purple-50/50' : ''}`}>
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
                    <button onClick={() => handleMarkAsRead(notif.id)} className="text-xs font-medium text-white!">Mark as read</button>
                  )}
                  {notif.action_url && (
                    <a href={notif.action_url} className="text-xs font-medium text-white">View →</a>
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
        userRole="ADMIN"
      />
    </div>
  );
};

export default AdminNotificationsPage;
