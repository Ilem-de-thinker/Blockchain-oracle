import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import eventsApi, { Event } from '../../../src/api/events';
import { getErrorMessage } from '../../../src/api/errorHandler';

const DeleteEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const basePath = location.pathname.startsWith('/tutor')
    ? '/tutor'
    : location.pathname.startsWith('/super-admin')
      ? '/super-admin'
      : '/admin';
  const currentUser = React.useMemo(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;

    try {
      const parsed = JSON.parse(stored) as { id?: number | string; email?: string };
      return {
        id: parsed.id ? Number(parsed.id) : null,
        email: parsed.email?.toLowerCase() || null,
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const loadEvent = async () => {
      if (!id) return;
      try {
        const data = await eventsApi.getEvent(parseInt(id, 10));
        if (data && currentUser) {
          const canManage =
            (currentUser.id !== null &&
              (data.creator.id === currentUser.id || data.organizers.some((organizer) => organizer.id === currentUser.id))) ||
            (currentUser.email !== null &&
              (data.creator.email.toLowerCase() === currentUser.email ||
                data.organizers.some((organizer) => organizer.email.toLowerCase() === currentUser.email)));

          if (!canManage) {
            setError('Only an event organizer can delete this event.');
          }
        }
        setEvent(data);
      } catch (error) {
        console.error('Failed to load event for delete:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  const handleDelete = async () => {
    if (!id || error) return;
    setDeleting(true);
    try {
      await eventsApi.deleteEvent(parseInt(id, 10));
      navigate(`${basePath}/events`);
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      setError(getErrorMessage(error) || 'Failed to delete event.');
      setDeleting(false);
    }
  };

  if (loading) return <div className="rounded-3xl bg-surface p-8 text-sm text-text-muted shadow-sm">Loading event...</div>;

  return (
    <div className="rounded-3xl border border-red-200 bg-surface p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-600">Delete Event</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-text">{event?.title || 'Event'}</h1>
      <p className="mt-3 max-w-2xl text-sm text-text-secondary">This permanently removes the event from the current workspace.</p>
      {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={handleDelete} disabled={deleting || !!error} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {deleting ? 'Deleting...' : 'Delete Event'}
        </button>
        <Link to={`${basePath}/events/${id}`} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-bg">
          Back to Event
        </Link>
      </div>
    </div>
  );
};

export default DeleteEventPage;
