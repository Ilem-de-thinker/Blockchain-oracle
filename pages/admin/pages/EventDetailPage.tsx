import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import eventsApi, { Event } from '../../../src/api/events';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Calendar, Clock, ExternalLink, Globe, MapPin, Pencil, Trash2, User, Users } from 'lucide-react';

const formatEventType = (value?: string | null) => {
  if (!value) return 'General';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getEventStatus = (event: Event) => {
  if (event.status) return event.status;
  const eventTime = new Date(event.date).getTime();
  if (Number.isNaN(eventTime)) return 'scheduled';
  return eventTime < Date.now() ? 'completed' : 'scheduled';
};

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'published':
      return 'success';
    case 'completed':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    case 'draft':
      return 'warning';
    default:
      return 'outline';
  }
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
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
        setEvent(data);
      } catch (error) {
        console.error('Failed to load event:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  if (loading) return <div className="rounded-3xl bg-surface p-8 text-sm text-text-muted shadow-sm">Loading event...</div>;
  if (!event) return <div className="rounded-3xl bg-surface p-8 text-sm text-red-600 shadow-sm">Event not found.</div>;

  const status = getEventStatus(event);
  const formattedType = formatEventType(event.type);
  const eventDate = new Date(event.date);
  const isManageable =
    !!currentUser &&
    (
      (currentUser.id !== null &&
        (event.creator.id === currentUser.id || event.organizers.some((organizer) => organizer.id === currentUser.id))) ||
      (currentUser.email !== null &&
        (event.creator.email.toLowerCase() === currentUser.email ||
          event.organizers.some((organizer) => organizer.email.toLowerCase() === currentUser.email)))
    );
  const capacity = typeof event.capacity === 'number' ? event.capacity : null;
  const fillRate = capacity && capacity > 0 ? Math.min(100, (event.registrations_count / capacity) * 100) : null;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-600">Event Detail</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-text">{event.title}</h1>
            <p className="mt-3 max-w-3xl text-sm text-text-secondary">{event.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={getStatusVariant(status)} className="capitalize">{status}</Badge>
              <Badge variant="secondary">{formattedType}</Badge>
              <Badge variant="outline">{event.is_online ? 'Online' : 'In person'}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`${basePath}/events/${event.id}/applications`}>
              <Button variant="outline">Applications</Button>
            </Link>
            {isManageable ? (
              <>
                <Link to={`${basePath}/events/${event.id}/edit`}>
                  <Button><Pencil className="mr-2 h-4 w-4" />Edit</Button>
                </Link>
                <Link to={`${basePath}/events/${event.id}/delete`}>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                    <Trash2 className="mr-2 h-4 w-4" />Delete
                  </Button>
                </Link>
              </>
            ) : (
              <Badge variant="outline">Organizer access required to edit</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Schedule</p>
          <p className="mt-2 text-xl font-black text-text">{eventDate.toLocaleDateString()}</p>
          <p className="mt-1 text-xs text-text-secondary">{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Capacity</p>
          <p className="mt-2 text-2xl font-black text-text">{capacity ?? 'Unset'}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Registrations</p>
          <p className="mt-2 text-2xl font-black text-text">{event.registrations_count}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <p className="text-sm text-text-muted">Fill Rate</p>
          <p className="mt-2 text-2xl font-black text-text">{fillRate !== null ? `${Math.round(fillRate)}%` : 'N/A'}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Event Overview</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-surface-alt/30 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text">
                  <Calendar className="h-4 w-4 text-primary" />
                  Date
                </div>
                <p className="mt-2 text-sm text-text-secondary">{eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-alt/30 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text">
                  <Clock className="h-4 w-4 text-primary" />
                  Time
                </div>
                <p className="mt-2 text-sm text-text-secondary">{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-alt/30 p-4 md:col-span-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-text">
                  {event.is_online ? <Globe className="h-4 w-4 text-blue-500" /> : <MapPin className="h-4 w-4 text-accent" />}
                  {event.is_online ? 'Online Access' : 'Location'}
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {event.is_online ? (event.event_url || 'Online event link not provided.') : (event.location || 'Venue TBD')}
                </p>
                {event.is_online && event.event_url && (
                  <a href={event.event_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    <ExternalLink className="h-4 w-4" />
                    Open event link
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-text">Registration Snapshot</h2>
              <Link to={`${basePath}/events/${event.id}/applications`} className="text-sm font-semibold text-primary hover:underline">
                View applications
              </Link>
            </div>
            <div className="mt-5 rounded-2xl border border-border bg-surface-alt/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-text">Registrations</span>
                <span className="text-text-secondary">
                  {capacity ? `${event.registrations_count}/${capacity}` : `${event.registrations_count} registered`}
                </span>
              </div>
              {fillRate !== null ? (
                <>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${fillRate}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-text-muted">{Math.round(fillRate)}% of available capacity is filled.</p>
                </>
              ) : (
                <p className="mt-3 text-xs text-text-muted">Capacity is not set for this event yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-lg font-bold text-text">Ownership</h2>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border bg-surface-alt/30 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text">
                  <User className="h-4 w-4 text-primary" />
                  Creator
                </div>
                <p className="mt-2 text-sm font-medium text-text">{event.creator.full_name}</p>
                <p className="text-xs text-text-muted">{event.creator.email}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-alt/30 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-text">
                  <Users className="h-4 w-4 text-primary" />
                  Organizers
                </div>
                <div className="mt-3 space-y-3">
                  {event.organizers.length > 0 ? event.organizers.map((organizer) => (
                    <div key={organizer.id} className="border-b border-border/60 pb-3 last:border-b-0 last:pb-0">
                      <p className="text-sm font-medium text-text">{organizer.full_name}</p>
                      <p className="text-xs text-text-muted">{organizer.email}</p>
                    </div>
                  )) : (
                    <p className="text-xs text-text-muted">No additional organizers listed.</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-surface-alt/30 p-4">
                <p className="text-sm font-semibold text-text">Record Metadata</p>
                <p className="mt-2 text-xs text-text-muted">Created: {new Date(event.created_at).toLocaleString()}</p>
                <p className="mt-1 text-xs text-text-muted">Updated: {new Date(event.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
