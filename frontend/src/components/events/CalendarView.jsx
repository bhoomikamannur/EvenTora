import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CalendarDays } from 'lucide-react';
import AddEventModal from './AddEventModal';
import AnnouncementEventCard from './AnnouncementEventCard';

const CalendarView = ({ events, isAdmin, adminClubId, clubs = [], onAddEvent, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
  const days = [];
  
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  // Every event (from every club) that falls within the month currently
  // shown on the calendar, sorted chronologically.
  const monthEvents = events
    .filter(e => {
      const eventDate = new Date(e.date);
      return (
        eventDate.getFullYear() === currentDate.getFullYear() &&
        eventDate.getMonth() === currentDate.getMonth()
      );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const getClubForEvent = (event) => {
    const clubId = typeof event.clubId === 'string' ? event.clubId : event.clubId?._id;
    return clubs.find(c => c._id === clubId);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-cream-card rounded-2xl shadow-sm border border-cream-dim p-4">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={previousMonth} 
          className="p-2 hover:bg-cream-dim rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5 text-plum-600" />
        </button>
        
        <h3 className="font-display font-semibold text-xl text-ink">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button 
          onClick={nextMonth} 
          className="p-2 hover:bg-cream-dim rounded-lg transition"
        >
          <ChevronRight className="w-5 h-5 text-plum-600" />
        </button>
      </div>

      {isAdmin && (
        <button 
          onClick={() => setShowAddEvent(true)} 
          className="w-full mb-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90" 
          style={{ background: '#6B4A63' }}
        >
          <Plus className="w-5 h-5" /> Add Event
        </button>
      )}

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-ink-muted py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          return (
            <div 
              key={idx} 
              className={`min-h-20 p-1 border border-cream-dim rounded-lg ${
                day ? 'bg-cream-card hover:bg-cream-dim cursor-pointer' : 'bg-cream-dim/40'
              }`}
            >
              {day && (
                <>
                  <div className="font-semibold text-sm mb-1 text-ink">{day}</div>
                  {dayEvents.map(event => (
                    <div 
                      key={event._id} 
                      onClick={() => onEventClick && onEventClick(event)}
                      className="text-xs p-1 rounded mb-1 truncate cursor-pointer hover:opacity-80 transition" 
                      style={{ 
                        background: event.isAcademic ? '#fef3c7' : '#E4D2E0' 
                      }}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}
      </div>

      {showAddEvent && (
        <AddEventModal 
          onClose={() => setShowAddEvent(false)} 
          onAdd={onAddEvent}
          clubId={adminClubId}
        />
      )}

      {/* Events happening this month, across all clubs */}
      <div className="mt-6 pt-4 border-t border-cream-dim">
        <h4 className="flex items-center gap-2 font-display font-semibold text-ink mb-3">
          <CalendarDays className="w-4 h-4 text-plum-600" />
          Events in {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h4>
        {monthEvents.length === 0 ? (
          <p className="text-sm text-ink-muted py-4 text-center">
            No events scheduled this month.
          </p>
        ) : (
          <div className="space-y-3">
            {monthEvents.map(event => (
              <AnnouncementEventCard
                key={event._id}
                event={event}
                club={getClubForEvent(event)}
                onClick={() => onEventClick && onEventClick(event)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;