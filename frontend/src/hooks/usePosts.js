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
      setPosts(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (data) => {
    try {
      const response = await ApiService.createPost(data);
      setPosts([response.data, ...posts]);
      return { success: true, data: response.data };
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
      setPosts(posts.map(p => p._id === id ? response.data : p));
      return { success: true, data: response.data };
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
      setPosts(posts.map(p => {
        if (p._id === id) {
          return {
            ...p,
            likes: response.data.likes,
            isLiked: response.data.isLiked
          };
        }
        return p;
      }));
      return { success: true };
    } catch (err) {
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