import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, Flag, MoreVertical } from 'lucide-react';
import ReportModal from './ReportModal';

const ThreadCard = ({ 
  thread, 
  reply = null, 
  onLike, 
  onReply, 
  onDelete,
  onReport,
  isLiked,
  currentUserId,
  isAdmin,
  isNested = false 
}) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const item = reply || thread;
  
  // Log when thread/reply updates
  useEffect(() => {
    console.log('🎯 ThreadCard re-rendered:', { 
      id: item._id,
      likes: item.likes,
      isLikedProp: isLiked,
      itemIsLiked: item.isLiked
    });
  }, [item.likes, item.isLiked, item._id]);
  
  // Debug logging
  if (!reply) {
    console.log('🧵 ThreadCard thread:', {
      id: thread._id,
      username: thread.username,
      author: thread.author,
      userId: thread.userId,
      content: thread.content,
      likes: thread.likes,
      replies: thread.replies?.length || 0
    });
  }
  
  const isAuthor = currentUserId === item.userId?._id || currentUserId === item.userId;
  const canDelete = isAuthor || isAdmin;

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;
    
    setSubmitting(true);
    await onReply(replyText);
    setReplyText('');
    setShowReplyInput(false);
    setSubmitting(false);
  };

  const handleReport = async (reason) => {
    await onReport(reason);
    setShowReportModal(false);
    setShowMenu(false);
  };

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${isNested ? 'ml-12 mt-3' : 'mb-4'} ${item.isReported ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
          {item.author?.charAt(0)?.toUpperCase() || '?'}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm text-gray-900">{item.username || item.author || 'Unknown'}</h4>
                {item.isReported && isAdmin && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    Reported ({item.reports?.length || 0})
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {reply ? (
                  new Date(reply.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                ) : (
                  thread.timestamp || new Date(thread.createdAt).toLocaleDateString()
                )}
              </p>
            </div>
            
            {/* Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[150px]">
                  {canDelete && (
                    <button
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                  
                  {!isAuthor && (
                    <button
                      onClick={() => {
                        setShowReportModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Flag className="w-4 h-4" />
                      Report
                    </button>
                  )}
                  
                  {isAdmin && item.isReported && (
                    <button
                      onClick={() => {
                        // Handle dismiss report
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                    >
                      View Reports
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Content */}
          <p className="text-gray-700 mb-3 whitespace-pre-wrap">{item.content}</p>
          
          {/* Actions */}
          <div className="flex items-center gap-4">
            {(() => {
              const currentIsLiked = item.isLiked !== undefined ? item.isLiked : isLiked;
              const currentLikes = item.likes || 0;
              return (
                <button 
                  onClick={onLike}
                  className={`flex items-center gap-1 transition ${
                    currentIsLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${currentIsLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">{currentLikes}</span>
                </button>
              );
            })()}
            
            {!isNested && (
              <button 
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="flex items-center gap-1 text-gray-500 hover:text-purple-600 transition"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{thread.replies?.length || 0}</span>
              </button>
            )}
          </div>
          
          {/* Reply Input */}
          {showReplyInput && !isNested && (
            <div className="mt-3 flex gap-2">
              <input 
                type="text"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                disabled={submitting}
              />
              <button 
                onClick={handleReplySubmit}
                disabled={!replyText.trim() || submitting}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium text-sm hover:bg-purple-600 transition disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Reply'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          type={reply ? 'reply' : 'thread'}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleReport}
        />
      )}
    </div>
  );
};

export default ThreadCard;