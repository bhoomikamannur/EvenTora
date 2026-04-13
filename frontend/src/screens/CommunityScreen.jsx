import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import PostCard from '../components/posts/PostCard';
import EventCard from '../components/events/EventCard';
import MemberCard from '../components/members/MemberCard';
import MediaCard from '../components/media/MediaCard';
import ThreadList from '../components/threads/ThreadList';
import AddPostModal from '../components/posts/AddPostModal';
import AddEventModal from '../components/events/AddEventModal';
import AddMemberModal from '../components/members/AddMemberModal';
import AddMediaModal from '../components/media/AddMediaModal';
import EditPostModal from '../components/posts/EditPostModal';
import EditEventModal from '../components/events/EditEventModal';
import EditMediaModal from '../components/media/EditMediaModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import FloatingActionButton from '../components/common/FloatingActionButton';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import socket from '../config/socket';

const CommunityScreen = ({
  clubId,
  onBack,
  joinedClubs,
  onJoin,
  clubs,
  posts,
  events,
  onLike,
  likedPosts,
  onRSVP,
  rsvpEvents,
  isAdmin,
  onPostCreated,
  onPostUpdated,
  onPostDeleted,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
  media,
  activeTab: initialTab = 'posts',
  scrollToResource = null,
  onScrollComplete = null
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showAddPost, setShowAddPost] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddMedia, setShowAddMedia] = useState(false);
  
  const [editingPost, setEditingPost] = useState(null);
  const [showEditPost, setShowEditPost] = useState(false);
  
  const [editingEvent, setEditingEvent] = useState(null);
  const [showEditEvent, setShowEditEvent] = useState(false);
  
  const [editingMedia, setEditingMedia] = useState(null);
  const [showEditMedia, setShowEditMedia] = useState(false);
  
  const [members, setMembers] = useState([]);
  const [clubMedia, setClubMedia] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔌 Socket state
  const [onlineCount, setOnlineCount] = useState(0);

  const { user } = useAuth();

  // 🔌 Socket — join/leave community room when threads tab is active
  useEffect(() => {
    if (activeTab === 'threads' && isJoined) {
      socket.connect();
      socket.emit('join-community', clubId);

      socket.on('online-count', (count) => {
        setOnlineCount(count);
      });

      return () => {
        socket.emit('leave-community', clubId);
        socket.off('online-count');
        socket.disconnect();
      };
    }
  }, [activeTab, clubId]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (scrollToResource) {
      setTimeout(() => {
        const elementId = `${scrollToResource.type}-${scrollToResource.id}`;
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          element.style.backgroundColor = '#fff3cd';
          setTimeout(() => {
            element.style.backgroundColor = '';
          }, 2000);
        }
        onScrollComplete && onScrollComplete();
      }, 100);
    }
  }, [scrollToResource, onScrollComplete]);

  const club = clubs.find(c => {
    const clubIdStr = typeof clubId === 'string' ? clubId : clubId?.toString();
    const cIdStr = typeof c._id === 'string' ? c._id : c._id?.toString();
    return cIdStr === clubIdStr;
  });

  useEffect(() => {
    if (!club) {
      console.log('❌ Club not found. Details:', {
        clubId,
        clubIdType: typeof clubId,
        clubsCount: clubs.length,
        clubs: clubs.map(c => ({ id: c._id, name: c.name }))
      });
    }
  }, [clubId, clubs, club]);

  const isJoined = (user?.userType === 'admin' && user?.adminClubId === clubId) || 
    (joinedClubs && joinedClubs.some(id => {
      const matches = (typeof id === 'string') ? id === clubId : id._id === clubId;
      return matches;
    }));
  
  useEffect(() => {
    console.log(`🔍 CommunityScreen isJoined check:`, {
      clubId,
      isJoined,
      joinedClubsLength: joinedClubs?.length,
      joinedClubs: joinedClubs
    });
  }, [clubId, isJoined, joinedClubs]);
  
  const clubPosts = posts.filter(p => p.clubId === clubId || p.clubId?._id === clubId);
  const clubEvents = events.filter(e => e.clubId === clubId || e.clubId?._id === clubId);

  const tabs = ['posts', 'announcements', 'members', 'media', 'threads'];
  const lockedTabs = ['members', 'media', 'threads'];

  useEffect(() => {
    console.log(`🔍 CommunityScreen - clubId: ${clubId}, isJoined: ${isJoined}, joinedClubs:`, joinedClubs);
    if (clubId && isJoined) {
      loadClubData();
    }
  }, [clubId, isJoined, activeTab]);

  const loadClubData = async () => {
    if (activeTab === 'members') {
      await loadMembers();
    } else if (activeTab === 'media') {
      await loadMedia();
    }
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMembers(clubId);
      const membersData = response.data?.data || response.data || [];
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (error) {
      console.error('Failed to load members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMedia(clubId);
      const mediaData = response.data?.data || response.data || [];
      setClubMedia(Array.isArray(mediaData) ? mediaData : []);
    } catch (error) {
      console.error('Failed to load media:', error);
      setClubMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPost = async (data) => {
    const result = await onPostCreated(data);
    if (result.success) setShowAddPost(false);
    return result;
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setShowEditPost(true);
  };

  const handleUpdatePost = async (id, data) => {
    const result = await onPostUpdated(id, data);
    if (result.success) {
      setShowEditPost(false);
      setEditingPost(null);
    }
    return result;
  };

  const handleDeletePost = async (id) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await onPostDeleted(id);
    }
  };

  const handleAddEvent = async (data) => {
    const result = await onEventCreated(data);
    if (result.success) setShowAddEvent(false);
    return result;
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEditEvent(true);
  };

  const handleUpdateEvent = async (id, data) => {
    const result = await onEventUpdated(id, data);
    if (result.success) {
      setShowEditEvent(false);
      setEditingEvent(null);
    }
    return result;
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await onEventDeleted(id);
    }
  };

  const handleAddMember = async (clubId, data) => {
    try {
      const response = await ApiService.addMember(clubId, data);
      const memberData = response.data?.data || response.data;
      setMembers([...members, memberData]);
      setShowAddMember(false);
      return { success: true };
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add member';
      return { success: false, error: errorMsg };
    }
  };

  const handleUpdateMemberPosition = async (memberId, position) => {
    try {
      await ApiService.updateMember(clubId, memberId, { position });
      setMembers(members.map(m => m._id === memberId ? { ...m, position } : m));
    } catch (error) {
      alert('Failed to update member position');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      try {
        await ApiService.deleteMember(clubId, memberId);
        setMembers(members.filter(m => m._id !== memberId));
      } catch (error) {
        alert('Failed to remove member');
      }
    }
  };

  const handleAddMedia = async (clubId, data) => {
    try {
      const response = await ApiService.createMedia(clubId, data);
      const mediaData = response.data?.data || response.data;
      setClubMedia([mediaData, ...clubMedia]);
      setShowAddMedia(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to add media' };
    }
  };

  const handleEditMedia = (mediaItem) => {
    setEditingMedia(mediaItem);
    setShowEditMedia(true);
  };

  const handleUpdateMedia = async (clubId, mediaId, data) => {
    try {
      const response = await ApiService.updateMedia(clubId, mediaId, data);
      setClubMedia(clubMedia.map(m => m._id === mediaId ? response.data : m));
      setShowEditMedia(false);
      setEditingMedia(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update media' };
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        await ApiService.deleteMedia(clubId, mediaId);
        setClubMedia(clubMedia.filter(m => m._id !== mediaId));
      } catch (error) {
        alert('Failed to delete media');
      }
    }
  };

  if (!club) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-2">Club not found</p>
        <p className="text-xs text-gray-400 mb-4">ClubID: {clubId}</p>
        <button 
          onClick={onBack}
          className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="relative mb-6">
        <div 
          className="h-48 rounded-b-3xl" 
          style={{ background: `linear-gradient(135deg, ${club.color} 0%, ${club.color}dd 100%)` }}
        >
          <button 
            onClick={onBack} 
            className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
        <div 
          className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full shadow-lg flex items-center justify-center text-5xl border-4 border-white" 
          style={{ background: club.color }}
        >
          {club.logo}
        </div>
      </div>

      {/* Club Info */}
      <div className="text-center mt-12 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{club.name}</h2>
        <p className="text-gray-600 mb-4">{club.communityMembers} members</p>
        {user?.userType === 'admin' && user?.adminClubId === clubId ? (
          <div className="px-8 py-3 rounded-xl font-semibold bg-green-100 text-green-700">
            🎯 You are managing this community
          </div>
        ) : (
          <button 
            onClick={() => onJoin(clubId)}
            className={`px-8 py-3 rounded-xl font-semibold transition hover:opacity-90 ${
              isJoined ? 'bg-gray-200 text-gray-700 cursor-default' : 'text-white hover:shadow-lg'
            }`}
            style={!isJoined ? { background: club.color } : {}}
            disabled={isJoined}
          >
            {isJoined ? '✓ Joined' : 'Join Community'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button 
            key={tab} 
            onClick={() => {
              if (!isJoined && lockedTabs.includes(tab)) {
                alert('Join the community first to access ' + tab);
              } else {
                setActiveTab(tab);
              }
            }}
            disabled={!isJoined && lockedTabs.includes(tab)}
            className={`px-6 py-2 rounded-xl font-medium whitespace-nowrap transition ${
              activeTab === tab ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${!isJoined && lockedTabs.includes(tab) ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={activeTab === tab ? { background: club.color } : {}}
            title={!isJoined && lockedTabs.includes(tab) ? 'Join the community to unlock' : ''}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {!isJoined && lockedTabs.includes(tab) && ' 🔒'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            {clubPosts.length > 0 ? (
              clubPosts.map(post => {
                const postIdStr = typeof post._id === 'string' ? post._id : post._id?.toString();
                const isPostLiked = likedPosts.some(id => {
                  const likedIdStr = typeof id === 'string' ? id : id?.toString();
                  return likedIdStr === postIdStr;
                });
                return (
                  <div key={post._id} id={`post-${post._id}`}>
                    <PostCard 
                      post={post} 
                      onLike={onLike} 
                      isLiked={isPostLiked}
                      onDelete={handleDeletePost} 
                      onEdit={handleEditPost} 
                      isAdmin={isAdmin} 
                    />
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">No posts yet</p>
              </div>
            )}
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div>
            {clubEvents.length > 0 ? (
              clubEvents.map(event => (
                <div key={event._id} id={`event-${event._id}`}>
                  <EventCard
                    event={event}
                    onRSVP={onRSVP}
                    hasRSVPd={rsvpEvents.includes(event._id)}
                    onDelete={handleDeleteEvent}
                    isAdmin={isAdmin}
                    onEdit={handleEditEvent}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">No events yet</p>
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            {!isJoined ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">Join the community to view members</p>
              </div>
            ) : loading ? (
              <LoadingSpinner message="Loading members..." />
            ) : (
              <div className="space-y-3">
                {members.length > 0 ? (
                  members.map(member => (
                    <MemberCard
                      key={member._id}
                      member={member}
                      club={club}
                      isAdmin={isAdmin}
                      onRemove={handleRemoveMember}
                      onUpdatePosition={handleUpdateMemberPosition}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <p className="text-gray-500">No members added yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <div>
            {!isJoined ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">Join the community to view media</p>
              </div>
            ) : loading ? (
              <LoadingSpinner message="Loading media..." />
            ) : (
              <div>
                {clubMedia.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clubMedia.map(item => (
                      <MediaCard 
                        key={item._id} 
                        media={item} 
                        club={club}
                        onDelete={handleDeleteMedia}
                        onEdit={handleEditMedia}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl">
                    <p className="text-gray-500">No media shared yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Threads Tab */}
        {activeTab === 'threads' && (
          <div>
            {!isJoined ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-500">Join the community to view threads</p>
              </div>
            ) : (
              <div>
                {/* 🟢 Online Count Badge */}
                <div className="flex items-center gap-2 mb-4 px-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse inline-block"></span>
                  <span className="text-sm font-medium text-gray-600">
                    {onlineCount} {onlineCount === 1 ? 'person' : 'people'} online
                  </span>
                </div>

                <ThreadList 
                  clubId={clubId}
                  currentUserId={user?._id}
                  clubColor={club.color}
                  isAdmin={isAdmin}
                  socket={socket}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      {isAdmin && (
        <div>
          {activeTab === 'posts' && (
            <FloatingActionButton onClick={() => setShowAddPost(true)} color={club.color} tooltip="Add Post" />
          )}
          {activeTab === 'announcements' && (
            <FloatingActionButton onClick={() => setShowAddEvent(true)} color={club.color} tooltip="Add Event" />
          )}
          {activeTab === 'members' && (
            <FloatingActionButton onClick={() => setShowAddMember(true)} color={club.color} tooltip="Add Member" />
          )}
          {activeTab === 'media' && (
            <FloatingActionButton onClick={() => setShowAddMedia(true)} color={club.color} tooltip="Add Media" />
          )}
        </div>
      )}

      {/* Modals */}
      {showAddPost && (
        <AddPostModal onClose={() => setShowAddPost(false)} onAdd={handleAddPost} clubId={clubId} />
      )}
      {showEditPost && editingPost && (
        <EditPostModal
          post={editingPost}
          onClose={() => { setShowEditPost(false); setEditingPost(null); }}
          onSave={handleUpdatePost}
        />
      )}
      {showAddEvent && (
        <AddEventModal onClose={() => setShowAddEvent(false)} onAdd={handleAddEvent} clubId={clubId} />
      )}
      {showEditEvent && editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => { setShowEditEvent(false); setEditingEvent(null); }}
          onSave={handleUpdateEvent}
        />
      )}
      {showAddMember && (
        <AddMemberModal clubId={clubId} onClose={() => setShowAddMember(false)} onAdd={handleAddMember} />
      )}
      {showAddMedia && (
        <AddMediaModal clubId={clubId} onClose={() => setShowAddMedia(false)} onAdd={handleAddMedia} />
      )}
      {showEditMedia && editingMedia && (
        <EditMediaModal
          media={editingMedia}
          onClose={() => { setShowEditMedia(false); setEditingMedia(null); }}
          onSave={handleUpdateMedia}
        />
      )}
    </div>
  );
};

export default CommunityScreen;