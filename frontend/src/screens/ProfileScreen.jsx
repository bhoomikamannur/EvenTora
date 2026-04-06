import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Edit2, Check, X } from 'lucide-react';
import ApiService from '../services/api';

const ProfileScreen = ({ joinedClubs, clubs }) => {
  const { user, isAdmin, logout, loadUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    username: user?.username || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const joinedClubsData = clubs.filter(c => joinedClubs.includes(c._id));

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateEditData = () => {
    if (!editData.name || !editData.username) {
      setError('All fields are required');
      return false;
    }

    if (editData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(editData.username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }

    return true;
  };

  const validatePasswordData = () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      return false;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateEditData()) return;

    setLoading(true);
    try {
      const response = await ApiService.updateProfile({
        name: editData.name,
        username: editData.username
      });

      if (response.data) {
        setSuccess('Profile updated successfully');
        setIsEditingProfile(false);
        // Refresh user data from server
        await loadUser();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    if (!validatePasswordData()) return;

    setLoading(true);
    try {
      const response = await ApiService.updateProfile({
        password: passwordData.newPassword
      });

      if (response.data) {
        setSuccess('Password changed successfully');
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Refresh user data from server
        await loadUser();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
          👤
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {!isEditingProfile && !isChangingPassword ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{user?.name || 'User'}</h2>
            <p className="text-gray-500 mb-1">@{user?.username}</p>
            <p className="text-gray-500 mb-6">{user?.email}</p>

            <div className="flex justify-center gap-8 mb-6">
              <div>
                <p className="text-2xl font-bold text-gray-900">{joinedClubs.length}</p>
                <p className="text-sm text-gray-500">Communities</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex-1 py-2 rounded-lg font-semibold text-white text-sm flex items-center justify-center gap-2 transition"
                style={{ background: '#ab83c3' }}
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex-1 py-2 rounded-lg font-semibold text-white text-sm flex items-center justify-center gap-2 transition"
                style={{ background: '#86c6fd' }}
              >
                <Edit2 className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </>
        ) : isEditingProfile ? (
          <div className="space-y-4 text-left">
            <h3 className="font-bold text-lg text-center mb-4">Edit Profile</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={editData.username}
                onChange={handleEditChange}
                placeholder="3-20 characters, letters/numbers/underscores"
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
              <p className="text-xs text-gray-500 mt-1">
                Will be used to display your name in threads
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsEditingProfile(false)}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-300 transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
                style={{ background: '#ab83c3' }}
              >
                <Check className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <h3 className="font-bold text-lg text-center mb-4">Change Password</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsChangingPassword(false)}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-300 transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
                style={{ background: '#86c6fd' }}
              >
                <Check className="w-4 h-4" />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}

        {!isEditingProfile && !isChangingPassword && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;