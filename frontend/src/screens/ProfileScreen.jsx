import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Edit2, Check, X, Users, CalendarCheck, TrendingUp, Upload } from 'lucide-react';
import ApiService from '../services/api';
import ClubLogo from '../components/common/ClubLogo';
import UserAvatar from '../components/common/UserAvatar';

const ProfileScreen = ({ joinedClubs, clubs, events = [], onUpdateClub }) => {
  const { user, isAdmin, logout, loadUser } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    username: user?.username || ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);

  // Analytics for the club this user administers (if any)
  const adminClub = isAdmin ? clubs.find(c => c._id === user?.adminClubId) : null;

  const [clubEditData, setClubEditData] = useState({
    color: adminClub?.color || '#ab83c3'
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

  const adminClubEvents = adminClub
    ? events
        .filter(e => {
          const clubId = typeof e.clubId === 'string' ? e.clubId : e.clubId?._id;
          return clubId === adminClub._id;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
    : [];
  const totalRSVPs = adminClubEvents.reduce((sum, e) => sum + (e.rsvps || 0), 0);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
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
      // Personal profile (name, username, optional new photo)
      const formData = new FormData();
      formData.append('name', editData.name);
      formData.append('username', editData.username);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await ApiService.updateProfile(formData);

      // If this admin also edited their club's color (or uploaded a new
      // photo, which doubles as the club logo), save that too
      if (isAdmin && adminClub && onUpdateClub) {
        const clubChanged = avatarFile || clubEditData.color !== (adminClub.color || '#ab83c3');
        if (clubChanged) {
          const clubFormData = new FormData();
          clubFormData.append('name', adminClub.name);
          clubFormData.append('type', adminClub.type);
          clubFormData.append('description', adminClub.description || '');
          clubFormData.append('color', clubEditData.color);
          if (avatarFile) {
            clubFormData.append('logo', avatarFile);
          }
          const clubResult = await onUpdateClub(adminClub._id, clubFormData);
          if (!clubResult.success) {
            setError(clubResult.error || 'Profile saved, but failed to update club details');
            setLoading(false);
            return;
          }
        }
      }

      if (response.data) {
        setSuccess('Profile updated successfully');
        setIsEditingProfile(false);
        setAvatarFile(null);
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
    <div className="bg-cream-card rounded-2xl shadow-sm border border-cream-dim p-6">
      <div className="text-center">
        {isEditingProfile ? (
          <label className="relative inline-block cursor-pointer mb-4 group">
            <UserAvatar
              user={user}
              avatar={avatarPreview}
              size={96}
              className="mx-auto"
            />
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition">
              <Upload className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
        ) : (
          <UserAvatar user={user} size={96} className="mx-auto mb-4" />
        )}

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
            <h2 className="text-2xl font-display font-semibold text-ink mb-1">{user?.name || 'User'}</h2>
            <p className="text-ink-muted mb-1">@{user?.username}</p>
            <p className="text-ink-muted mb-6">{user?.email}</p>

            <div className="flex justify-center gap-8 mb-6">
              <div>
                <p className="text-2xl font-bold text-ink">{joinedClubs.length}</p>
                <p className="text-sm text-ink-muted">Communities</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex-1 py-2 rounded-lg font-semibold text-white text-sm flex items-center justify-center gap-2 transition"
                style={{ background: '#6B4A63' }}
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={() => setIsChangingPassword(true)}
                className="flex-1 py-2 rounded-lg font-semibold text-white text-sm flex items-center justify-center gap-2 transition"
                style={{ background: '#D8A13A' }}
              >
                <Edit2 className="w-4 h-4" />
                Change Password
              </button>
            </div>
          </>
        ) : isEditingProfile ? (
          <div className="space-y-4 text-left">
            <h3 className="font-display font-semibold text-lg text-center mb-4">Edit Profile</h3>
            <p className="text-xs text-ink-muted text-center -mt-3 mb-2">
              {isAdmin && adminClub
                ? "Tap your photo above to change it — this also updates your club's logo."
                : 'Tap your photo above to change it. No photo? Your initial is shown instead.'}
            </p>

            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                className="w-full p-3 border-2 border-cream-dim rounded-lg focus:outline-none focus:border-plum-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={editData.username}
                onChange={handleEditChange}
                placeholder="3-20 characters, letters/numbers/underscores"
                className="w-full p-3 border-2 border-cream-dim rounded-lg focus:outline-none focus:border-plum-300"
              />
              <p className="text-xs text-ink-muted mt-1">
                Will be used to display your name in threads
              </p>
            </div>

            {isAdmin && adminClub && (
              <div className="pt-3 border-t border-cream-dim">
                <p className="text-sm font-semibold text-ink mb-1">
                  {adminClub.name} Branding
                </p>
                <p className="text-xs text-ink-muted mb-3">
                  Your photo above doubles as the club logo — upload a new one there to update both at once.
                </p>

                <div className="flex items-center gap-4">
                  <ClubLogo club={adminClub} size={56} />
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-ink-soft">Club Color</label>
                    <input
                      type="color"
                      value={clubEditData.color}
                      onChange={(e) => setClubEditData({ color: e.target.value })}
                      className="w-12 h-10 rounded-lg border cursor-pointer"
                    />
                    <span className="text-sm text-ink-muted">{clubEditData.color}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsEditingProfile(false);
                  setAvatarFile(null);
                  setAvatarPreview(user?.avatar || null);
                }}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold bg-cream-dim text-ink-soft flex items-center justify-center gap-2 hover:bg-plum-50 transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
                style={{ background: '#6B4A63' }}
              >
                <Check className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <h3 className="font-display font-semibold text-lg text-center mb-4">Change Password</h3>

            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 border-2 border-cream-dim rounded-lg focus:outline-none focus:border-plum-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 border-2 border-cream-dim rounded-lg focus:outline-none focus:border-plum-300"
              />
              <p className="text-xs text-ink-muted mt-1">At least 6 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-soft mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full p-3 border-2 border-cream-dim rounded-lg focus:outline-none focus:border-plum-300"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsChangingPassword(false)}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold bg-cream-dim text-ink-soft flex items-center justify-center gap-2 hover:bg-plum-50 transition disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition disabled:opacity-50"
                style={{ background: '#D8A13A' }}
              >
                <Check className="w-4 h-4" />
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}

        {!isEditingProfile && !isChangingPassword && (
          <>
            {isAdmin && adminClub && (
              <div className="mt-6 p-4 rounded-xl text-left" style={{ background: '#6B4A6315' }}>
                <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
                  🎯 Admin Dashboard
                </h3>
                <p className="text-sm text-ink-muted mb-4 flex items-center gap-2">
                  <ClubLogo club={adminClub} size={20} />
                  Analytics for {adminClub.name}
                </p>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-cream-card rounded-xl p-3 text-center border border-cream-dim">
                    <Users className="w-5 h-5 mx-auto mb-1 text-plum-600" />
                    <p className="text-xl font-bold text-ink">{adminClub.communityMembers || 0}</p>
                    <p className="text-xs text-ink-muted">Members Joined</p>
                  </div>
                  <div className="bg-cream-card rounded-xl p-3 text-center border border-cream-dim">
                    <CalendarCheck className="w-5 h-5 mx-auto mb-1 text-plum-600" />
                    <p className="text-xl font-bold text-ink">{adminClubEvents.length}</p>
                    <p className="text-xs text-ink-muted">Events Posted</p>
                  </div>
                  <div className="bg-cream-card rounded-xl p-3 text-center border border-cream-dim">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-plum-600" />
                    <p className="text-xl font-bold text-ink">{totalRSVPs}</p>
                    <p className="text-xs text-ink-muted">Total RSVPs</p>
                  </div>
                </div>

                {adminClubEvents.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-ink-soft mb-2 uppercase tracking-wide">
                      RSVPs by Event
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {adminClubEvents.map(event => (
                        <div
                          key={event._id}
                          className="flex items-center justify-between bg-cream-card rounded-lg p-2.5 border border-cream-dim"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-sm font-medium text-ink truncate">{event.title}</p>
                            <p className="text-xs text-ink-muted">
                              {new Date(event.date).toLocaleDateString()}
                              {event.isAcademic && ' • Academic'}
                            </p>
                          </div>
                          {!event.isAcademic ? (
                            <span className="flex-shrink-0 text-sm font-semibold text-plum-600 bg-plum-50 px-2.5 py-1 rounded-full">
                              {event.rsvps || 0} RSVP{event.rsvps === 1 ? '' : 's'}
                            </span>
                          ) : (
                            <span className="flex-shrink-0 text-xs text-ink-muted px-2.5 py-1">
                              No RSVPs
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Joined Clubs */}
            {joinedClubsData.length > 0 && (
              <div className="mt-6">
                <h3 className="font-display font-semibold text-left mb-3">Your Communities</h3>
                <div className="space-y-2">
                  {joinedClubsData.map(club => (
                    <div
                      key={club._id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-cream-dim"
                    >
                      <ClubLogo club={club} size={48} className="text-xl" />
                      <div className="flex-1 text-left">
                        <h4 className="font-semibold text-sm">{club.name}</h4>
                        <p className="text-xs text-ink-muted">{club.communityMembers} members</p>
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