import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import eventsApi, { Event as ApiEvent } from '../../../src/api/events';
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell 
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useToast } from '../../../src/hooks/useToast';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  X,
  Users,
  MapPin,
  Clock,
  Globe,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { ReportActions } from '../../../components/ui/ReportActions';

interface Event {
  id: string;
  title: string;
  date: string;
  registrations: number;
  capacity: number | null;
  status: string;
  type: string;
  location?: string;
  isOnline: boolean;
  creatorId: number;
  creatorEmail: string;
  organizerIds: number[];
  organizerEmails: string[];
}

const formatEventType = (value?: string | null) => {
  if (!value) return 'General';
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const deriveEventStatus = (event: ApiEvent) => {
  if (event.status) return event.status;

  const eventTime = new Date(event.date).getTime();
  if (Number.isNaN(eventTime)) return 'scheduled';

  return eventTime < Date.now() ? 'completed' : 'scheduled';
};

const mapBackendEventToFrontend = (event: ApiEvent): Event => {
  return {
    id: event.id.toString(),
    title: event.title,
    date: event.date,
    registrations: event.registrations_count ?? 0,
    capacity: typeof event.capacity === 'number' ? event.capacity : null,
    status: deriveEventStatus(event),
    type: formatEventType(event.type),
    location: event.location || event.event_url || undefined,
    isOnline: event.is_online,
    creatorId: event.creator.id,
    creatorEmail: event.creator.email,
    organizerIds: event.organizers.map((organizer) => organizer.id),
    organizerEmails: event.organizers.map((organizer) => organizer.email),
  };
};

interface AdminEventsPageProps {
  initialType?: string;
  title?: string;
  subtitle?: string;
}

const AdminEventsPage: React.FC<AdminEventsPageProps> = ({
  initialType = '',
  title = 'Events Management',
  subtitle = 'Schedule and monitor platform-wide webinars and workshops'
}) => {
  const location = useLocation();
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useLocalStorage('admin_events_search', '');
  const [statusFilter, setStatusFilter] = useLocalStorage('admin_events_status_filter', '');
  const [typeFilter, setTypeFilter] = useLocalStorage('admin_events_type_filter', initialType);
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
  
  const basePath = location.pathname.startsWith('/tutor')
    ? '/tutor'
    : location.pathname.startsWith('/super-admin')
      ? '/super-admin'
      : '/admin';

  useEffect(() => {
    loadEvents();
  }, [statusFilter, typeFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getEvents(1, 100, typeFilter || undefined);
      let mapped = data.results.map(mapBackendEventToFrontend);
      if (statusFilter) {
        mapped = mapped.filter(e => e.status === statusFilter);
      }
      setEvents(mapped);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventsApi.deleteEvent(parseInt(id));
      setEvents(events.filter(e => e.id !== id));
      toast.success('Event deleted successfully');
    } catch (error: any) {
      if (error?.response?.status === 403) {
        toast.error('Only an event organizer can delete this event.');
        return;
      }
      toast.error('Failed to delete event');
    }
  };

  const canManageEvent = (event: Event) => {
    if (!currentUser) return false;

    const matchesId = currentUser.id !== null && (
      event.creatorId === currentUser.id || event.organizerIds.includes(currentUser.id)
    );
    const matchesEmail = currentUser.email !== null && (
      event.creatorEmail.toLowerCase() === currentUser.email ||
      event.organizerEmails.some((email) => email.toLowerCase() === currentUser.email)
    );

    return matchesId || matchesEmail;
  };

  const getStatusVariant = (status: string): any => {
    switch (status?.toLowerCase()) {
      case 'published': return 'success';
      case 'scheduled': return 'outline';
      case 'draft': return 'warning';
      case 'cancelled': return 'destructive';
      case 'completed': return 'secondary';
      default: return 'outline';
    }
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <i className="fas fa-circle-notch fa-spin text-4xl text-primary"></i>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">{title}</h1>
          <p className="text-sm text-text-muted">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <ReportActions />
          <Link to={`${basePath}/events/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface rounded-2xl p-4 border border-border">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <Input
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-11 rounded-xl border border-border bg-surface px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Types</option>
              <option value="meetup">Meetup</option>
              <option value="bootcamp">Bootcamp</option>
              <option value="seminar">Seminar</option>
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="hackathon">Hackathon</option>
              <option value="webinar">Webinar</option>
              <option value="panel">Panel</option>
              <option value="networking">Networking</option>
              <option value="other">Other</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-xl border border-border bg-surface px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>

            <Button variant="secondary" onClick={loadEvents}>
              <Filter className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        <Table variant="striped">
          <TableHeader>
            <TableRow className="bg-surface-alt/50">
              <TableHead>Event Details</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Calendar className="h-10 w-10 text-text-muted opacity-20 mb-2" />
                    <p className="text-text-muted font-medium">No events found</p>
                    <p className="text-[10px] text-text-muted/60 mt-1">Try changing your filters or create a new event.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <i className={`fas ${event.type.toLowerCase() === 'webinar' ? 'fa-video' : 'fa-users'} text-primary`}></i>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-text truncate group-hover:text-primary transition-colors">
                          {event.title}
                        </p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-black mt-0.5">
                          {event.type}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-text font-medium">
                        <Calendar size={12} className="text-primary" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <Clock size={10} />
                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      {event.isOnline ? (
                        <><Globe size={12} className="text-blue-500" /> {event.location || 'Online event'}</>
                      ) : (
                        <><MapPin size={12} className="text-accent" /> {event.location || 'Venue TBD'}</>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(event.status)} className="capitalize text-[10px] font-black">
                      {event.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="xs">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Event Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`${basePath}/events/${event.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`${basePath}/events/${event.id}/applications`}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>View Applications</span>
                          </Link>
                        </DropdownMenuItem>
                        {canManageEvent(event) ? (
                          <>
                            <DropdownMenuItem asChild>
                              <Link to={`${basePath}/events/${event.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Event</span>
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Event</span>
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem disabled className="text-text-muted">
                            <X className="mr-2 h-4 w-4" />
                            <span>Organizer access required</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminEventsPage;
