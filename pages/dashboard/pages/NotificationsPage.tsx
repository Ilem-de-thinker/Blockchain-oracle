import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../../types';
import notificationsApi, { Notification, NotificationPreferences } from '../../../src/api/notifications';
import { useToast } from '../../../src/hooks/useToast';
import {
  Bell, CheckCheck, Search, Filter, X, RefreshCcw, ArrowRight,
  BookOpen, Calendar, CreditCard, Trophy, Info, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '../../../hooks/useLocalStorage';

const typeMeta: Record<string, { label: string; emoji: string }> = {
  course:     { label: 'Course',     emoji: '📚' },
  event:      { label: 'Event',      emoji: '📅' },
  payment:    { label: 'Payment',    emoji: '💰' },
  achievement:{ label: 'Achievement',emoji: '🏆' },
  system:     { label: 'System',     emoji: '⚙️' },
};

const NotificationsPage: React.FC<{ user: User | null }> = ({ user }) => {
  const toast = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useLocalStorage<'all' | 'unread'>('notifications_filter', 'all');
  const [typeFilter, setTypeFilter] = useLocalStorage<string>('notifications_type_filter', '');
  const [showFilters, setShowFilters] = useLocalStorage('notifications_show_filters', false);
  const [currentPage, setCurrentPage] = useLocalStorage('notifications_page', 1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useLocalStorage('notifications_show_preferences', false);
  const [searchQuery, setSearchQuery] = useLocalStorage('notifications_search', '');
  const [showSearchModal, setShowSearchModal] = useLocalStorage('notifications_show_search_modal', false);
  const pageSize = 15;

  const filtered = useMemo(() => {
    let items = notifications;
    if (filter !== 'all') items = items.filter(n => filter === 'unread' ? !n.is_read : true);
    if (typeFilter) items = items.filter(n => n.type === typeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q)
      );
    }
    return items;
  }, [notifications, filter, typeFilter, searchQuery]);

  const totalFilteredCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
  const displayNotifications = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize]
  );

  const unreadCount = useMemo(() => notifications.filter(n => !n.is_read).length, [notifications]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [notificationsData, preferencesData] = await Promise.all([
        notificationsApi.getNotifications(1, 200, false, undefined),
        notificationsApi.getPreferences().catch(() => null),
      ]);
      setNotifications(notificationsData.results);
      setPreferences(preferencesData);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { toast.error('Failed to update'); }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading('mark-all');
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed to update all'); }
    finally { setActionLoading(null); }
  };

  const getIconInfo = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'course': return { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'event': return { icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'payment': return { icon: CreditCard, color: 'text-green-500', bg: 'bg-green-500/10' };
      case 'achievement': return { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'system': return { icon: Info, color: 'text-slate-500', bg: 'bg-slate-500/10' };
      default: return { icon: Bell, color: 'text-primary', bg: 'bg-primary/10' };
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-4 sm:p-6 bg-bg">
      <div className="w-full max-w-6xl">
        <div className="bg-surface/95 backdrop-blur-md border border-border/50 rounded-3xl shadow-2xl overflow-hidden">

          {/* ─── Header ─── */}
          <div className="bg-surface-alt/80 backdrop-blur-md px-5 py-4 flex items-center gap-3 border-b border-border/50">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-hover rounded-2xl flex items-center justify-center text-xl">
              <Bell size={20} className="text-text-inverse" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-text">Notifications</h3>
              <p className="text-xs text-text-muted">
                {unreadCount > 0
                  ? <><span className="text-primary font-semibold">{unreadCount} unread</span> &middot; {notifications.length} total</>
                  : 'All caught up'}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-xl transition-all"
                title="Search"
              >
                <Search size={16} />
              </button>
              <button
                onClick={() => loadData()}
                className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-xl transition-all"
                title="Refresh"
              >
                <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-xl transition-all"
                title="Preferences"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ─── Search Bar (always visible) ─── */}
          <div className="px-5 py-3 border-b border-border/50 bg-surface/30">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 bg-surface-alt/80 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-border/50">
                <Search size={15} className="text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="flex-1 bg-transparent outline-none text-sm text-text placeholder-text-muted"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-text-muted hover:text-text">
                    <X size={14} />
                  </button>
                )}
              </div>

              {notifications.some(n => !n.is_read) && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={actionLoading === 'mark-all'}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2.5 bg-primary/10 text-primary text-xs font-bold rounded-2xl hover:bg-primary/20 transition-all"
                >
                  <CheckCheck size={14} />
                  <span className="hidden sm:inline">Mark All Read</span>
                </button>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex gap-1">
                {(['all', 'unread'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => handleFilterChange(setFilter, f)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all',
                      filter === f
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-muted hover:text-text'
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="h-4 w-px bg-border/50" />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all',
                  showFilters || typeFilter ? 'bg-primary/10 text-primary' : 'text-text-muted hover:text-text'
                )}
              >
                <Filter size={12} />
                Type
              </button>
            </div>

            {/* Expandable type filter row */}
            <div className={cn(
              'transition-all duration-300 overflow-hidden',
              showFilters ? 'max-h-20 mt-3 opacity-100' : 'max-h-0 opacity-0'
            )}>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                {Object.entries(typeMeta).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => handleFilterChange(setTypeFilter, typeFilter === key ? '' : key)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border',
                      typeFilter === key
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-border/50 text-text-muted hover:border-border'
                    )}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Chat / Notifications Area ─── */}
          <div className="h-[420px] sm:h-[480px] p-4 sm:p-5 space-y-3 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCcw className="h-6 w-6 animate-spin text-primary/40" />
              </div>
            ) : displayNotifications.length > 0 ? (
              displayNotifications.map((notif, idx) => {
                const meta = typeMeta[notif.type] || { emoji: '🔔', label: notif.type };
                const iconInfo = getIconInfo(notif.type);
                const Icon = iconInfo.icon;
                const showAvatar = idx === 0 || displayNotifications[idx - 1]?.sender_username !== notif.sender_username;
                return (
                  <div key={notif.id} className={cn('flex gap-3', !notif.is_read && '')}>
                    {/* Avatar column */}
                    <div className={cn('shrink-0', showAvatar ? '' : 'invisible')}>
                      <div className={cn(
                        'w-8 h-8 rounded-2xl flex items-center justify-center text-sm',
                        iconInfo.bg, iconInfo.color
                      )}>
                        <Icon size={15} />
                      </div>
                    </div>

                    {/* Bubble */}
                    <div className="max-w-[85%] min-w-0">
                      <div className={cn(
                        'px-4 py-3 rounded-2xl rounded-tl-none border transition-colors',
                        notif.is_read
                          ? 'bg-surface-alt/70 border-border/30'
                          : 'bg-surface border-border/60 shadow-sm'
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-text truncate">{notif.title}</span>
                          {!notif.is_read && (
                            <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
                          )}
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2.5">
                          <Link
                            to={`${notif.id}`}
                            onClick={() => { if (!notif.is_read) handleMarkAsRead(notif.id); }}
                            className="text-[9px] font-black uppercase tracking-wider text-text-muted hover:text-text transition-colors"
                          >
                            Open
                          </Link>
                          {!notif.is_read && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="text-[9px] font-black uppercase tracking-wider text-primary"
                            >
                              Read
                            </button>
                          )}
                          {notif.action_url && (
                            <a
                              href={notif.action_url}
                              className="text-[9px] font-black uppercase tracking-wider text-primary flex items-center gap-0.5"
                            >
                              Visit <ArrowRight size={8} />
                            </a>
                          )}
                          <span className="ml-auto text-[9px] text-text-muted shrink-0">
                            {new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full opacity-50 gap-2">
                <Bell size={32} className="text-text-muted" />
                <p className="text-xs font-medium text-text-muted">
                  {searchQuery
                    ? 'No notifications match your search'
                    : filter === 'unread'
                      ? 'No unread notifications'
                      : 'No notifications yet'}
                </p>
              </div>
            )}
          </div>

          {/* ─── Pagination ─── */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-border/50 flex items-center justify-between text-xs text-text-muted">
              <span>
                {(currentPage - 1) * pageSize + 1}&ndash;{Math.min(currentPage * pageSize, totalFilteredCount)} of {totalFilteredCount}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                  const page = start + i;
                  if (page > totalPages) return null;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'w-7 h-7 rounded-lg text-[11px] font-bold transition-all',
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'text-text-muted hover:text-text hover:bg-surface-hover'
                      )}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Search Modal ─── */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
             onClick={() => setShowSearchModal(false)}>
          <div className="bg-surface w-full max-w-lg mt-20 sm:mt-0 rounded-t-3xl sm:rounded-3xl border border-border/50 shadow-2xl overflow-hidden animate-slide-up"
               onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between bg-surface-alt/30">
              <h3 className="font-bold text-sm text-text">Search Notifications</h3>
              <button onClick={() => setShowSearchModal(false)} className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-all">
                <X size={16} />
              </button>
            </div>

            {/* Search input */}
            <div className="p-5">
              <div className="flex items-center gap-3 bg-surface-alt rounded-2xl px-4 py-3 border border-border/50">
                <Search size={16} className="text-text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="flex-1 bg-transparent outline-none text-sm text-text placeholder-text-muted"
                  autoFocus
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-text-muted hover:text-text">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Quick filter tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {Object.entries(typeMeta).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => handleFilterChange(setTypeFilter, typeFilter === key ? '' : key)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border',
                      typeFilter === key
                        ? 'border-primary text-primary bg-primary/10'
                        : 'border-border/50 text-text-muted hover:border-border'
                    )}
                  >
                    {meta.emoji} {meta.label}
                  </button>
                ))}
                <button
                  onClick={() => { setTypeFilter(''); setFilter('all'); }}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-text-muted hover:text-text transition-all"
                >
                  Clear all
                </button>
              </div>

              {/* Results count */}
              <p className="text-xs text-text-muted mt-4">
                {searchQuery || typeFilter || filter !== 'all'
                  ? `${totalFilteredCount} notification${totalFilteredCount !== 1 ? 's' : ''} found`
                  : `${notifications.length} notification${notifications.length !== 1 ? 's' : ''} total`
                }
              </p>
            </div>

            <div className="px-5 py-3 border-t border-border/50 bg-surface-alt/20 flex justify-end">
              <button
                onClick={() => setShowSearchModal(false)}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Preferences Modal ─── */}
      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
             onClick={() => setShowPreferences(false)}>
          <div className="bg-surface w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border/50 shadow-2xl overflow-hidden animate-slide-up"
               onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between bg-surface-alt/30">
              <h3 className="font-bold text-sm text-text">Notification Settings</h3>
              <button onClick={() => setShowPreferences(false)} className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-hover transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {[
                { key: 'email_notifications' as const, label: 'Email Alerts', desc: 'Critical updates via email' },
                { key: 'push_notifications' as const, label: 'Push Notifications', desc: 'In-app activity alerts' },
                { key: 'course_updates' as const, label: 'Course Updates', desc: 'Changes to your courses' },
                { key: 'event_reminders' as const, label: 'Event Reminders', desc: 'Upcoming event notifications' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-surface-alt/50 border border-border/30">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-text">{item.label}</p>
                    <p className="text-[10px] text-text-muted truncate">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={preferences?.[item.key] ?? false}
                      onChange={async () => {
                        if (!preferences) return;
                        const updated = { ...preferences, [item.key]: !preferences[item.key] };
                        try {
                          const result = await notificationsApi.updatePreferences({ [item.key]: updated[item.key] });
                          setPreferences(result);
                        } catch { toast.error('Failed to update preference'); }
                      }}
                    />
                    <div className="w-9 h-5 bg-border rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-border/50 bg-surface-alt/20 flex justify-end">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
