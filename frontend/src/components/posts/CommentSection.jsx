import React, { useState, useEffect } from 'react';
import { Send, MoreVertical } from 'lucide-react';
import ApiService from '../../services/api';

const CommentSection = ({ post, onUpdate }) => {
  const [comments, setComments] = useState(post?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    setComments(post?.comments || []);
  }, [post]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await ApiService.addPostComment(post._id, newComment);
      const updatedPost = res?.data?.data;

      if (updatedPost?.comments) {
        setComments(updatedPost.comments);
        onUpdate && onUpdate(updatedPost);
      }
    } catch (err) {
      console.error(err);
    }
  };

    const handleDeleteComment = async (commentId) => {
    console.log("🗑️ Deleting comment:", commentId);

    try {
        const res = await ApiService.deleteComment(post._id, commentId);
        console.log("✅ Delete response:", res);

        const updatedPost = res?.data?.data;

        if (updatedPost?.comments) {
        setComments(updatedPost.comments);
        onUpdate && onUpdate(updatedPost);
        }
    } catch (err) {
        console.error("❌ Delete failed:", err);
    }
    };

  return (
    <div className="px-4 pb-4 border-t border-gray-100">

      {/* COMMENTS LIST */}
      <div className="max-h-60 overflow-y-auto space-y-3 mt-3">
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c._id} className="flex justify-between bg-gray-50 p-3 rounded-xl relative">

              <div>
                <p className="text-sm font-semibold">{c.username || 'Anonymous'}</p>
                <p className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm mt-1">{c.text}</p>
              </div>

              {/* 3 DOT MENU */}
              <div className="relative">
                <button onClick={() => setActiveMenu(activeMenu === c._id ? null : c._id)}>
                  <MoreVertical className="w-4 h-4 text-gray-500" />
                </button>

                {activeMenu === c._id && (
                  <div className="absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow-md">
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                    <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100">
                      Edit
                    </button>
                    <button className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100">
                      Report
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No comments yet</p>
        )}
      </div>

      {/* INPUT */}
      <form onSubmit={handleAddComment} className="flex gap-2 mt-3">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 px-3 py-2 border rounded-full text-sm"
        />
        <button className="p-2 bg-purple-600 text-white rounded-full">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default CommentSection;