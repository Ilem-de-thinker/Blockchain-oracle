import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import eventsApi, { Event as ApiEvent } from '@/src/api/events';
import { authApi } from '@/src/api/auth';
import { useToast } from '@/src/hooks/useToast';

const typeConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  webinar: { label: 'Webinar', bg: 'bg-blue-100', text: 'text-blue-700', icon: 'fas fa-video' },
  workshop: { label: 'Workshop', bg: 'bg-purple-100', text: 'text-purple-700', icon: 'fas fa-tools' },
  conference: { label: 'Conference', bg: 'bg-orange-100', text: 'text-orange-700', icon: 'fas fa-users' },
  meetup: { label: 'Meetup', bg: 'bg-green-100', text: 'text-green-700', icon: 'fas fa-handshake' },
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [event, setEvent] = useState<ApiEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  const isAuthenticated = authApi.isAuthenticated();

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await eventsApi.getEvent(parseInt(id));
        if (!data) {
          setError('Event not found');
          return;
        }
        setEvent(data);
      } catch (err) {
        setError('Failed to load event details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    if (!event) return;

    setRegistering(true);
    try {
      const callbackUrl = `${window.location.origin}/dashboard/payment/verify`;
      const response = await eventsApi.registerForEvent(event.id, callbackUrl);

      if (
        response &&
        typeof response === 'object' &&
        'authorization_url' in response &&
        typeof response.authorization_url === 'string' &&
        'reference' in response &&
        typeof response.reference === 'string'
      ) {
        sessionStorage.setItem(
          'pending_payment_context',
          JSON.stringify({
            type: 'event',
            reference: response.reference,
            eventId: event.id,
            next: '/dashboard/registrations',
          })
        );
        window.location.assign(response.authorization_url);
        return;
      }

      setEvent({ ...event, is_registered: true });
      toast.success('Event registration completed.');
    } catch (err) {
      console.error('Failed to register:', err);
      toast.error('Failed to register for this event.');
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const calcFee = (event: ApiEvent) => {
    const total = parseFloat(event.registration_fee || '0') + parseFloat(event.event_fee || '0');
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-500 text-sm mb-6">{error || 'The event you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/events')}
            className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg transition-all"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const fee = calcFee(event);
  const typeInfo = typeConfig[event.type] || typeConfig.conference;
  const seatsLeft = event.capacity - event.registrations_count;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <button onClick={() => navigate('/events')} className="hover:text-emerald-600 transition-colors">Events</button>
            </li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-xs">{event.title}</li>
          </ol>
        </nav>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100"
        >
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Content */}
            <div className="p-8 md:p-10 flex flex-col justify-between order-2 lg:order-1">
              <div className="space-y-6">
                {/* Badges */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`${typeInfo.bg} ${typeInfo.text} text-sm px-4 py-1 rounded-full font-medium`}>
                    <i className={`${typeInfo.icon} mr-1.5`}></i>
                    {typeInfo.label}
                  </span>
                  {event.is_online ? (
                    <span className="bg-teal-100 text-teal-700 text-sm px-4 py-1 rounded-full">
                      <i className="fas fa-globe mr-1.5"></i>Online
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-700 text-sm px-4 py-1 rounded-full">
                      <i className="fas fa-map-marker-alt mr-1.5"></i>In-Person
                    </span>
                  )}
                  {!isPast && seatsLeft > 0 && seatsLeft <= 20 && (
                    <span className="bg-rose-100 text-rose-700 text-sm px-4 py-1 rounded-full font-medium animate-pulse">
                      Only {seatsLeft} {seatsLeft === 1 ? 'seat' : 'seats'} left
                    </span>
                  )}
                  {isPast && (
                    <span className="bg-gray-100 text-gray-500 text-sm px-4 py-1 rounded-full">
                      Past Event
                    </span>
                  )}
                </div>

                {/* Title & Host */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900">
                    {event.title}
                  </h1>
                  <p className="text-gray-500 mt-3 text-lg">
                    <i className="fas fa-user mr-2 text-emerald-600"></i>
                    Hosted by {event.creator?.full_name || event.creator?.username || 'Unknown'}
                  </p>
                  {event.location && (
                    <p className="text-gray-500 mt-1">
                      <i className="fas fa-map-marker-alt mr-2 text-emerald-600"></i>
                      {event.location}
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 leading-7">{event.description}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date</p>
                    <h3 className="font-bold text-gray-900 mt-1 text-sm leading-tight">{formatDate(event.date)}</h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Time</p>
                    <h3 className="font-bold text-gray-900 mt-1 text-lg">{formatTime(event.date)}</h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Attendees</p>
                    <h3 className="font-bold text-gray-900 mt-1 text-lg">
                      {event.registrations_count}<span className="text-sm text-gray-400 font-normal">/{event.capacity}</span>
                    </h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Price</p>
                    <h3 className="font-bold text-gray-900 mt-1 text-lg">
                      {fee === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        `₦${fee.toLocaleString()}`
                      )}
                    </h3>
                  </div>
                </div>

                {/* Capacity Bar */}
                {!isPast && event.capacity > 0 && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                      <span>Capacity</span>
                      <span>
                        {event.registrations_count} registered{' '}
                        {seatsLeft > 0 ? `(${seatsLeft} ${seatsLeft === 1 ? 'spot' : 'spots'} left)` : '(Full)'}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((event.registrations_count / Math.max(event.capacity, 1)) * 100, 100)}%`,
                          background: seatsLeft <= 10
                            ? 'linear-gradient(to right, #ef4444, #dc2626)'
                            : 'linear-gradient(to right, #059669, #0d9488)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-4 mt-10 flex-wrap pt-6 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ticket Price</p>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {fee === 0 ? <span className="text-emerald-600">Free</span> : `₦${fee.toLocaleString()}`}
                  </h2>
                </div>
                {!isPast ? (
                  event.is_registered ? (
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl font-bold">
                      <i className="fas fa-check-circle"></i>
                      Registered
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      disabled={registering || seatsLeft <= 0}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-white px-8 py-4 rounded-2xl font-bold shadow-md hover:shadow-lg"
                    >
                      {registering ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </span>
                      ) : seatsLeft <= 0 ? (
                        'Sold Out'
                      ) : isAuthenticated ? (
                        'Reserve Seat'
                      ) : (
                        'Login to Register'
                      )}
                    </button>
                  )
                ) : (
                  <div className="px-6 py-4 rounded-2xl bg-gray-100 text-gray-500 font-bold">
                    Event Ended
                  </div>
                )}
              </div>
            </div>

            {/* Image */}
            <div className="order-1 lg:order-2 h-full min-h-[320px] relative">
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                  <i className="fas fa-calendar-alt text-white/30 text-8xl"></i>
                </div>
              )}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default EventDetailPage;
