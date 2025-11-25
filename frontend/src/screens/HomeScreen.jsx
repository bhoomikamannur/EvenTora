import React from 'react';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

const HomeScreen = ({ 
  posts, 
  events, 
  clubs, 
  joinedClubs, 
  onLike, 
  likedPosts, 
  onClubClick, 
  media,
  loading 
}) => {
  if (loading) {
    return <LoadingSpinner message="Loading your feed..." />;
  }

  const joinedClubsData = clubs.filter(c => joinedClubs.includes(c._id));

  return (
    <div className="space-y-6">
      {/* Your Communities */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Your Communities</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {joinedClubsData.map(club => (
            <button 
              key={club._id} 
              onClick={() => onClubClick(club._id)}
              className="flex flex-col items-center gap-2 min-w-[80px] hover:opacity-80 transition"
            >
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg" 
                style={{ background: club.color }}
              >
                {club.logo}
              </div>
              <span className="text-xs font-medium text-center">{club.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">📢 Recent Announcements</h3>
        <div className="space-y-3">
          {events
            .filter(e => !e.isAcademic)
            .slice(0, 3)
            .map(event => {
              const club = clubs.find(c => c._id === event.clubId);
              return (
                <div 
                  key={event._id} 
                  className="p-3 rounded-xl" 
                  style={{ background: `${club?.color}15` }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{club?.logo}</span>
                    <span className="font-semibold text-sm">{club?.name}</span>
                  </div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(event.date).toLocaleDateString()} • {event.time}
                  </p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Latest Media */}
      {media && media.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">🎬 Latest Media</h3>
          <div className="grid grid-cols-1 gap-4">
            {media.slice(0, 3).map(item => {
              const club = clubs.find(c => c._id === item.clubId);
              const getIcon = (type) => {
                switch(type) {
                  case 'youtube': return '▶️';
                  case 'instagram': return '📷';
                  case 'github': return '💻';
                  default: return '🔗';
                }
              };
              
              return (
                <div key={item._id} className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:shadow-md transition">
                  <div 
                    className="w-20 h-20 rounded-lg flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: `${club?.color}30` }}
                  >
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color: club?.color }}>
                        {club?.name}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">{item.timestamp}</span>
                    </div>
                    <h4 className="font-semibold text-sm mb-1 truncate">{item.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Latest Posts */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 px-1">Latest Posts</h3>
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard 
              key={post._id} 
              post={post} 
              onLike={onLike}
              isLiked={likedPosts.includes(post._id)}
              isAdmin={false}
            />
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-500">No posts yet. Join some communities to see their posts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;