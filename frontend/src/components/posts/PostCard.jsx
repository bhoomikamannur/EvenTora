import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Edit2, Trash2 } from 'lucide-react';
import CommentSection from './CommentSection';
import { getImageUrl } from '../../utils/helpers';

const PostCard = ({ post, onLike, isLiked, onDelete, onEdit, isAdmin, onUpdate }) => {
  const [showComments, setShowComments] = useState(false);
  const club = post.clubId;

  const handleCommentUpdate = (updatedPost) => {
    if (onUpdate) {
      onUpdate(updatedPost);
    }
  };

  const handleLikeClick = () => {
    onLike(post._id);
  };

  const currentIsLiked = post.isLiked !== undefined ? post.isLiked : isLiked;
  const currentLikes = post.likes || 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">

      {/* POST CONTENT */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" 
              style={{ background: club?.color }}
            >
              {club?.logo}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{post.author}</h4>
              <p className="text-xs text-gray-500">
                {post.timestamp}
                {post.createdAt && (
                  <span className="ml-2" title={new Date(post.createdAt).toLocaleString()}>
                    • {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={() => onEdit(post)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button onClick={() => onDelete(post._id)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}
        </div>

        <h3 className="font-bold text-lg mb-2">{post.eventTitle}</h3>
        <p className="text-gray-700 mb-3">{post.caption}</p>

        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {post.images.slice(0, 4).map((img, idx) => (
              <img 
                key={idx} 
                src={getImageUrl(img)} 
                alt="Post" 
                className="w-full h-40 object-cover rounded-lg"
                onError={(e) => {
                  console.error(`❌ Image failed to load: ${img}`);
                  e.target.style.display = 'none';
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center gap-6 px-4 py-3 border-t border-gray-100">
        <button 
          onClick={handleLikeClick}
          className={`flex items-center gap-2 ${
            currentIsLiked ? 'text-red-500' : 'text-gray-600'
          }`}
        >
          <Heart className={`w-5 h-5 ${currentIsLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{currentLikes}</span>
        </button>

        <button 
          onClick={() => setShowComments(prev => !prev)}
          className="flex items-center gap-2 text-gray-600"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{post.comments?.length || 0}</span>
        </button>

        <button className="flex items-center gap-2 text-gray-600">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* COMMENTS INSIDE CARD */}
      {showComments && (
        <CommentSection 
          post={post}
          onUpdate={handleCommentUpdate}
        />
      )}
    </div>
  );
};

export default PostCard;