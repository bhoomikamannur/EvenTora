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
  const [activeClubTab, setActiveClubTab] = useState('posts');
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [rsvpEvents, setRsvpEvents] = useState([]);
  const [media, setMedia] = useState([]);
  const [seenNotifications, setSeenNotifications] = useState([]);
  const [scrollToResource, setScrollToResource] = useState(null);

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
      console.log('📥 User data loaded:', userData.data);
      
      // Handle nested API response structure
      const userPayload = userData.data.data || userData.data;
      console.log('📊 User payload extracted:', userPayload);
      
      const clubIds = (userPayload.joinedClubs || []).map(c => c._id || c);
      console.log('📋 joinedClubs from backend:', clubIds);
      setJoinedClubs(clubIds);
      setLikedPosts(userPayload.likedPosts || []);
      setRsvpEvents(userPayload.rsvpEvents || []);
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleJoinClub = async (clubId) => {
    try {
      if (joinedClubs.includes(clubId)) {
        console.log('✅ Already joined this club');
        return;
      }
      
      console.log('🔗 Attempting to join club:', clubId);
      const result = await joinClub(clubId);
      
      if (result.success) {
        console.log('✅ Successfully joined club');
        setJoinedClubs(prev => {
          const updated = [...prev, clubId];
          console.log('📝 Updated joinedClubs:', updated);
          return updated;
        });
        await loadUserData();
      } else if (result.error && result.error.toLowerCase().includes('already joined')) {
        // Backend confirms user is already joined - sync frontend state
        console.log('⚠️ Backend says already joined, syncing state...');
        setJoinedClubs(prev => {
          if (prev.includes(clubId)) {
            console.log('✅ State already has club');
            return prev;
          }
          console.log('✅ Adding club to joinedClubs state');
          return [...prev, clubId];
        });
        // Reload user data to fully sync
        await loadUserData();
      } else if (result.error) {
        console.error('❌ Join failed:', result.error);
        alert('Failed to join: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Join error:', error);
      alert('Failed to join club: ' + error.message);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      // Ensure postId is a string for consistency
      const postIdStr = typeof postId === 'string' ? postId : postId?.toString();
      
      console.log('💓 Liking post:', postIdStr);
      const result = await likePost(postIdStr);
      console.log('✅ Like result:', result);
      
      if (result.success) {
        // Sync with backend response: true = liked, false = unliked
        if (result.data.isLiked) {
          setLikedPosts(prev => {
            const updated = [...new Set([...prev, postIdStr])];
            console.log('✅ Added to liked posts. Array now:', updated);
            return updated;
          });
        } else {
          setLikedPosts(prev => {
            const updated = prev.filter(id => {
              const idStr = typeof id === 'string' ? id : id?.toString();
              return idStr !== postIdStr;
            });
            console.log('✅ Removed from liked posts. Array now:', updated);
            return updated;
          });
        }
      } else {
        console.error('❌ Like failed:', result.error);
        alert(result.error || 'Failed to like post');
      }
    } catch (error) {
      console.error('❌ Exception while liking post:', error);
      alert('Failed to like post. Please try again.');
    }
  };

  const handleRSVPEvent = async (eventId) => {
    try {
      console.log('🎉 RSVP clicked for event:', eventId);
      console.log('✅ Already RSVPd to:', rsvpEvents);
      
      if (!rsvpEvents.includes(eventId)) {
        console.log('📤 Calling rsvpEvent API...');
        const result = await rsvpEvent(eventId);
        console.log('📥 RSVP result:', result);
        
        if (result.success) {
          console.log('✅ RSVP successful, updating state...');
          setRsvpEvents([...rsvpEvents, eventId]);
        } else {
          console.error('❌ RSVP failed:', result.error);
          alert(result.error || 'Failed to RSVP');
        }
      } else {
        console.log('⚠️ Already RSVPd to this event');
        alert('You have already RSVPd to this event');
      }
    } catch (error) {
      console.error('❌ Exception in handleRSVPEvent:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
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
  const handleClubClick = (clubId, tab = 'posts') => {
    setSelectedClub(clubId);
    setActiveClubTab(tab);
  };

  const handleEventClick = (event) => {
    const clubId = typeof event.clubId === 'string' ? event.clubId : event.clubId?._id;
    setSelectedClub(clubId);
    setActiveClubTab('announcements');
    
    // Store resource info for scrolling
    setScrollToResource({
      type: 'event',
      id: event._id
    });
  };

  const generateNotifications = () => {
    const notifications = [];

    // Get joined club IDs (normalize to strings)
    const joinedClubIds = joinedClubs.map(id => 
      typeof id === 'string' ? id : id?._id || id
    );

    // Filter posts from joined clubs
    posts.forEach(post => {
      const postClubId = typeof post.clubId === 'string' ? post.clubId : post.clubId?._id;
      if (joinedClubIds.includes(postClubId) && !seenNotifications.includes(post._id)) {
        const club = clubs.find(c => {
          const cId = typeof c._id === 'string' ? c._id : c._id?.toString();
          return cId === postClubId;
        });
        if (club) {
          notifications.push({
            id: `post-${post._id}`,
            type: 'post',
            title: post.content,
            clubId: postClubId,
            clubName: club.name,
            clubLogo: club.logo,
            resourceId: post._id,
            resourceType: 'post'
          });
        }
      }
    });

    // Filter events/announcements from joined clubs
    events.forEach(event => {
      const eventClubId = typeof event.clubId === 'string' ? event.clubId : event.clubId?._id;
      if (joinedClubIds.includes(eventClubId) && !seenNotifications.includes(event._id)) {
        const club = clubs.find(c => {
          const cId = typeof c._id === 'string' ? c._id : c._id?.toString();
          return cId === eventClubId;
        });
        if (club) {
          notifications.push({
            id: `event-${event._id}`,
            type: 'announcement',
            title: event.title,
            clubId: eventClubId,
            clubName: club.name,
            clubLogo: club.logo,
            resourceId: event._id,
            resourceType: 'event'
          });
        }
      }
    });

    return notifications.slice(0, 10); // Limit to 10 latest notifications
  };

  const handleNotificationClick = (notification) => {
    const clubId = notification.clubId;
    setSelectedClub(clubId);
    setActiveClubTab(notification.type === 'announcement' ? 'announcements' : 'posts');
    
    // Store resource info for scrolling
    setScrollToResource({
      type: notification.resourceType,
      id: notification.resourceId
    });
    
    // Mark as seen
    setSeenNotifications(prev => [...prev, notification.resourceId]);
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
  const notifications = generateNotifications();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar 
        title={selectedClub ? null : 'Eventora'} 
        notifications={notifications}
        onNotificationClick={handleNotificationClick}
      />

      <div className="max-w-4xl mx-auto px-4 py-20 pb-24">
        {selectedClub ? (
          <CommunityScreen
            clubId={selectedClub}
            onBack={() => {
              setSelectedClub(null);
              setActiveClubTab('posts');
              setScrollToResource(null);
            }}
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
            activeTab={activeClubTab}
            scrollToResource={scrollToResource}
            onScrollComplete={() => setScrollToResource(null)}
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
                onClubClick={handleClubClick}
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
                adminClubId={user?.adminClubId}
                onAddEvent={handleEventCreated}
                onEventClick={handleEventClick}
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