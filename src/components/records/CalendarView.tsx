
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from '@/lib/types';

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick: (eventId: string) => void;
  onDateSelect: (date: Date) => void;
}

const CalendarView = ({ events, onEventClick, onDateSelect }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Get all dates that have events
  const getEventDates = () => {
    return events.map(event => {
      const date = new Date(event.date);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
    }
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const eventDates = getEventDates();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              modifiers={{
                hasEvents: eventDates
              }}
              modifiersStyles={{
                hasEvents: { 
                  backgroundColor: '#ac7556',
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
            <div className="mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded" 
                  style={{ backgroundColor: '#ac7556' }}
                ></div>
                <span>Days with conference records</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>
              Events for {selectedDate?.toLocaleDateString() || 'Selected Date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length === 0 ? (
              <p className="text-muted-foreground">No events on this date</p>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onEventClick(event.id)}
                  >
                    <h4 className="font-medium">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {event.duration} hours
                    </p>
                    <p className="text-sm text-muted-foreground">{event.department}</p>
                    {event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="text-xs"
                            style={{ borderColor: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Badge variant="outline" className="mt-2 text-xs">
                      {event.accessLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarView;
