import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  className?: string;
}

const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
    };
  };

  const dateInfo = formatDate(event.date);

  return (
    <Card className={cn(
      'group bg-white border-gray-200 hover:border-purple-300 transition-all hover:shadow-lg hover:shadow-purple-500/10',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Date Badge */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-600/20 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-purple-400">{dateInfo.day}</span>
            <span className="text-xs text-gray-400 uppercase">{dateInfo.month}</span>
          </div>
          
          {/* Event Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-500 transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {event.type}
                  </Badge>
                  {event.isPaid && (
                    <Badge variant="default" className="text-xs">
                      ₦{event.price}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                2:00 PM
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                24 attending
              </span>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="default" className="h-8 text-xs">
                Register
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs">
                Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
