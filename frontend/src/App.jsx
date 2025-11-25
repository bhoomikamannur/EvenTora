import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import SplashScreen from './components/common/SplashScreen';
import LoginScreen from './components/common/LoginScreen';
import NavBar from './components/common/NavBar';
import BottomNav from './components/common/BottomNav';
import HomeScreen from './screens/HomeScreen';
import CommunitiesScreen from './screens/CommunitiesScreen';
import CommunityScreen from './screens/CommunityScreen';
import CalendarScreen from './screens/CalendarScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoadingSpinner from './components/common/LoadingSpinner';
import { usePosts } from './hooks/usePosts';
import { useEvents } from './hooks/useEvents';
import { useClubs } from './hooks/useClubs';
import ApiService from './services/api';

const AppContent = () => {
  const { user, isAuthenticated, isAdmin, loading: authLoading } = useAuth();
  
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [selectedClub, setSelectedClub] = useState(null);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [rsvpEvents, setRsvpEvents] = useState([]);
  const [media, setMedia] = useState([]);

  // Use custom hooks
  const { posts, loading: postsLoading, createPost, updatePost, deletePost, likePost, refetch: refetchPosts } = usePosts();
  const { events, loading: eventsLoading, createEvent, updateEvent, deleteEvent, rsvpEvent, refetch: refetchEvents } = useEvents();
  const { clubs, loading: clubsLoading, joinClub, leaveClub } = useClubs();

  // Load user data on mount
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const userData = await ApiService.getMe();
      setJoinedClubs(userData.data.joinedClubs.map(c => c._id || c));
      setLikedPosts(userData.data.likedPosts || []);
      setRsvpEvents(userData.data.rsvpEvents || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleJoinClub = async (clubId) => {
    if (!joinedClubs.includes(clubId)) {
      const result = await joinClub(clubId);
      if (result.success) {
        setJoinedClubs([...joinedClubs, clubId]);
      }
    }
  };

  const handleLikePost = async (postId) => {
    const result = await likePost(postId);
    if (result.success) {
      setLikedPosts(prev => 
        prev.includes(postId) 
          ? prev.filter(id => id !== postId) 
          : [...prev, postId]
      );
    }
  };

  const handleRSVPEvent = async (eventId) => {
    if (!rsvpEvents.includes(eventId)) {
      const result = await rsvpEvent(eventId);
      if (result.success) {
        setRsvpEvents([...rsvpEvents, eventId]);
      }
    }
  };

  const handlePostCreated = async (data) => {
    const result = await createPost(data);
    if (result.success) {
      await refetchPosts();
    }
    return result;
  };

  const handlePostUpdated = async (id, data) => {
    const result = await updatePost(id, data);
    if (result.success) {
      await refetchPosts();
    }
    return result;
  };

  const handlePostDeleted = async (id) => {
    const result = await deletePost(id);
    if (result.success) {
      await refetchPosts();
    }
    return result;
  };

  const handleEventCreated = async (data) => {
    const result = await createEvent(data);
    if (result.success) {
      await refetchEvents();
    }
    return result;
  };

  const handleEventUpdated = async (id, data) => {
    const result = await updateEvent(id, data);
    if (result.success) {
      await refetchEvents();
    }
    return result;
  };

  const handleEventDeleted = async (id) => {
    const result = await deleteEvent(id);
    if (result.success) {
      await refetchEvents();
    }
    return result;
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Loading Eventora..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const loading = postsLoading || eventsLoading || clubsLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar title={selectedClub ? null : 'Eventora'} />

      <div className="max-w-4xl mx-auto px-4 py-20 pb-24">
        {selectedClub ? (
          <CommunityScreen
            clubId={selectedClub}
            onBack={() => setSelectedClub(null)}
            joinedClubs={joinedClubs}
            onJoin={handleJoinClub}
            clubs={clubs}
            posts={posts}
            events={events}
            onLike={handleLikePost}
            likedPosts={likedPosts}
            onRSVP={handleRSVPEvent}
            rsvpEvents={rsvpEvents}
            isAdmin={isAdmin && user?.adminClubId === selectedClub}
            onPostCreated={handlePostCreated}
            onPostUpdated={handlePostUpdated}
            onPostDeleted={handlePostDeleted}
            onEventCreated={handleEventCreated}
            onEventUpdated={handleEventUpdated}
            onEventDeleted={handleEventDeleted}
            media={media}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                posts={posts}
                events={events}
                clubs={clubs}
                joinedClubs={joinedClubs}
                onLike={handleLikePost}
                likedPosts={likedPosts}
                onClubClick={setSelectedClub}
                media={media}
                loading={loading}
              />
            )}

            {activeTab === 'communities' && (
              <CommunitiesScreen
                clubs={clubs}
                onClubClick={setSelectedClub}
                joinedClubs={joinedClubs}
                loading={loading}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarScreen
                events={events}
                isAdmin={isAdmin}
                onAddEvent={handleEventCreated}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                joinedClubs={joinedClubs}
                clubs={clubs}
              />
            )}
          </>
        )}
      </div>

      {!selectedClub && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;