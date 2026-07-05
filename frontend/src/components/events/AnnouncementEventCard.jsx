import React from 'react';
import ClubLogo from '../common/ClubLogo';

const AnnouncementEventCard = ({ event, club, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-xl text-left hover:shadow-md transition"
      style={{ background: `${club?.color || '#6B4A63'}15` }}
    >
      <div className="flex items-center gap-2 mb-1">
        <ClubLogo club={club} size={22} />
        <span className="font-semibold text-sm text-ink">{club?.name || 'Unknown Club'}</span>
        {event.isAcademic && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            Academic
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-ink-soft">{event.title}</p>
      <p className="text-xs text-ink-muted mt-1">
        {new Date(event.date).toLocaleDateString()} • {event.time}
      </p>
    </button>
  );
};

export default AnnouncementEventCard;
