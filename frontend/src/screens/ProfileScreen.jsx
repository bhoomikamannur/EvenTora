import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const ProfileScreen = ({ joinedClubs, clubs }) => {
  const { user, isAdmin, logout } = useAuth();

  const joinedClubsData = clubs.filter(c => joinedClubs.includes(c._id));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
          👤
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name || 'User'}</h2>
        <p className="text-gray-500 mb-6">{user?.email}</p>
        
        <div className="flex justify-center gap-8 mb-6">
          <div>
            <p className="text-2xl font-bold text-gray-900">{joinedClubs.length}</p>
            <p className="text-sm text-gray-500">Communities</p>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-6 p-4 rounded-xl" style={{ background: '#ab83c315' }}>
            <h3 className="font-semibold mb-2">🎯 Admin Dashboard</h3>
            <p className="text-sm text-gray-600">Manage your club community</p>
          </div>
        )}

        {/* Joined Clubs */}
        {joinedClubsData.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-left mb-3">Your Communities</h3>
            <div className="space-y-2">
              {joinedClubsData.map(club => (
                <div 
                  key={club._id} 
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100"
                >
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0" 
                    style={{ background: club.color }}
                  >
                    {club.logo}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-sm">{club.name}</h4>
                    <p className="text-xs text-gray-500">{club.communityMembers} members</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button 
          onClick={logout}
          className="mt-6 w-full py-3 rounded-xl font-semibold bg-red-500 text-white flex items-center justify-center gap-2 hover:bg-red-600 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfileScreen;