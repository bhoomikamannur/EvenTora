import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import AddEventModal from './AddEventModal';

const CalendarView = ({ events, isAdmin, adminClubId, onAddEvent }) => {
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={previousMonth} 
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h3 className="font-bold text-xl">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button 
          onClick={nextMonth} 
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isAdmin && (
        <button 
          onClick={() => setShowAddEvent(true)} 
          className="w-full mb-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition hover:opacity-90" 
          style={{ background: '#ab83c3' }}
        >
          <Plus className="w-5 h-5" /> Add Event
        </button>
      )}

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
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
              className={`min-h-20 p-1 border rounded-lg ${
                day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'
              }`}
            >
              {day && (
                <>
                  <div className="font-semibold text-sm mb-1">{day}</div>
                  {dayEvents.map(event => (
                    <div 
                      key={event._id} 
                      className="text-xs p-1 rounded mb-1 truncate" 
                      style={{ 
                        background: event.isAcademic ? '#fef3c7' : '#ddd6fe' 
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
    </div>
  );
};

export default CalendarView;