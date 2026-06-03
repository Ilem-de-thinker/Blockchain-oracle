import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationsApi, { Notification } from '../../src/api/notifications';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import Pagination from '../../components/ui/Pagination';
import SendNotificationModal from '../admin/components/SendNotificationModal';
import { ReportActions } from '../../components/ui/ReportActions';

const SuperAdminNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useLocalStorage<'all' | 'unread'>('super_admin_notifications_filter', 'all');
  const [typeFilter, setTypeFilter] = useLocalStorage<string>('super_admin_notifications_type_filter', '');
  const [currentPage, setCurrentPage] = useLocalStorage('super_admin_notifications_page', 1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
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
    loadData();
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-600';
      case 'event': return 'bg-emerald-100 text-emerald-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'achievement': return 'bg-amber-100 text-amber-600';
      case 'system': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-600';
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
        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">Super Admin Notifications</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Privileged alerts and escalations.</h1>
        </div>
        <div className="flex items-center justify-center min-h-[300px]">
          <i className="fas fa-circle-notch fa-spin text-3xl text-blue-600"></i>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">Super Admin Notifications</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900">Privileged alerts and escalations.</h1>
        <p className="mt-3 text-sm text-gray-600">System-wide notifications, security alerts, and governance updates.</p>
        <div className="mt-4 flex gap-3">
          <ReportActions />
          <button
            onClick={() => setShowSendModal(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium"
          >
            <i className="fas fa-paper-plane mr-2"></i>Send In-App Notification
          </button>
          <Link
            to="/super-admin/notifications/send-email"
            className="px-4 py-2 rounded-xl border border-blue-300 text-blue-600 hover:bg-blue-50 text-sm font-medium"
          >
            <i className="fas fa-envelope mr-2"></i>Send Email
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filter === 'unread' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {filter === 'all' ? 'Show Unread' : 'Show All'}
        </button>
        {['course', 'event', 'payment', 'achievement', 'system'].map(type => (
          <button
            key={type}
            onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              typeFilter === type ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {type}
          </button>
        ))}
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionLoading === 'mark-all'}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'mark-all' ? 'Marking...' : 'Mark All Read'}
          </button>
        )}
        {notifications.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
          >
            Clear All
          </button>
        )}
        <span className="ml-auto text-sm text-gray-500">{totalItems} total · {unreadCount} unread</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {notifications.map((notif) => (
            <div key={notif.id} className={`flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/50' : ''}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notif.type)}`}>
                <i className={`fas ${getIcon(notif.type)} text-sm`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-semibold ${!notif.is_read ? 'text-gray-900' : 'text-gray-700'}`}>{notif.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{notif.message}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Link
                    to={`${notif.id}`}
                    onClick={() => { if (!notif.is_read) handleMarkAsRead(notif.id); }}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    Open
                  </Link>
                  {!notif.is_read && (
                    <button onClick={() => handleMarkAsRead(notif.id)} className="text-xs font-medium text-blue-600 hover:text-blue-700">Mark as read</button>
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
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-bell text-2xl text-gray-400"></i>
            </div>
            <p className="text-sm font-medium text-gray-900">No notifications</p>
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
        userRole="SUPER_ADMIN"
      />
    </div>
  );
};

export default SuperAdminNotificationsPage;
