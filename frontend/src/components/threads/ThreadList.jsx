import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import ThreadCard from './ThreadCard';
import ApiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ThreadList = ({ clubId, currentUserId, clubColor, isAdmin }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newThreadText, setNewThreadText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedThreads, setLikedThreads] = useState([]);
  const [likedReplies, setLikedReplies] = useState([]);
  const [showReportedOnly, setShowReportedOnly] = useState(false);

  // Debug props
  useEffect(() => {
    console.log('🧵 ThreadList mounted with props:', {
      clubId,
      currentUserId,
      isAdmin,
      clubColor
    });
    if (!clubId) {
      console.error('⚠️ ThreadList missing clubId!');
      setError('Missing club ID');
      setLoading(false);
      return;
    }
    // Clear previous threads when clubId changes to prevent stale data rendering
    setThreads([]);
    setLikedThreads([]);
    setLikedReplies([]);
    loadThreads();
  }, [clubId, showReportedOnly]);

  // Normalize ID to string for comparison
  const normalizeId = (id) => {
    if (!id) return '';
    return typeof id === 'object' ? (id._id || id.toString()) : id.toString();
  };

  const loadThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching threads for club:', clubId);
      console.log('📡 Current userId:', currentUserId);
      
      const response = showReportedOnly && isAdmin
        ? await ApiService.getReportedThreads(clubId)
        : await ApiService.getThreads(clubId);
      
      console.log('📥 Full response:', response);
      
      // Extract threads array from paginated response
      let threadsData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        threadsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        threadsData = response.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        threadsData = response.data.items;
      }
      
      console.log('✅ Extracted threads:', threadsData.map(t => ({
        id: t._id,
        username: t.username,
        content: t.content?.substring(0, 30),
        likes: t.likes,
        likedBy: t.likedBy?.length || 0,
        replies: t.replies?.length || 0
      })));
      
      setThreads(threadsData);
      
      // Set initial liked status - normalize all IDs to strings
      const normalizedUserId = normalizeId(currentUserId);
      const userLikedThreads = threadsData
        .filter(t => {
          const liked = t.likedBy?.some(likeId => normalizeId(likeId) === normalizedUserId);
          return liked;
        })
        .map(t => normalizeId(t._id));
      
      console.log('💓 User liked threads (normalized):', userLikedThreads);
      setLikedThreads(userLikedThreads);
      
      // Set initial liked replies
      const userLikedReplies = [];
      threadsData.forEach(thread => {
        thread.replies?.forEach(reply => {
          const liked = reply.likedBy?.some(likeId => normalizeId(likeId) === normalizedUserId);
          if (liked) {
            userLikedReplies.push(normalizeId(reply._id));
          }
        });
      });
      console.log('💓 User liked replies (normalized):', userLikedReplies);
      setLikedReplies(userLikedReplies);
    } catch (error) {
      console.error('❌ Failed to load threads:', error);
      setError(error.response?.data?.message || 'Failed to load threads');
      setThreads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async () => {
    if (!newThreadText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const response = await ApiService.createThread(clubId, { content: newThreadText });
      console.log('✅ Thread created response:', response.data);
      
      // Extract thread data from nested API response structure
      const threadData = response.data.data || response.data;
      console.log('✅ Extracted thread data:', {
        id: threadData._id,
        author: threadData.author,
        username: threadData.username,
        userId: threadData.userId,
        content: threadData.content?.substring(0, 50),
        replies: threadData.replies?.length || 0,
        likes: threadData.likes || 0
      });
      
      // Ensure the thread has all required fields for display
      const newThread = {
        ...threadData,
        replies: threadData.replies || [],
        likedBy: threadData.likedBy || [],
        likes: threadData.likes || 0,
        isLiked: false
      };
      
      console.log('✅ Prepared thread for display:', {
        id: newThread._id,
        author: newThread.author,
        username: newThread.username,
        content: newThread.content?.substring(0, 50),
        likes: newThread.likes,
        replies: newThread.replies?.length || 0,
        userId: newThread.userId
      });
      
      setThreads([newThread, ...threads]);
      setNewThreadText('');
    } catch (error) {
      console.error('❌ Failed to create thread:', error);
      alert(error.response?.data?.message || 'Failed to create thread');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeThread = async (threadId) => {
    try {
      const normId = normalizeId(threadId);
      console.log('💓 Liking/Unliking thread:', normId);
      console.log('📋 Current liked threads before:', likedThreads);
      
      // Call API
      const response = await ApiService.likeThread(threadId);
      console.log('✅ Like response:', response.data);
      
      // Extract from nested API response structure
      const responseData = response.data.data || response.data;
      console.log('✅ Extracted responseData:', responseData);
      
      // Update thread on likes count and data from backend
      const updatedThreadData = responseData.thread || {};
      const likesCount = responseData.likes || 0;
      const isNowLiked = responseData.isLiked;
      
      setThreads(prevThreads => {
        const updated = prevThreads.map(t => {
          const matches = normalizeId(t._id) === normId;
          if (matches) {
            console.log('🔄 Updating thread likes from', t.likes, 'to', likesCount);
          }
          return matches
            ? { ...t, ...updatedThreadData, likes: likesCount, isLiked: isNowLiked }
            : t;
        });
        console.log('✅ Threads state updated');
        return updated;
      });
      
      // Update liked status - add or remove from array
      if (isNowLiked) {
        setLikedThreads(prev => {
          if (!prev.includes(normId)) {
            const updated = [...prev, normId];
            console.log('💚 Added to liked threads:', normId, '→', updated);
            return updated;
          }
          return prev;
        });
      } else {
        setLikedThreads(prev => {
          const updated = prev.filter(id => id !== normId);
          console.log('🤍 Removed from liked threads:', normId, '→', updated);
          return updated;
        });
      }
    } catch (error) {
      console.error('❌ Failed to like thread:', error);
      loadThreads();
      alert(error.response?.data?.message || 'Failed to like thread');
    }
  };

  const handleReply = async (threadId, content) => {
    try {
      console.log('💬 Adding reply to thread:', threadId);
      const response = await ApiService.addReply(threadId, { content });
      console.log('✅ Reply added:', response.data);
      
      // Extract thread data from nested API response structure
      const threadData = response.data.data || response.data;
      console.log('✅ Updated thread with replies:', {
        threadId: threadData._id,
        repliesCount: threadData.replies?.length || 0,
        latestReply: threadData.replies?.[threadData.replies.length - 1]
      });
      
      // Fully replace thread with updated version from server
      setThreads(prevThreads => prevThreads.map(t =>
        t._id === threadId ? { ...threadData } : t
      ));
    } catch (error) {
      console.error('❌ Failed to add reply:', error);
      alert(error.response?.data?.message || 'Failed to add reply');
    }
  };

  const handleLikeReply = async (threadId, replyId) => {
    try {
      const normThreadId = normalizeId(threadId);
      const normReplyId = normalizeId(replyId);
      console.log('💓 Liking/Unliking reply:', normReplyId, 'in thread:', normThreadId);
      
      const response = await ApiService.likeReply(threadId, replyId);
      console.log('✅ Like reply response:', response.data);
      
      // Extract from nested API response structure
      const responseData = response.data.data || response.data;
      console.log('✅ Extracted responseData:', responseData);
      
      // Update thread with fresh data from backend
      const updatedThread = responseData.thread || {};
      const likesCount = responseData.likes || 0;
      const isNowLiked = responseData.isLiked;
      
      setThreads(prevThreads => prevThreads.map(t => {
        if (normalizeId(t._id) === normThreadId) {
          return {
            ...t,
            ...updatedThread,
            replies: (updatedThread.replies || t.replies).map(r =>
              normalizeId(r._id) === normReplyId
                ? { ...r, likes: likesCount, isLiked: isNowLiked }
                : r
            )
          };
        }
        return t;
      }));
      
      // Update liked status
      if (isNowLiked) {
        setLikedReplies(prev => {
          const updated = [...prev, normReplyId];
          console.log('💚 Added to liked replies:', normReplyId, '→', updated);
          return updated;
        });
      } else {
        setLikedReplies(prev => {
          const updated = prev.filter(id => id !== normReplyId);
          console.log('🤍 Removed from liked replies:', normReplyId, '→', updated);
          return updated;
        });
      }
    } catch (error) {
      console.error('❌ Failed to like reply:', error);
      loadThreads();
      alert(error.response?.data?.message || 'Failed to like reply');
    }
  };

  const handleReportThread = async (threadId, reason) => {
    try {
      await ApiService.reportThread(threadId, { reason });
      alert('Thread reported successfully. Admin will review it.');
      loadThreads();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to report thread');
    }
  };

  const handleReportReply = async (threadId, replyId, reason) => {
    try {
      await ApiService.reportReply(threadId, replyId, { reason });
      alert('Reply reported successfully. Admin will review it.');
      loadThreads();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to report reply');
    }
  };

  const handleDeleteThread = async (threadId) => {
    if (!window.confirm('Delete this thread?')) return;
    
    try {
      await ApiService.deleteThread(threadId);
      setThreads(threads.filter(t => t._id !== threadId));
    } catch (error) {
      alert('Failed to delete thread');
    }
  };

  const handleDeleteReply = async (threadId, replyId) => {
    if (!window.confirm('Delete this reply?')) return;
    
    try {
      await ApiService.deleteReply(threadId, replyId);
      setThreads(threads.map(t => {
        if (t._id === threadId) {
          return {
            ...t,
            replies: t.replies.filter(r => r._id !== replyId)
          };
        }
        return t;
      }));
    } catch (error) {
      alert('Failed to delete reply');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading discussions..." />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Error Loading Threads</h3>
          <p className="text-red-700 text-sm">{error}</p>
          <details className="text-red-600 text-xs mt-2 cursor-pointer">
            <summary>Debug Info</summary>
            <pre className="text-left bg-white p-2 mt-2 rounded overflow-auto max-h-40">
              clubId: {clubId}
              currentUserId: {currentUserId}
              isAdmin: {isAdmin}
            </pre>
          </details>
          <button
            onClick={loadThreads}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const reportedCount = threads.filter(t => t.isReported).length;

  return (
    <div>
      {/* Admin Filter */}
      {isAdmin && reportedCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              {reportedCount} reported thread{reportedCount > 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={() => setShowReportedOnly(!showReportedOnly)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition"
          >
            {showReportedOnly ? 'Show All' : 'View Reported'}
          </button>
        </div>
      )}

      {/* Threads List */}
      {threads.length > 0 ? (
        <div className="space-y-0">
          {threads.map(thread => {
            const normId = normalizeId(thread._id);
            const isLiked = likedThreads.includes(normId);
            console.log('📌 Rendering thread:', {
              id: normId,
              username: thread.username,
              author: thread.author,
              content: thread.content?.substring(0, 30),
              likes: thread.likes,
              isLiked: isLiked,
              likedThreadsArray: likedThreads
            });
            
            return (
            <div key={thread._id}>
              <ThreadCard
                thread={thread}
                onLike={() => handleLikeThread(thread._id)}
                onReply={(content) => handleReply(thread._id, content)}
                onDelete={() => handleDeleteThread(thread._id)}
                onReport={(reason) => handleReportThread(thread._id, reason)}
                isLiked={isLiked}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
              
              {/* Replies */}
              {thread.replies && thread.replies.length > 0 && (
                <div>
                  {thread.replies.map(reply => {
                    const normReplyId = normalizeId(reply._id);
                    const isReplyLiked = likedReplies.includes(normReplyId);
                    return (
                      <ThreadCard
                        key={reply._id}
                        thread={thread}
                        reply={reply}
                        onLike={() => handleLikeReply(thread._id, reply._id)}
                        onReply={() => {}}
                        onDelete={() => handleDeleteReply(thread._id, reply._id)}
                        onReport={(reason) => handleReportReply(thread._id, reply._id, reason)}
                        isLiked={isReplyLiked}
                        currentUserId={currentUserId}
                        isAdmin={isAdmin}
                        isNested={true}
                      />
                    );
                  })}
                </div>
              )}
            </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 text-center">
          <p className="text-gray-500">
            {showReportedOnly ? 'No reported threads' : 'No discussions yet. Start one below!'}
          </p>
        </div>
      )}

      {/* Create Thread Input - Moved to Bottom */}
      {!showReportedOnly && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mt-6 sticky bottom-0">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {currentUserId?.charAt(0)?.toUpperCase() || 'Y'}
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Start a discussion..."
                value={newThreadText}
                onChange={(e) => setNewThreadText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                rows="3"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleCreateThread}
                  disabled={!newThreadText.trim() || submitting}
                  className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-semibold transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: clubColor || '#ab83c3' }}
                >
                  <Plus className="w-4 h-4" />
                  {submitting ? 'Posting...' : 'Post Thread'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadList;
