import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const EventCard = ({ event, onRSVP, hasRSVPd, onDelete, isAdmin, onEdit }) => {
  const club = event.clubId;

  return (
    <div className="bg-cream-card rounded-2xl shadow-sm border border-cream-dim p-6 mb-4">
      <div className="flex items-start gap-4 mb-4">
        <div 
          className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
          style={{ background: club?.color }}
        >
          {club?.logo}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-xl mb-1 text-ink">{event.title}</h3>
          <p className="text-sm text-ink-muted">{club?.name}</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onEdit && onEdit(event)} 
              className="p-2 hover:bg-cream-dim rounded-lg transition"
            >
              <Edit2 className="w-5 h-5 text-plum-600" />
            </button>
            <button 
              onClick={() => onDelete && onDelete(event._id)} 
              className="p-2 hover:bg-cream-dim rounded-lg transition"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
        )}
      </div>
      
      {event.description && (
        <p className="text-ink-soft mb-4">{event.description}</p>
      )}
      
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2 text-ink-muted">
          <span className="font-semibold text-ink">📍 Venue:</span> {event.venue}
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <span className="font-semibold text-ink">📅 Date:</span> {new Date(event.date).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-2 text-ink-muted">
          <span className="font-semibold text-ink">⏰ Time:</span> {event.time}
        </div>
        {!event.isAcademic && (
          <div className="flex items-center gap-2 text-ink-muted">
            <span className="font-semibold text-ink">👥 RSVPs:</span> {event.rsvps}
          </div>
        )}
      </div>
      
      {!event.isAcademic && (
        <button 
          onClick={() => onRSVP(event._id)} 
          disabled={hasRSVPd}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            hasRSVPd ? 'bg-cream-dim text-ink-soft' : 'text-white'
          }`}
          style={!hasRSVPd ? { background: '#7A9B76' } : {}}
        >
          {hasRSVPd ? '✓ RSVP Confirmed' : 'RSVP Now'}
        </button>
      )}
    </div>
  );
};

export default EventCard;