import React, { useState, useMemo } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
  addMonths, subMonths, setMonth, setYear
} from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import EventDayPopup from './EventDayPopup';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  location: string;
  is_online: boolean;
  registered: boolean;
  rawDate: Date;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onRegister: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onRegister }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const key = format(event.rawDate, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? eventsByDate.get(format(selectedDate, 'yyyy-MM-dd')) || [] : [];

  const goToPrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setPopupOpen(true);
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <>
      <div className="bg-surface/80 backdrop-blur-md border border-border/50 rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-text">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center">
              <button
                onClick={goToPrevMonth}
                className="p-1.5 rounded-lg hover:bg-surface-alt text-text-secondary hover:text-text transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-1.5 rounded-lg hover:bg-surface-alt text-text-secondary hover:text-text transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7">
          {dayLabels.map((label) => (
            <div key={label} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-text-muted">
              {label}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 border-t border-border/30">
          {days.map((day, idx) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = eventsByDate.get(key) || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);

            return (
              <button
                key={idx}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "relative flex flex-col items-center justify-start p-1.5 min-h-[72px] border-b border-r border-border/30 transition-colors hover:bg-surface-alt/50",
                  !isCurrentMonth && "opacity-30",
                  isSelected && "bg-primary/10",
                  today && "bg-primary/5"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium",
                  today && !isSelected && "bg-primary text-white",
                  isSelected && "bg-primary text-white",
                  !today && "text-text",
                  !isCurrentMonth && "text-text-muted"
                )}>
                  {format(day, 'd')}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((_, i) => (
                      <span key={i} className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        dayEvents[i].registered ? "bg-emerald-500" : "bg-purple-500"
                      )} />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] font-bold text-text-muted">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border/50 text-[10px] text-text-secondary">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Unregistered
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Registered
          </span>
        </div>
      </div>

      <EventDayPopup
        date={selectedDate || new Date()}
        events={selectedEvents}
        open={popupOpen}
        onOpenChange={setPopupOpen}
        onRegister={onRegister}
      />
    </>
  );
};

export default CalendarView;
