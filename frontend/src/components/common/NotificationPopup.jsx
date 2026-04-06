import React from 'react';
import { X } from 'lucide-react';

const NotificationPopup = ({ notifications, onNotificationClick, onClose }) => {
  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-xl">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {notifications.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {notifications.map(notif => (
            <button
              key={notif.id}
              onClick={() => {
                onNotificationClick(notif);
                onClose();
              }}
              className="w-full p-4 text-left hover:bg-gray-50 transition flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{notif.clubLogo}</span>
                <span className="font-semibold text-sm text-gray-900">{notif.clubName}</span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{notif.title}</p>
              <p className="text-xs text-gray-400 mt-1">
                {notif.type === 'announcement' ? '📢 New Announcement' : '📝 New Post'}
              </p>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500 text-sm">No notifications yet</p>
        </div>
      )}
    </div>
  );
};

export default NotificationPopup;
