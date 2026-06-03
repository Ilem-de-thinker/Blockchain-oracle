import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/types';
import eventsApi, { Event as ApiEvent } from '@/src/api/events';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/src/hooks/useToast';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';

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
  };
};

const EventsPage: React.FC<{ user: User | null }> = ({ user }) => {
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [attendedCount, setAttendedCount] = useState(0);
  const pageSize = 12;
  const toast = useToast();

  const loadEvents = useCallback(async (pageToLoad = currentPage) => {
    try {
      setLoading(true);
      const typeParam = filter === 'all' ? undefined : filter;
      const [data, applications] = await Promise.all([
        eventsApi.getEvents(pageToLoad, pageSize, typeParam),
        eventsApi.getMyRegistrations(),
      ]);
      setEvents(data.results.map(mapBackendEventToFrontend));
      setTotalItems(data.count);
      setAttendedCount(applications.results.filter(a => a.status === 'accepted').length);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, [filter, pageSize, toast]);

  useEffect(() => {
    loadEvents(currentPage);
  }, [currentPage, loadEvents]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

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
      default: return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    }
  };

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
          { label: 'Total', value: totalItems, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-500/10' },
          { label: 'Going', value: events.filter(e => e.registered).length, icon: Users, color: 'text-teal-500', bg: 'bg-teal-500/10' },
          { label: 'Attended', value: attendedCount, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Open', value: totalItems - events.filter(e => e.registered).length, icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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

      {/* SEARCH & FILTERS */}
      <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl p-3 sm:p-4 shadow-md hover:shadow-xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery as any, e.target.value)}
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
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>

        <div className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          showFilters ? "max-h-24 mt-3 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="flex flex-wrap gap-2">
            {['all', 'webinar', 'workshop', 'conference'].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(setFilter, f)}
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
              <Button variant="ghost" size="sm" className="h-9 px-3 text-[11px]" onClick={() => {setFilter('all'); setSearchQuery(''); setCurrentPage(1);}}>
                <X className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* EVENTS GRID */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading && events.length === 0 ? (
          <div className="col-span-full py-12 flex justify-center"><RefreshCcw className="h-10 w-10 animate-spin text-purple-600" /></div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div key={event.id} className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-md hover:shadow-xl flex flex-col h-full active:scale-[0.99] transition-all">
              <div className="relative p-4 pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {event.registered && <Badge variant="success" className="px-2 py-0.5 text-[9px] font-semibold uppercase">Going</Badge>}
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
                    {event.registered ? (
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
          ))
        ) : (
          <div className="col-span-full text-center py-16 bg-surface/80 backdrop-blur-md border-2 border-dashed border-border/50 rounded-xl">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-text-muted opacity-20" />
            <p className="text-sm font-semibold tracking-tight text-text">No events found</p>
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
    </div>
  );
};

export default EventsPage;
