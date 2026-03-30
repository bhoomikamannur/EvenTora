import { useState, useEffect } from 'react';
import ApiService from '../services/api';

export const usePosts = (clubId = null) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [clubId]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = clubId ? { clubId } : {};
      const response = await ApiService.getPosts(params);
      // Extract data array from new API response format
      const postsArray = response.data?.data || response.data || [];
      setPosts(Array.isArray(postsArray) ? postsArray : []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (data) => {
    try {
      const response = await ApiService.createPost(data);
      const postData = response.data?.data || response.data;
      setPosts([postData, ...posts]);
      return { success: true, data: postData };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to create post' 
      };
    }
  };

  const updatePost = async (id, data) => {
    try {
      const response = await ApiService.updatePost(id, data);
      const postData = response.data?.data || response.data;
      setPosts(posts.map(p => p._id === id ? postData : p));
      return { success: true, data: postData };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to update post' 
      };
    }
  };

  const deletePost = async (id) => {
    try {
      await ApiService.deletePost(id);
      setPosts(posts.filter(p => p._id !== id));
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to delete post' 
      };
    }
  };

  const likePost = async (id) => {
    try {
      const response = await ApiService.likePost(id);
      console.log('✅ Like response full:', response);
      console.log('✅ Like response.data:', response.data);
      
      // Extract from nested API response structure
      // The API wraps the response, so data.data contains the actual payload
      const responseData = response.data.data || response.data;
      console.log('✅ Extracted responseData:', responseData);
      
      const likesCount = responseData.likes !== undefined ? responseData.likes : responseData.likedCount || 0;
      const isNowLiked = responseData.isLiked;
      
      console.log('📊 Extracted: likesCount=', likesCount, 'isNowLiked=', isNowLiked);
      
      // Update posts array with new like count and status
      setPosts(prevPosts => {
        console.log('📝 Current posts before update:', prevPosts.map(p => ({ id: p._id, likes: p.likes })));
        
        const updated = prevPosts.map(p => {
          if (p._id === id) {
            console.log('🔄 Found matching post, updating likes from', p.likes, 'to', likesCount);
            const updatedPost = {
              ...p,
              likes: likesCount,
              isLiked: isNowLiked
            };
            console.log('🎯 Updated post object:', { 
              id: updatedPost._id, 
              likes: updatedPost.likes, 
              isLiked: updatedPost.isLiked 
            });
            return updatedPost;
          }
          return p;
        });
        
        console.log('✨ All posts after update:', updated.map(p => ({ id: p._id, likes: p.likes, isLiked: p.isLiked })));
        return updated;
      });
      
      return { 
        success: true,
        data: {
          likes: likesCount,
          isLiked: isNowLiked
        }
      };
    } catch (err) {
      console.error('❌ Like error:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to like post' 
      };
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    likePost,
    refetch: fetchPosts
  };
};