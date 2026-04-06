import React from 'react';
import CalendarView from '../components/events/CalendarView';

const CalendarScreen = ({ events, isAdmin, adminClubId, onAddEvent, onEventClick }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Calendar</h2>
      <CalendarView 
        events={events} 
        isAdmin={isAdmin} 
        adminClubId={adminClubId}
        onAddEvent={onAddEvent}
        onEventClick={onEventClick}
      />
    </div>
  );
};

export default CalendarScreen;