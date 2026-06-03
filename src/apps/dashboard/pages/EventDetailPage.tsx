import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User } from '@/types';
import eventsApi, { Event, EventApplication } from '@/src/api/events';
import { ButtonLink } from '@/components/ui/button-link';
import { ThemeLink } from '@/components/ui/theme-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/src/hooks/useToast';
import {
  Calendar,
  MapPin,
  Video,
  Users,
  Clock,
  ArrowLeft,
  ExternalLink,
  UserCircle,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const EventDetailPage: React.FC<{ user: User | null }> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [registration, setRegistration] = useState<EventApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (!id || id === 'undefined') {
      setError('Invalid event ID.');
      setLoading(false);
      return;
    }
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      setError('Invalid event ID.');
      setLoading(false);
      return;
    }
    loadEvent(eventId);
  }, [id]);

  const loadEvent = async (eventId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const eventData = await eventsApi.getEvent(eventId);

      if (eventData) {
        setEvent(eventData);
        // Fetch registrations separately to check if user is already registered
        try {
          const registrationsData = await eventsApi.getMyRegistrations(1, 100);
          const userRegistration = registrationsData.results.find(
            (reg) => reg.event.id === eventId
          );
          setRegistration(userRegistration || null);
        } catch (regErr) {
          console.error('Failed to load registrations:', regErr);
        }
      } else {
        setError('Event not found.');
      }
    } catch (err) {
      setError('Failed to load event details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!event) return;
    try {
      setRegistering(true);
      const callbackUrl = `${window.location.origin}/dashboard/payment/verify`;
      const response = await eventsApi.registerForEvent(event.id, callbackUrl);

      if (response && typeof response.authorization_url === 'string') {
        sessionStorage.setItem('pending_payment_context', JSON.stringify({
          type: 'event', reference: response.reference, eventId: event.id, next: `/dashboard/events/${event.id}`,
        }));
        window.location.assign(response.authorization_url);
        return;
      }

      toast.success('Event registration completed.');
      loadEvent(event.id);
    } catch (err: any) {
      toast.error(err.message || 'Failed to register for event.');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'approved':
        return <Badge variant="success" className="text-xs font-bold uppercase"><CheckCircle2 className="h-3 w-3 mr-1" />Accepted</Badge>;
      case 'pending':
      case 'under_review':
        return <Badge variant="warning" className="text-xs font-bold uppercase"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs font-bold uppercase"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-xs font-bold uppercase">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-text-secondary">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">
          <XCircle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
        <Button variant="ghost" onClick={() => navigate('/dashboard/registrations')} className="text-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Events
        </Button>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-bg p-4 sm:p-6 lg:p-8">
      <div className="space-y-6 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
        <ThemeLink to="/dashboard" className="hover:text-primary">Dashboard</ThemeLink>
        <span>/</span>
        <ThemeLink to="/dashboard/registrations" className="hover:text-primary">My Events</ThemeLink>
        <span>/</span>
        <span className="text-text font-medium truncate max-w-[200px]">{event.title}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-md hover:shadow-xl">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-black text-text tracking-tight uppercase">{event.title}</h1>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Badge className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-3 py-1",
              event.type === 'webinar' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
              event.type === 'workshop' && "bg-purple-600/10 text-purple-500 border-purple-600/20",
              event.type === 'conference' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
            )}>
              {event.type}
            </Badge>
            <Badge variant={event.status === 'published' ? 'success' : 'outline'} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1">
              {event.status}
            </Badge>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/registrations')} className="shrink-0 rounded-xl font-bold uppercase text-[10px] tracking-widest px-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          {event.image_url && (
            <div className="rounded-3xl overflow-hidden border border-border h-64 md:h-80 shadow-md">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Description */}
          <div className="bg-surface rounded-3xl border border-border p-8 shadow-md hover:shadow-xl">
            <h2 className="text-xl font-black text-text mb-5 uppercase tracking-tight">About This Event</h2>
            <p className="text-sm text-text-secondary leading-loose whitespace-pre-wrap font-medium">{event.description}</p>
          </div>

          {/* Organizers */}
          <div className="bg-surface rounded-3xl border border-border p-8 shadow-md hover:shadow-xl">
            <h2 className="text-xl font-black text-text mb-6 flex items-center gap-3 uppercase tracking-tight">
              <Users className="h-6 w-6 text-primary" />
              Organizers
            </h2>
            <div className="space-y-4">
              {event.organizers.map((org) => (
                <div key={org.id} className="flex items-center gap-4 p-4 bg-surface-alt/30 rounded-2xl border border-border/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10">
                    <UserCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-text truncate uppercase">{org.full_name}</p>
                    <p className="text-xs text-text-secondary truncate font-medium">{org.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Info Card */}
          <div className="bg-surface rounded-3xl border border-border p-8 shadow-md hover:shadow-xl space-y-6">
            <h2 className="text-sm font-black text-text border-b border-border pb-4 uppercase tracking-widest">Event Details</h2>

            <div className="space-y-5 text-sm">
              <div className="flex items-start gap-4">
                <Calendar className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-black text-text text-sm uppercase tracking-tight">{formatDate(event.date)}</p>
                  <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">{formatTime(event.date)}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                {event.is_online ? (
                  <Video className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                ) : (
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="font-black text-text text-sm uppercase tracking-tight">{event.is_online ? 'Online Event' : 'In-Person'}</p>
                  {event.is_online ? (
                    event.event_url && (
                      <a href={event.event_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 font-bold uppercase tracking-widest mt-1">
                        Join Event <ExternalLink className="h-3 w-3" />
                      </a>
                    )
                  ) : (
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">{event.location}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-black text-text text-sm uppercase tracking-tight">{event.registrations_count} registered</p>
                  <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">of {event.capacity} capacity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Status */}
          <div className="bg-surface rounded-3xl border border-border p-8 shadow-md hover:shadow-xl space-y-6">
            <h2 className="text-sm font-black text-text border-b border-border pb-4 uppercase tracking-widest">Registration</h2>

            {registration ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Status</span>
                  {getStatusBadge(registration.status)}
                </div>
                <div className="pt-3">
                  <ButtonLink
                    to={`/dashboard/registrations/${registration.id}`}
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl font-black uppercase text-[10px] tracking-widest h-10"
                  >
                    View Registration Details
                  </ButtonLink>
                </div>
              </div>
            ) : event.is_registered ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-black uppercase tracking-tight">You're registered!</span>
                </div>
                <ButtonLink
                  to="/dashboard/registrations"
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl font-black uppercase text-[10px] tracking-widest h-10"
                >
                  View My Registrations
                </ButtonLink>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-text-secondary font-medium">You haven't registered for this event yet.</p>
                <Button
                  onClick={handleRegister}
                  disabled={registering}
                  className="w-full rounded-xl font-black uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-primary/20"
                >
                  {registering ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Registering...
                    </>
                  ) : (
                    'Register Now'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default EventDetailPage;
