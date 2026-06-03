import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Clock, Users } from 'lucide-react';
import eventsApi, { Event as ApiEvent } from '@/src/api/events';
import { cn } from '@/lib/utils';

const DemoEventsPage: React.FC = () => {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'webinar' | 'workshop' | 'conference' | 'meetup'>('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventsApi.getEvents(1, 20);
        setEvents(res.results || []);
      } catch { setEvents([]); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let list = events;
    if (filter !== 'all') list = list.filter((e) => e.type === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
    }
    return list;
  }, [events, filter, search]);

  const typeStyles: Record<string, string> = {
    webinar: 'bg-blue-100 text-blue-700',
    workshop: 'bg-purple-100 text-purple-700',
    conference: 'bg-orange-100 text-orange-700',
    meetup: 'bg-green-100 text-green-700',
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((s) => (
          <div key={s} className="animate-pulse rounded-xl border border-border bg-surface p-4">
            <div className="h-4 bg-surface-alt rounded w-2/3 mb-2" />
            <div className="h-3 bg-surface-alt rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-text">Events</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['all', 'webinar', 'workshop', 'conference', 'meetup'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors',
              filter === t ? 'bg-primary text-white' : 'bg-surface text-text-muted hover:text-text border border-border'
            )}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <Calendar className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-sm text-text-muted">No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((event) => {
            const fee = parseFloat(event.registration_fee || '0') + parseFloat(event.event_fee || '0');
            return (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="rounded-xl border border-border bg-surface p-4 hover:border-primary/20 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider', typeStyles[event.type] || 'bg-gray-100 text-gray-700')}>
                    {event.type}
                  </span>
                  <span className="text-xs font-bold text-text shrink-0">
                    {fee === 0 ? 'FREE' : `₦${fee.toLocaleString()}`}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text group-hover:text-primary transition-colors mb-2">{event.title}</h3>
                <p className="text-[11px] text-text-muted line-clamp-2 mb-3">{event.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {event.registrations_count || 0}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate max-w-[80px]">{event.location}</span>
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DemoEventsPage;
