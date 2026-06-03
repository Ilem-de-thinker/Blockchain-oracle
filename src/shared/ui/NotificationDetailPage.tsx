import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Trash2, ExternalLink, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import notificationsApi, { Notification } from '@/src/api/notifications';
import { useToast } from '@/src/hooks/useToast';

const getBasePath = (pathname: string) => {
  const first = pathname.split('/').filter(Boolean)[0];
  return first ? `/${first}` : '';
};

const formatTimestamp = (iso: string) => {
  if (!iso) return 'N/A';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const typeLabel = (type: string) => {
  const map: Record<string, string> = {
    course: 'Course Update',
    event: 'Event Notice',
    payment: 'Financial Notice',
    achievement: 'Achievement',
    system: 'System Dispatch',
  };
  return map[type] || type;
};

const senderInitial = (notification: Notification) => {
  if (notification.sender_username) return notification.sender_username.charAt(0).toUpperCase();
  return 'S';
};

const containsHTML = (text: string) => /<[a-z][\s\S]*>/i.test(text);

const NotificationDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const notificationId = useMemo(() => Number(id), [id]);
  const basePath = useMemo(() => getBasePath(location.pathname), [location.pathname]);
  const listPath = `${basePath}/notifications`;

  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!Number.isFinite(notificationId)) {
        setError('Invalid notification id.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await notificationsApi.getNotification(notificationId);
        setNotification(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load notification.');
        setNotification(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [notificationId]);

  const markAsRead = async () => {
    if (!notification || notification.is_read) return;
    try {
      setActionLoading(true);
      await notificationsApi.markAsRead(notification.id);
      setNotification({ ...notification, is_read: true });
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to mark as read');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!notification) return;
    setDeleting(true);
    try {
      await notificationsApi.deleteNotification(notification.id);
      toast.success('Notification deleted');
      navigate(listPath, { replace: true });
    } catch {
      toast.error('Failed to delete notification');
      setDeleting(false);
    }
  };

  const confirmDelete = () => {
    if (window.confirm('Delete this notification?')) {
      handleDelete();
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[60vh] bg-bg">
        <div className="flex flex-col items-center gap-3">
          <RefreshCcw className="h-8 w-8 animate-spin text-primary/40" />
          <p className="text-[11px] font-black text-text-muted animate-pulse uppercase tracking-widest leading-none">
            Loading Dispatch
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[60vh] bg-bg p-6">
        <div className="max-w-md w-full space-y-4">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-text-muted hover:text-text hover:bg-surface-hover transition-all"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <Link
              to={listPath}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
            >
              All notifications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[60vh] bg-bg p-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-text-muted">Notification not found.</p>
          <Link
            to={listPath}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
          >
            All notifications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-bg">
      {/* Top App Bar */}
      <header className="w-full h-14 border-b border-border bg-surface px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center font-black text-text-inverse text-[10px] tracking-wider">
            N
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            System Dispatch Center
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
          <span>Status: Active</span>
        </div>
      </header>

      {/* Action Ribbon */}
      <div className="h-14 px-6 border-b border-border flex items-center justify-between shrink-0 bg-surface/50">
        <div className="flex items-center gap-4">
          <Link
            to={listPath}
            className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-text transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Back to Notifications
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-mono text-text-muted hidden sm:inline">
            ID: #{notification.id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!notification.is_read && (
            <button
              onClick={markAsRead}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface hover:bg-surface-hover border border-border text-text-muted text-xs font-bold rounded-xl transition-all"
            >
              {actionLoading ? (
                <RefreshCcw size={14} className="animate-spin" />
              ) : (
                <Check size={14} className="text-primary" />
              )}
              Mark as Read
            </button>
          )}

          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="p-1.5 text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-surface-hover"
            title="Delete Notification"
          >
            {deleting ? (
              <RefreshCcw size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-bg">
        <article className="max-w-3xl mx-auto space-y-8">
          {/* Header Subject Block */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              {!notification.is_read && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/30 uppercase">
                  Unread
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider text-primary bg-primary/10 border border-primary/20 uppercase">
                {typeLabel(notification.type || notification.notification_type || '')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-text tracking-tight leading-tight">
              {notification.title}
            </h1>

            {/* Meta Node Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-b border-border pb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-surface-alt border border-border flex items-center justify-center text-[10px] font-bold text-primary">
                  {senderInitial(notification)}
                </div>
                <div>
                  <span className="text-xs font-bold text-text block leading-none">
                    {notification.sender_username || 'System'}
                  </span>
                  <span className="text-[10px] text-text-muted block mt-1">
                    To: {notification.recipient ? `user #${notification.recipient}` : 'you'}
                  </span>
                </div>
              </div>
              <time className="text-xs text-text-muted font-medium">
                {formatTimestamp(notification.created_at)}
              </time>
            </div>
          </div>

          {/* Message Content — renders HTML or Markdown */}
          <div className="text-sm sm:text-base text-text-secondary leading-relaxed
            prose prose-sm max-w-none
            prose-headings:text-text prose-headings:font-bold
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-text
            prose-code:text-primary prose-code:bg-surface-alt prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
            prose-blockquote:border-l-primary prose-blockquote:bg-surface-alt/50 prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-xl
            prose-li:marker:text-primary
            prose-img:rounded-2xl prose-img:border prose-img:border-border
            prose-pre:bg-surface-alt prose-pre:border prose-pre:border-border
            prose-hr:border-border
          ">
            {containsHTML(notification.message || '')
              ? <div dangerouslySetInnerHTML={{ __html: notification.message || '' }} />
              : <ReactMarkdown remarkPlugins={[remarkGfm]}>{notification.message || 'No message content.'}</ReactMarkdown>
            }
          </div>

          {/* Action URL */}
          {notification.action_url && (
            <div className="rounded-xl border border-border bg-surface/50 p-4 flex items-center justify-between">
              <span className="text-sm text-text-muted truncate">Action Link</span>
              <a
                href={notification.action_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
              >
                Open <ExternalLink size={12} />
              </a>
            </div>
          )}
        </article>
      </main>
    </div>
  );
};

export default NotificationDetailPage;
