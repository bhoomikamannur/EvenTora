import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import NotificationPopup from './NotificationPopup';

const NavBar = ({ title, notifications = [], onNotificationClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const hasNotifications = notifications.length > 0;

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: '#ab83c3' }}>
          {title || 'Eventora'}
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-full relative transition"
            >
              <Bell className="w-5 h-5 text-gray-700" />
              {hasNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
            {showNotifications && (
              <NotificationPopup 
                notifications={notifications}
                onNotificationClick={onNotificationClick}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;