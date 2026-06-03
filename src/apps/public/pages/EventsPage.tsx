import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import eventsApi, { Event as ApiEvent } from '@/src/api/events';
import Pagination from '@/components/ui/Pagination';
import { authApi } from '@/src/api/auth';
import { useToast } from '@/src/hooks/useToast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'webinar' | 'workshop' | 'conference' | 'meetup';
  image: string;
  registrations: number;
  capacity: number;
  isRegistered: boolean;
  isFree: boolean;
  price?: number;
}

interface EventsPageProps {
  user?: any | null;
}

const mapBackendEventToFrontend = (event: ApiEvent): Event => {
  const date = new Date(event.date);
  const totalFee = (parseFloat(event.registration_fee || '0') + parseFloat(event.event_fee || '0'));
  return {
    id: event.id.toString(),
    title: event.title,
    description: event.description,
    date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    location: event.location,
    type: event.type,
    image: event.image_url || 'https://images.unsplash.com/photo-1540575861501-7ad058df3212?auto=format&fit=crop&q=80&w=800',
    registrations: event.registrations_count,
    capacity: event.capacity,
    isRegistered: event.is_registered,
    isFree: totalFee === 0,
    price: totalFee,
  };
};

const EventsPage: React.FC<EventsPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'webinar' | 'workshop' | 'conference' | 'meetup'>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 9;
  const toast = useToast();
  const isAuthenticated = authApi.isAuthenticated();

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    loadEvents();
  }, [filter, currentPage]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const typeParam = filter === 'all' ? undefined : filter;
      const data = await eventsApi.getEvents(currentPage, pageSize, typeParam);
      setEvents(data.results.map(mapBackendEventToFrontend));
      setTotalItems(data.count);
      setTotalPages(Math.ceil(data.count / pageSize));
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    if (!authApi.isAuthenticated()) {
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const callbackUrl = `${window.location.origin}/dashboard/payment/verify`;
      const response = await eventsApi.registerForEvent(parseInt(eventId), callbackUrl);

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
            eventId: parseInt(eventId),
            next: '/dashboard/registrations',
          })
        );
        window.location.assign(response.authorization_url);
        return;
      }

      setEvents(events.map(e => e.id === eventId ? { ...e, isRegistered: true } : e));
      toast.success('Event registration completed.');
    } catch (error) {
      console.error('Failed to register:', error);
      toast.error('Failed to register for this event.');
    }
  };

  const filteredEvents = events.filter(event => {
    const title = event.title || '';
    const description = event.description || '';
    const query = searchQuery || '';
    const matchesSearch = title.toLowerCase().includes(query.toLowerCase()) ||
                         description.toLowerCase().includes(query.toLowerCase());
    return matchesSearch;
  });

  const upcomingEvents = filteredEvents.filter(e => e.date && new Date(e.date) > new Date());
  const pastEvents = filteredEvents.filter(e => e.date && new Date(e.date) <= new Date());

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, { bg: string; text: string }> = {
      webinar: { bg: '#eff6ff', text: '#3b82f6' },
      workshop: { bg: '#faf5ff', text: '#a855f7' },
      conference: { bg: '#fff7ed', text: '#f97316' },
      meetup: { bg: '#f0fdf4', text: '#22c55e' },
    };
    return typeColors[type] || { bg: '#f3f4f6', text: '#6b7280' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin text-5xl mb-4 text-purple-600"></i>
          <p className="text-lg text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl bg-purple-600"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-3xl bg-purple-600"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-gray-900">
              NETWORK <span className="text-purple-600">EVENTS</span>
            </h1>
            <p className="text-xl text-gray-600">
              Join high-impact technical workshops and strategic webinars focused on the African blockchain ecosystem.
            </p>
          </div>

          {/* Search & Filter */}
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative w-full">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm"></i>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl border-2 focus:outline-none transition-all bg-white border-gray-300 text-gray-900 text-xs sm:text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {(['all', 'webinar', 'workshop', 'conference', 'meetup'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className="px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-shrink-0"
                    style={filter === type ? {
                      background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                      color: '#ffffff',
                      boxShadow: '0 4px 15px rgba(5, 150, 105, 0.4)'
                    } : {
                      backgroundColor: '#ffffff',
                      border: '2px solid #e5e7eb',
                      color: '#374151'
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              <i className="fas fa-calendar-alt mr-3 text-purple-600"></i>
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{
                            backgroundColor: getTypeColor(event.type).bg,
                            color: getTypeColor(event.type).text
                          }}>
                            {event.type}
                          </span>
                          {event.isRegistered && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                              Registered
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{event.title}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{event.description}</p>
                      </div>
                      <div className="shrink-0">
                        <img
                          src={event.image}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover border border-gray-200 md:h-20 md:w-20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-calendar text-purple-600"></i>
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-clock text-purple-600"></i>
                          {event.time}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <i className="fas fa-map-marker-alt text-purple-600"></i>
                            <span className="truncate">{event.location}</span>
                          </span>
                        )}
                      </div>
                      {event.isFree !== undefined && (
                        <div className="text-[10px] font-semibold text-gray-700">
                          {event.isFree ? 'Free' : `₦${event.price}`}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 text-gray-500">
                          <span>Seats filled</span>
                          <span>{event.registrations}/{event.capacity}</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden bg-gray-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((event.registrations / Math.max(event.capacity, 1)) * 100, 100)}%`,
                              background: 'linear-gradient(to right, #7c3aed, #6d28d9)'
                            }}
                          ></div>
                        </div>
                      </div>

                      {event.isRegistered ? (
                        <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wider">
                          <i className="fas fa-check-circle"></i>
                          Registered
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegister(event.id)}
                          className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg text-white"
                          style={{
                            background: 'linear-gradient(to right, #7c3aed, #6d28d9)',
                          }}
                        >
                          {event.isFree ? 'Get Free Ticket' : `Get Ticket - ₦${event.price}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              <i className="fas fa-history mr-3 text-gray-500"></i>
              Past Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 transition-all duration-300 flex flex-col opacity-75 hover:opacity-100"
                >
                  <div className="p-4 pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-500">
                            Ended
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2">{event.title}</h3>
                      </div>
                      <div className="shrink-0 grayscale">
                        <img
                          src={event.image}
                          alt=""
                          className="h-14 w-14 rounded-lg object-cover border border-gray-200 md:h-16 md:w-16"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 mb-3">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-calendar text-gray-400"></i>
                          {event.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-clock text-gray-400"></i>
                          {event.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{event.description}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {event.registrations} attended
                      </span>
                      <button className="text-xs font-bold uppercase tracking-wider hover:underline text-purple-600">
                        View Recording →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-purple-50">
              <i className="fas fa-calendar-times text-4xl text-purple-600"></i>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">No events found</h3>
            <p className="text-lg mb-6 text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'Check back soon for upcoming events'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all text-white"
                style={{
                  background: 'linear-gradient(to right, #7c3aed, #6d28d9)'
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        </section>
      )}

      {/* Pagination */}
      {!loading && events.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        </section>
      )}

      {/* Newsletter CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-700">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white blur-2xl"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white blur-2xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Never Miss an Event
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Get notified about upcoming workshops, webinars, and conferences directly in your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none"
                />
                <button className="px-8 py-4 rounded-xl bg-white font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-colors text-purple-600">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default EventsPage;
