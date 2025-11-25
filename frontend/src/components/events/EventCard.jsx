import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const EventCard = ({ event, onRSVP, hasRSVPd, onDelete, isAdmin, onEdit }) => {
  const club = event.clubId;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" 
          style={{ background: club?.color }}
        >
          {club?.logo}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-xl mb-1">{event.title}</h3>
          <p className="text-sm text-gray-600">{club?.name}</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit && onEdit(event)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Edit2 className="w-5 h-5 text-gray-600" />
            </button>
            <button 
              onClick={() => onDelete && onDelete(event._id)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        )}
      </div>
      
      {event.description && (
        <p className="text-gray-700 mb-4">{event.description}</p>
      )}
      
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-semibold">📍 Venue:</span> {event.venue}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-semibold">📅 Date:</span> {new Date(event.date).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span className="font-semibold">⏰ Time:</span> {event.time}
        </div>
        {!event.isAcademic && (
          <div className="flex items-center gap-2 text-gray-600">
            <span className="font-semibold">👥 RSVPs:</span> {event.rsvps}
          </div>
        )}
      </div>
      
      {!event.isAcademic && (
        <button 
          onClick={() => onRSVP(event._id)} 
          disabled={hasRSVPd}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            hasRSVPd ? 'bg-gray-200 text-gray-700' : 'text-white'
          }`}
          style={!hasRSVPd ? { background: 'linear-gradient(135deg, #ab83c3 0%, #ff337e 100%)' } : {}}
        >
          {hasRSVPd ? '✓ RSVP Confirmed' : 'RSVP Now'}
        </button>
      )}
    </div>
  );
};

export default EventCard;