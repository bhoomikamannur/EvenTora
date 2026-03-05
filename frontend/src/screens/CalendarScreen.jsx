import React from 'react';
import CalendarView from '../components/events/CalendarView';

const CalendarScreen = ({ events, isAdmin, onAddEvent, clubs }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Calendar</h2>
      <CalendarView 
        events={events} 
        isAdmin={isAdmin} 
        onAddEvent={onAddEvent}
        clubs={clubs}
      />
    </div>
  );
};

export default CalendarScreen;