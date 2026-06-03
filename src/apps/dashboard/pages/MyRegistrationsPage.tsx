import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { User } from '@/types';
import eventsApi, { Event, EventApplication } from '@/src/api/events';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/src/hooks/useToast';
import {
  Calendar,
  Ticket,
  Filter,
  MapPin,
  RefreshCcw,
  X,
  ChevronRight,
  ExternalLink,
  Clock,
  Video,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Pagination from '@/components/ui/Pagination';

const MyRegistrationsPage: React.FC<{ user: User | null }> = ({ user }) => {
  const [registrations, setRegistrations] = useState<EventApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;
  const toast = useToast();

  const loadRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getMyRegistrations();
      const results = data.results;

      const needDetails = results.filter(
        (r) => r.event && !r.event.date
      );
      if (needDetails.length > 0) {
        const uniqueIds = [...new Set(needDetails.map((r) => r.event.id))];
        const eventMap = new Map<number, Event>();
        await Promise.all(
          uniqueIds.map(async (id) => {
            try {
              const ev = await eventsApi.getEvent(id);
              if (ev) eventMap.set(id, ev);
            } catch { /* skip */ }
          })
        );
        for (const reg of results) {
          const full = eventMap.get(reg.event.id);
          if (full) {
            reg.event.date = full.date || reg.event.date;
            reg.event.description = full.description || reg.event.description;
            reg.event.location = full.location || reg.event.location;
            reg.event.is_online = full.is_online ?? reg.event.is_online;
            reg.event.event_url = full.event_url || reg.event.event_url;
            reg.event.image_url = full.image_url || reg.event.image_url;
          }
        }
      }

      setRegistrations(results);
    } catch {
      toast.error('Failed to load your events.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const getStatusVariant = (status: string): any => {
    switch (status?.toLowerCase()) {
      case 'accepted': case 'approved': return 'success';
      case 'pending': case 'under_review': return 'warning';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredRegistrations = registrations.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = !searchQuery ||
      (r.event?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalItems = filteredRegistrations.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentItems = filteredRegistrations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  if (loading && registrations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="animate-spin h-8 w-8 text-primary/40" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full overflow-hidden px-1 sm:px-2">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-text tracking-tight">My Events</h1>
          <p className="text-[10px] sm:text-xs text-text-secondary">Events you've registered for</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="sm" onClick={loadRegistrations} className="h-8 px-2">
             <RefreshCcw className={cn("h-3 w-3", loading && "animate-spin")} />
           </Button>
           <Link to="/dashboard/events">
            <Button size="sm" className="h-8 text-[10px] font-bold text-white">
              <Calendar className="mr-1.5 h-3 w-3" /> Browse Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Collapsible Filter */}
      <div className="bg-surface rounded-xl border border-border p-2 sm:p-3 shadow-md hover:shadow-xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search your events..."
              value={searchQuery}
              onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
              className="pl-8 h-9 w-full text-[11px] sm:text-xs bg-surface-alt/50 border-border focus:ring-1 text-text placeholder:text-text-secondary"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="h-9 px-3 shrink-0 text-xs gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>

        <div className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          showFilters ? "max-h-24 mt-3 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="flex flex-wrap gap-1.5">
            {['all', 'pending', 'accepted', 'rejected'].map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(setFilter, f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                  filter === f
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-alt text-text hover:bg-surface-hover"
                )}
              >
                {f}
              </button>
            ))}
            {(filter !== 'all' || searchQuery) && (
               <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => {setFilter('all'); setSearchQuery(''); setCurrentPage(1);}}>
                 <X className="h-3 w-3 mr-1" /> Reset
               </Button>
            )}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.length > 0 ? (
          currentItems.map((reg) => (
            <div key={reg.id} className="bg-surface rounded-xl border border-border shadow-md hover:shadow-xl overflow-hidden flex flex-col group transition-shadow">
              {/* Image / Placeholder */}
              {reg.event?.image_url ? (
                <div className="relative h-36 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                  <img src={reg.event.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <Badge variant={getStatusVariant(reg.status)} className="text-[9px] font-black uppercase px-1.5 py-0.5 shadow-sm">
                      {reg.status}
                    </Badge>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="text-[9px] font-mono text-text-secondary bg-surface/80 backdrop-blur-sm px-1.5 py-0.5 rounded-md">#{reg.id}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <Badge variant={getStatusVariant(reg.status)} className="text-[9px] font-black uppercase px-1.5 py-0.5 shadow-sm">
                    {reg.status}
                  </Badge>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-text-secondary">#{reg.id}</span>
                    <Calendar className="h-4 w-4 text-primary/40" />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-bold text-text leading-snug line-clamp-2 mb-2">
                  {reg.event?.title || 'Untitled Event'}
                </h3>

                <div className="space-y-1.5 mb-3 flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                    <Calendar className="h-3 w-3 text-primary shrink-0" />
                    <span>{reg.event?.date ? formatDate(reg.event.date) : 'TBD'}</span>
                    {reg.event?.date && (
                      <span className="flex items-center gap-1 ml-1">
                        <Clock className="h-3 w-3" />
                        {new Date(reg.event.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-text-secondary">
                    {reg.event?.is_online ? (
                      <>
                        <Video className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span>Online</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-3 w-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{reg.event?.location || 'Venue TBD'}</span>
                      </>
                    )}
                  </div>
                  {reg.event?.description && (
                    <p className="text-[10px] text-text-secondary leading-relaxed line-clamp-2 mt-1.5">
                      {reg.event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-[9px] text-text-secondary mt-1 pt-1.5 border-t border-border/40">
                    <Clock className="h-2.5 w-2.5" />
                    <span>Applied {reg.applied_at ? formatDate(reg.applied_at) : '—'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <Button asChild variant="outline" size="sm" className="h-8 px-3 text-[10px] font-bold rounded-xl flex-1 gap-1.5">
                    <Link to={`/dashboard/events/${reg.event?.id}`}>
                      <ExternalLink className="h-3 w-3" />
                      Event Details
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold rounded-xl flex-1 gap-1">
                    <Link to={`/dashboard/registrations/${reg.id}`}>
                      Registration
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-surface rounded-xl border border-dashed border-border">
            <Ticket className="h-8 w-8 mx-auto text-text-secondary/50 mb-2" />
            <p className="text-[11px] font-medium text-text-secondary mb-3">No events found</p>
            <Link to="/dashboard/events">
              <Button size="sm" className="text-[10px]">Browse Available Events</Button>
            </Link>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
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

export default MyRegistrationsPage;
