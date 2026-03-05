import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Edit2, Trash2, X } from 'lucide-react';
import ApiService from '../../services/api';

const PostCard = ({ post, onLike, isLiked, onDelete, onEdit, isAdmin }) => {
  const club = post.clubId;
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState(post.comments || []);

  console.log('📌 PostCard rendered with post:', {
    title: post.eventTitle,
    author: post.author,
    authorId: post.authorId,
    authorUsername: post.authorId?.username,
    comments: post.comments,
    likes: post.likes,
    likedBy: post.likedBy
  });

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    try {
      setLoading(true);
      console.log('💬 Adding comment:', commentText);
      const response = await ApiService.addComment(post._id, { text: commentText });
      console.log('📦 Raw comment response:', response);
      
      // Extract comments from nested response: { success, data: post_object }
      const updatedPost = response.data?.data || response.data;
      console.log('📝 Updated post from response:', updatedPost);
      
      const updatedComments = updatedPost?.comments || [];
      console.log('📝 Updated comments array:', updatedComments);
      
      if (!updatedComments || updatedComments.length === 0) {
        console.warn('⚠️ No comments returned in response');
      }
      
      setComments(updatedComments);
      setCommentText('');
      console.log('✅ Comment added successfully');
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to add comment: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

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
              <h4 className="font-semibold text-gray-900">
                {post.authorId?.username || post.author || 'Anonymous'}
              </h4>
              <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
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
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{comments.length}</span>
        </button>
        
        <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {showComments && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-semibold text-gray-900">Comments ({comments.length})</h5>
            <button onClick={() => setShowComments(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map((comment, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg">
                  <p className="font-semibold text-sm text-gray-900">{comment.username}</p>
                  <p className="text-sm text-gray-700">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm py-4">No comments yet</p>
            )}
          </div>

          <div className="flex gap-2">
            <input 
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button 
              onClick={handleAddComment}
              disabled={loading || !commentText.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;