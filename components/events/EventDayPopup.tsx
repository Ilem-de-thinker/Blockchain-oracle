import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Calendar, Clock, MapPin, Video, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  location: string;
  is_online: boolean;
  registered: boolean;
  rawDate?: Date;
}

interface EventDayPopupProps {
  date: Date;
  events: CalendarEvent[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (id: string) => void;
}

const getEventTypeColor = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'webinar': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'workshop': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
    case 'conference': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
  }
};

const EventDayPopup: React.FC<EventDayPopupProps> = ({ date, events, open, onOpenChange, onRegister }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </DialogTitle>
        </DialogHeader>

        {events.length === 0 ? (
          <p className="text-sm text-text-secondary py-4 text-center">No events on this day.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-surface-alt/50 border border-border/50 rounded-lg p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Badge className={cn("px-2 py-0.5 text-[9px] font-semibold uppercase border-none", getEventTypeColor(event.type))}>
                        {event.type}
                      </Badge>
                      {event.registered && (
                        <Badge variant="success" className="px-2 py-0.5 text-[9px] font-semibold uppercase">Going</Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-text line-clamp-2">{event.title}</h4>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-teal-500" />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    {event.is_online ? <Video className="h-3 w-3 text-teal-500" /> : <MapPin className="h-3 w-3 text-teal-500" />}
                    <span className="truncate">{event.location}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    to={`/dashboard/events/${event.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" /> Details
                  </Link>
                  {!event.registered && event.rawDate && event.rawDate >= new Date() && (
                    <Button
                      size="xs"
                      className="ml-auto text-white"
                      onClick={() => onRegister(event.id)}
                    >
                      Register
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventDayPopup;
