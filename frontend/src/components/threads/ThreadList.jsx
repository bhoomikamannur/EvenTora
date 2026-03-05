import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import ThreadCard from './ThreadCard';
import ApiService from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ThreadList = ({ clubId, currentUserId, clubColor, isAdmin }) => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newThreadText, setNewThreadText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedThreads, setLikedThreads] = useState([]);
  const [likedReplies, setLikedReplies] = useState([]);
  const [showReportedOnly, setShowReportedOnly] = useState(false);

  useEffect(() => {
    loadThreads();
  }, [clubId, showReportedOnly]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const response = showReportedOnly && isAdmin
        ? await ApiService.getReportedThreads(clubId)
        : await ApiService.getThreads(clubId);
      
      // Extract threads from nested response structure
      // Response: { success: true, data: [...], message: "..." }
      const threadsData = response.data?.data || response.data || [];
      console.log('📌 Loaded threads:', threadsData);
      setThreads(Array.isArray(threadsData) ? threadsData : []);
      
      // Set initial liked status
      const userLikedThreads = threadsData
        .filter(t => t.likedBy?.includes(currentUserId))
        .map(t => t._id);
      setLikedThreads(userLikedThreads);
      
      // Set initial liked replies
      const userLikedReplies = [];
      threadsData.forEach(thread => {
        thread.replies?.forEach(reply => {
          if (reply.likedBy?.includes(currentUserId)) {
            userLikedReplies.push(reply._id);
          }
        });
      });
      setLikedReplies(userLikedReplies);
      
    } catch (error) {
      console.error('Failed to load threads:', error);
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
      // Extract thread from nested response: { success: true, data: thread_object }
      const newThread = response.data?.data || response.data;
      console.log('✅ New thread created:', newThread);
      setThreads([newThread, ...threads]);
      setNewThreadText('');
    } catch (error) {
      console.error('❌ Failed to create thread:', error);
      alert('Failed to create thread');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeThread = async (threadId) => {
    try {
      const response = await ApiService.likeThread(threadId);
      const unlikeData = response.data?.data || response.data;
      
      setThreads(threads.map(t => 
        t._id === threadId 
          ? { ...t, likes: unlikeData.likes, isLiked: unlikeData.isLiked }
          : t
      ));
      
      setLikedThreads(prev =>
        prev.includes(threadId)
          ? prev.filter(id => id !== threadId)
          : [...prev, threadId]
      );
    } catch (error) {
      console.error('Failed to like thread:', error);
    }
  };

  const handleReply = async (threadId, content) => {
    try {
      const response = await ApiService.addReply(threadId, { content });
      const updatedThread = response.data?.data || response.data;
      console.log('✅ Reply added, updated thread:', updatedThread);
      setThreads(threads.map(t =>
        t._id === threadId ? updatedThread : t
      ));
    } catch (error) {
      alert('Failed to add reply');
    }
  };

  const handleLikeReply = async (threadId, replyId) => {
    try {
      const response = await ApiService.likeReply(threadId, replyId);
      const likeData = response.data?.data || response.data;
      
      setThreads(threads.map(t => {
        if (t._id === threadId) {
          return {
            ...t,
            replies: t.replies.map(r =>
              r._id === replyId
                ? { ...r, likes: likeData.likes, isLiked: likeData.isLiked }
                : r
            )
          };
        }
        return t;
      }));
      
      setLikedReplies(prev =>
        prev.includes(replyId)
          ? prev.filter(id => id !== replyId)
          : [...prev, replyId]
      );
    } catch (error) {
      console.error('Failed to like reply:', error);
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
          {threads.map(thread => (
            <div key={thread._id}>
              <ThreadCard
                thread={thread}
                onLike={() => handleLikeThread(thread._id)}
                onReply={(content) => handleReply(thread._id, content)}
                onDelete={() => handleDeleteThread(thread._id)}
                onReport={(reason) => handleReportThread(thread._id, reason)}
                isLiked={likedThreads.includes(thread._id)}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
              
              {/* Replies */}
              {thread.replies && thread.replies.length > 0 && (
                <div>
                  {thread.replies.map(reply => (
                    <ThreadCard
                      key={reply._id}
                      thread={thread}
                      reply={reply}
                      onLike={() => handleLikeReply(thread._id, reply._id)}
                      onReply={() => {}}
                      onDelete={() => handleDeleteReply(thread._id, reply._id)}
                      onReport={(reason) => handleReportReply(thread._id, reply._id, reason)}
                      isLiked={likedReplies.includes(reply._id)}
                      currentUserId={currentUserId}
                      isAdmin={isAdmin}
                      isNested={true}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
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
