import React from 'react';
import { Heart, MessageCircle, Share2, Edit2, Trash2 } from 'lucide-react';

const PostCard = ({ post, onLike, isLiked, onDelete, onEdit, isAdmin }) => {
  const club = post.clubId;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4">
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
              <p className="text-xs text-gray-500">{post.timestamp}</p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button 
                onClick={() => onEdit(post)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                onClick={() => onDelete(post._id)} 
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
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
                src={img} 
                alt="Event" 
                className="w-full h-40 object-cover rounded-lg" 
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-6 px-4 py-3 border-t border-gray-100">
        <button 
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-2 transition ${
            isLiked ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{post.likes}</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{post.comments?.length || 0}</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;