import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import ThreadCard from './ThreadCard';
import ApiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ThreadList = ({ clubId, currentUserId, clubColor, isAdmin, socket }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newThreadText, setNewThreadText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedThreads, setLikedThreads] = useState([]);
  const [likedReplies, setLikedReplies] = useState([]);
  const [showReportedOnly, setShowReportedOnly] = useState(false);

  useEffect(() => {
    console.log('🧵 ThreadList mounted with props:', { clubId, currentUserId, isAdmin, clubColor });
    if (!clubId) {
      console.error('⚠️ ThreadList missing clubId!');
      setError('Missing club ID');
      setLoading(false);
      return;
    }
    setThreads([]);
    setLikedThreads([]);
    setLikedReplies([]);
    loadThreads();
  }, [clubId, showReportedOnly]);

  // 🔌 Socket — listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('thread-added', (newThread) => {
      console.log('🆕 New thread received via socket:', newThread);
      setThreads(prev => {
        const exists = prev.some(t => t._id === newThread._id);
        if (exists) return prev;
        return [newThread, ...prev];
      });
    });

    socket.on('reply-added', ({ threadId, updatedThread }) => {
      console.log('💬 New reply received via socket for thread:', threadId);
      setThreads(prev => prev.map(t =>
        t._id === threadId ? { ...updatedThread } : t
      ));
    });

    // 🔌 Real-time thread like updates from others
    socket.on('thread-like-updated', ({ threadId, likes }) => {
      console.log('💓 Thread like update received:', threadId, likes);
      setThreads(prev => prev.map(t =>
        normalizeId(t._id) === threadId ? { ...t, likes } : t
      ));
    });

    // 🔌 Real-time reply like updates from others
    socket.on('reply-like-updated', ({ threadId, replyId, likes }) => {
      console.log('💓 Reply like update received:', replyId, likes);
      setThreads(prev => prev.map(t =>
        normalizeId(t._id) === threadId
          ? {
              ...t,
              replies: t.replies.map(r =>
                normalizeId(r._id) === replyId ? { ...r, likes } : r
              )
            }
          : t
      ));
    });

    return () => {
      socket.off('thread-added');
      socket.off('reply-added');
      socket.off('thread-like-updated');
      socket.off('reply-like-updated');
    };
  }, [socket]);

  const normalizeId = (id) => {
    if (!id) return '';
    return typeof id === 'object' ? (id._id || id.toString()) : id.toString();
  };

  const loadThreads = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📡 Fetching threads for club:', clubId);

      const response = showReportedOnly && isAdmin
        ? await ApiService.getReportedThreads(clubId)
        : await ApiService.getThreads(clubId);

      let threadsData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        threadsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        threadsData = response.data;
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        threadsData = response.data.items;
      }

      setThreads(threadsData);

      const normalizedUserId = normalizeId(currentUserId);
      const userLikedThreads = threadsData
        .filter(t => t.likedBy?.some(likeId => normalizeId(likeId) === normalizedUserId))
        .map(t => normalizeId(t._id));
      setLikedThreads(userLikedThreads);

      const userLikedReplies = [];
      threadsData.forEach(thread => {
        thread.replies?.forEach(reply => {
          const liked = reply.likedBy?.some(likeId => normalizeId(likeId) === normalizedUserId);
          if (liked) userLikedReplies.push(normalizeId(reply._id));
        });
      });
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
      const threadData = response.data.data || response.data;

      const newThread = {
        ...threadData,
        replies: threadData.replies || [],
        likedBy: threadData.likedBy || [],
        likes: threadData.likes || 0,
        isLiked: false
      };

      setThreads(prev => {
        const exists = prev.some(t => t._id === newThread._id);
        if (exists) return prev;
        return [newThread, ...prev];
      });

      if (socket) {
        socket.emit('new-thread', clubId, newThread);
      }

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
      const response = await ApiService.likeThread(threadId);
      const responseData = response.data.data || response.data;
      const updatedThreadData = responseData.thread || {};
      const likesCount = responseData.likes || 0;
      const isNowLiked = responseData.isLiked;

      setThreads(prevThreads => prevThreads.map(t =>
        normalizeId(t._id) === normId
          ? { ...t, ...updatedThreadData, likes: likesCount, isLiked: isNowLiked }
          : t
      ));

      if (isNowLiked) {
        setLikedThreads(prev => prev.includes(normId) ? prev : [...prev, normId]);
      } else {
        setLikedThreads(prev => prev.filter(id => id !== normId));
      }

      // 🔌 Broadcast like update to others
      if (socket) {
        socket.emit('thread-liked', clubId, {
          threadId: normId,
          likes: likesCount
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
      const response = await ApiService.addReply(threadId, { content });
      const threadData = response.data.data || response.data;

      setThreads(prevThreads => prevThreads.map(t =>
        t._id === threadId ? { ...threadData } : t
      ));

      if (socket) {
        socket.emit('new-reply', clubId, { threadId, updatedThread: threadData });
      }
    } catch (error) {
      console.error('❌ Failed to add reply:', error);
      alert(error.response?.data?.message || 'Failed to add reply');
    }
  };

  const handleLikeReply = async (threadId, replyId) => {
    try {
      const normThreadId = normalizeId(threadId);
      const normReplyId = normalizeId(replyId);
      const response = await ApiService.likeReply(threadId, replyId);
      const responseData = response.data.data || response.data;
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

      if (isNowLiked) {
        setLikedReplies(prev => [...prev, normReplyId]);
      } else {
        setLikedReplies(prev => prev.filter(id => id !== normReplyId));
      }

      // 🔌 Broadcast reply like to others
      if (socket) {
        socket.emit('reply-liked', clubId, {
          threadId: normThreadId,
          replyId: normReplyId,
          likes: likesCount
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
          return { ...t, replies: t.replies.filter(r => r._id !== replyId) };
        }
        return t;
      }));
    } catch (error) {
      alert('Failed to delete reply');
    }
  };

  if (loading) return <LoadingSpinner message="Loading discussions..." />;

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
              clubId: {clubId}{'\n'}
              currentUserId: {currentUserId}{'\n'}
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

      {/* Create Thread Input */}
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