import React from 'react';
import { X } from 'lucide-react';
import ClubLogo from './ClubLogo';

const NotificationPopup = ({ notifications, onNotificationClick, onClose }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-cream-card rounded-xl shadow-lg border border-cream-dim z-50 max-h-96 overflow-y-auto">
      <div className="sticky top-0 bg-cream-card border-b border-cream-dim p-4 flex items-center justify-between rounded-t-xl">
        <h3 className="font-display font-semibold text-ink">Notifications</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-cream-dim rounded-lg transition"
        >
          <X className="w-4 h-4 text-ink-muted" />
        </button>
      </div>

      {notifications.length > 0 ? (
        <div className="divide-y divide-cream-dim">
          {notifications.map(notif => (
            <button
              key={notif.id}
              onClick={() => {
                onNotificationClick(notif);
                onClose();
              }}
              className="w-full p-4 text-left hover:bg-cream-dim transition flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <ClubLogo club={{ logo: notif.clubLogo, color: notif.clubColor, name: notif.clubName }} size={20} />
                <span className="font-semibold text-sm text-ink">{notif.clubName}</span>
              </div>
              <p className="text-xs text-ink-muted line-clamp-2">{notif.title}</p>
              <p className="text-xs text-ink-faint mt-1">
                {notif.type === 'announcement' ? '📢 New Announcement' : '📝 New Post'}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-ink-muted text-sm">No notifications yet</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPopup;
