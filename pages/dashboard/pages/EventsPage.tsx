import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../../types';
import eventsApi, { Event as ApiEvent, EventApplication } from '../../../src/api/events';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useToast } from '../../../src/hooks/useToast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import CalendarView from '../../../components/events/CalendarView';
import {
  Calendar,
  Search,
  Filter,
  RefreshCcw,
  Clock,
  MapPin,
  Users,
  Eye,
  X,
  Video,
  CheckCircle,
  LayoutGrid,
  History,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Pagination from '../../../components/ui/Pagination';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  speaker: string;
  registered: boolean;
  image: string;
  location: string;
  is_online: boolean;
  capacity: number;
  registrations_count: number;
  rawDate: Date;
}

const mapBackendEventToFrontend = (event: ApiEvent): Event => {
  const date = new Date(event.date);
  const eventId = event.id?.toString() || '0';
  return {
    id: eventId,
    title: event.title || 'Untitled Event',
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    type: event.type,
    speaker: event.creator?.full_name || 'Blockchain Oracle',
    registered: event.is_registered,
    image: event.image_url || `https://images.unsplash.com/photo-1540575861501-7ad058df3212?auto=format&fit=crop&q=80&w=400`,
    location: event.location || event.event_url || 'Online',
    is_online: event.is_online,
    capacity: event.capacity || 100,
    registrations_count: event.registrations_count || 0,
    rawDate: date,
  };
};

const CALENDAR_PAGE_SIZE = 200;

const EventsPage: React.FC<{ user: User | null }> = ({ user }) => {
  const [filter, setFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [attendedCount, setAttendedCount] = useState(0);
  const [pastCount, setPastCount] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);
  const pageSize = 12;
  const toast = useToast();

  const loadEvents = useCallback(async (pageToLoad = currentPage) => {
    try {
      setLoading(true);
      const typeParam = filter === 'all' ? undefined : filter;

      if (timeFilter === 'all') {
        const [upcomingRes, pastRes, applications] = await Promise.all([
          eventsApi.getUpcomingEvents(1, 999, typeParam),
          eventsApi.getPastEvents(1, 999, typeParam),
          eventsApi.getMyRegistrations(),
        ]);

        const allResults = [...upcomingRes.results, ...pastRes.results];
        allResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const start = (pageToLoad - 1) * pageSize;
        const paginated = allResults.slice(start, start + pageSize);

        setEvents(paginated.map(mapBackendEventToFrontend));
        setTotalItems(allResults.length);
        setAttendedCount(applications.results.filter(a => a.status === 'accepted').length);
        setUpcomingCount(upcomingRes.count);
        setPastCount(pastRes.count);
      } else {
        const dataPromise = timeFilter === 'upcoming'
          ? eventsApi.getUpcomingEvents(pageToLoad, pageSize, typeParam)
          : eventsApi.getPastEvents(pageToLoad, pageSize, typeParam);

        const [data, applications] = await Promise.all([
          dataPromise,
          eventsApi.getMyRegistrations(),
        ]);

        setEvents(data.results.map(mapBackendEventToFrontend));
        setTotalItems(data.count);
        setAttendedCount(applications.results.filter(a => a.status === 'accepted').length);

        try {
          const [upcomingData, pastData] = await Promise.all([
            eventsApi.getUpcomingEvents(1, 1),
            eventsApi.getPastEvents(1, 1),
          ]);
          setUpcomingCount(upcomingData.count);
          setPastCount(pastData.count);
        } catch (statsError) {
          console.warn('Failed to load event stats counts:', statsError);
        }
      }
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [filter, timeFilter, pageSize, toast]);

  useEffect(() => {
    loadEvents(currentPage);
  }, [currentPage, loadEvents]);

  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, filter]);

  const loadCalendarEvents = useCallback(async () => {
    try {
      const typeParam = filter === 'all' ? undefined : filter;

      if (timeFilter === 'all') {
        const [upcomingRes, pastRes] = await Promise.all([
          eventsApi.getUpcomingEvents(1, CALENDAR_PAGE_SIZE, typeParam),
          eventsApi.getPastEvents(1, CALENDAR_PAGE_SIZE, typeParam),
        ]);

        const allResults = [...upcomingRes.results, ...pastRes.results];
        allResults.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setCalendarEvents(allResults.map(mapBackendEventToFrontend));
      } else {
        const dataPromise = timeFilter === 'upcoming'
          ? eventsApi.getUpcomingEvents(1, CALENDAR_PAGE_SIZE, typeParam)
          : eventsApi.getPastEvents(1, CALENDAR_PAGE_SIZE, typeParam);

        const data = await dataPromise;
        setCalendarEvents(data.results.map(mapBackendEventToFrontend));
      }
    } catch (error) {
      console.error('Failed to load calendar events:', error);
    }
  }, [filter, timeFilter]);

  const handleRegister = async (id: string) => {
    try {
      const response = await eventsApi.registerForEvent(parseInt(id));

      if (response && typeof response.authorization_url === 'string') {
        sessionStorage.setItem('pending_payment_context', JSON.stringify({
          type: 'event', reference: response.reference, eventId: parseInt(id), next: '/dashboard/registrations',
        }));
        window.location.assign(response.authorization_url);
        return;
      }

      setEvents(events.map(e => e.id === id ? { ...e, registered: true } : e));
      setCalendarEvents(prev => prev.map(e => e.id === id ? { ...e, registered: true } : e));
      toast.success('Event registration completed.');
    } catch (error) {
      toast.error('Failed to register for event.');
    }
  };

  const filteredEvents = events.filter(e => {
    const query = (searchQuery || '').toLowerCase();
    return (e.title || '').toLowerCase().includes(query) ||
           (e.speaker || '').toLowerCase().includes(query) ||
           (e.type || '').toLowerCase().includes(query);
  });

  const totalPages = Math.ceil(totalItems / pageSize);

  const getEventTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'webinar': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'workshop': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'conference': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'meetup': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'bootcamp': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'seminar': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'hackathon': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'panel': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'networking': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default: return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    }
  };

  const isPast = (date: Date) => date < new Date();

  return (
    <div className="space-y-6 pb-20 lg:space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text">Events</h1>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-text-secondary">Workshops & webinars</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => loadEvents(currentPage)} className="h-10 px-3 text-xs">
          <RefreshCcw className={cn("h-4 w-4 mr-1.5", loading && "animate-spin")} />
          <span className="hidden xs:inline">Refresh</span>
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'All Events', value: upcomingCount + pastCount, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-500/10' },
          { label: 'Upcoming', value: upcomingCount, icon: ArrowRight, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Past', value: pastCount, icon: History, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Attended', value: attendedCount, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-surface/50 backdrop-blur-sm p-3 rounded-2xl border border-border shadow-md hover:shadow-xl">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", stat.bg)}>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </div>
            <p className="text-lg font-black text-text">{stat.value}</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* TIME FILTER PILLS */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { key: 'all', label: 'All Time' },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past Events' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTimeFilter(t.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all",
              timeFilter === t.key
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-surface-alt text-text hover:bg-surface-hover"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SEARCH & TYPE FILTERS */}
      <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 sm:h-11 w-full text-xs sm:text-sm bg-surface-alt/50 border-border focus:ring-1 text-text placeholder:text-text-secondary"
            />
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="h-10 sm:h-11 px-4 text-xs gap-1.5"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Type</span>
          </Button>
        </div>

        <div className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          showFilters ? "max-h-48 mt-3 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="flex flex-wrap gap-2">
            {['all', 'meetup', 'bootcamp', 'seminar', 'conference', 'workshop', 'hackathon', 'webinar', 'panel', 'networking', 'other'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wider transition-all",
                  filter === f
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-surface-alt text-text hover:bg-surface-hover"
                )}
              >
                {f}
              </button>
            ))}
            {(filter !== 'all' || searchQuery) && (
              <Button variant="ghost" size="sm" className="h-9 px-3 text-[11px]" onClick={() => {setFilter('all'); setSearchQuery('');}}>
                <X className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* TABS: List / Calendar */}
      <Tabs defaultValue="list" onValueChange={(v) => v === 'calendar' && loadCalendarEvents()} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list" className="text-xs gap-1.5">
              <LayoutGrid className="h-3.5 w-3.5" /> List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Calendar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {loading && events.length === 0 ? (
              <div className="col-span-full py-12 flex justify-center"><RefreshCcw className="h-10 w-10 animate-spin text-purple-600" /></div>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const past = isPast(event.rawDate);
                return (
                  <div
                    key={event.id}
                    className={cn(
                      "bg-surface/80 backdrop-blur-md border rounded-xl shadow-md hover:shadow-xl flex flex-col h-full active:scale-[0.99] transition-all",
                      past ? "border-border/30 opacity-70 hover:opacity-100" : "border-border/50"
                    )}
                  >
                    <div className="relative p-4 pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {past && (
                              <Badge variant="secondary" className="px-2 py-0.5 text-[9px] font-semibold uppercase bg-gray-500/20 text-gray-400 border-none">Past</Badge>
                            )}
                            {event.registered && !past && <Badge variant="success" className="px-2 py-0.5 text-[9px] font-semibold uppercase">Going</Badge>}
                            <Badge className={cn("px-2 py-0.5 text-[9px] font-semibold uppercase border-none", getEventTypeColor(event.type))}>
                              {event.type}
                            </Badge>
                          </div>
                          <h3 className="line-clamp-2 text-sm font-semibold tracking-tight text-text">{event.title}</h3>
                          <p className="mt-0.5 text-xs text-text-secondary line-clamp-1">With {event.speaker}</p>
                        </div>
                        <div className="shrink-0">
                          <img
                            src={event.image}
                            alt=""
                            className="h-16 w-16 rounded-lg object-cover border border-border/50 sm:h-20 sm:w-20"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-3 flex-1 flex flex-col justify-between">
                      <div className="mb-3 space-y-2">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-secondary">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-teal-500" />
                            {event.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-teal-500" />
                            {event.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                          {event.is_online ? <Video className="h-3 w-3 text-teal-500" /> : <MapPin className="h-3 w-3 text-teal-500" />}
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
                          <div className="text-[10px] font-semibold text-text">
                            {event.registrations_count}/{event.capacity} <span className="text-text-muted font-medium">spots</span>
                          </div>
                          {past ? (
                            <Link to={`/dashboard/events/${event.id}`}>
                              <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5">
                                <Eye className="h-3.5 w-3.5" /> Recap
                              </Button>
                            </Link>
                          ) : event.registered ? (
                            <Link to={`/dashboard/events/${event.id}`}>
                              <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5">
                                <Eye className="h-3.5 w-3.5" /> Details
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              size="sm"
                              className="h-9 px-4 text-xs font-semibold text-white"
                              onClick={() => handleRegister(event.id)}
                            >
                              Register
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16 bg-surface/80 backdrop-blur-md border-2 border-dashed border-border/50 rounded-xl">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-text-muted opacity-20" />
                <p className="text-sm font-semibold tracking-tight text-text">
                  {timeFilter === 'past' ? 'No past events found' : timeFilter === 'upcoming' ? 'No upcoming events' : 'No events found'}
                </p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView
            events={calendarEvents}
            onRegister={handleRegister}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventsPage;
