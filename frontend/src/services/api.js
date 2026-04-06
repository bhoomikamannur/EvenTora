import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL); // Debug log

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Request:', config.method?.toUpperCase(), config.url); // Debug log
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.config.url); // Debug log
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const ApiService = {
  // AUTH
  register: (data) => api.post('/auth/register', data),
  login: (data) => {
    console.log('🔐 Attempting login:', data.email, data.userType);
    return api.post('/auth/login', data);
  },
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),

  // ... rest of the API methods remain the same
  // CLUBS
  getClubs: (params) => api.get('/clubs', { params }),
  getClub: (id) => api.get(`/clubs/${id}`),
  createClub: (data) => api.post('/clubs', data),
  updateClub: (id, data) => api.put(`/clubs/${id}`, data),
  deleteClub: (id) => api.delete(`/clubs/${id}`),
  joinClub: (id) => api.post(`/clubs/${id}/join`),
  leaveClub: (id) => api.post(`/clubs/${id}/leave`),

  // POSTS
  getPosts: (params) => api.get('/posts', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  addComment: (id, data) => api.post(`/posts/${id}/comment`, data),
  addPostComment: (id, text) => api.post(`/posts/${id}/comment`, { text }),
  deletePostComment: (postId, commentId) => api.delete(`/posts/${postId}/comment/${commentId}`),
  reportPostComment: (postId, commentId, reason) => api.post(`/posts/${postId}/comment/${commentId}/report`, { reason }),

  // EVENTS
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  rsvpEvent: (id) => api.post(`/events/${id}/rsvp`),
  cancelRSVP: (id) => api.delete(`/events/${id}/rsvp`),

  // MEMBERS
  getMembers: (clubId) => api.get(`/clubs/${clubId}/members`),
  addMember: (clubId, data) => api.post(`/clubs/${clubId}/members`, data),
  updateMember: (clubId, memberId, data) => api.put(`/clubs/${clubId}/members/${memberId}`, data),
  deleteMember: (clubId, memberId) => api.delete(`/clubs/${clubId}/members/${memberId}`),

  // MEDIA
  getMedia: (clubId) => api.get(`/clubs/${clubId}/media`),
  createMedia: (clubId, data) => api.post(`/clubs/${clubId}/media`, data),
  updateMedia: (clubId, mediaId, data) => api.put(`/clubs/${clubId}/media/${mediaId}`, data),
  deleteMedia: (clubId, mediaId) => api.delete(`/clubs/${clubId}/media/${mediaId}`),

  // THREADS
  // THREADS
    getThreads: (clubId) => api.get(`/clubs/${clubId}/threads`),
    getReportedThreads: (clubId) => api.get(`/clubs/${clubId}/threads/reported`),
    createThread: (clubId, data) => api.post(`/clubs/${clubId}/threads`, data),
    likeThread: (threadId) => api.post(`/threads/${threadId}/like`),
    reportThread: (threadId, data) => api.post(`/threads/${threadId}/report`, data),
    deleteThread: (threadId) => api.delete(`/threads/${threadId}`),
    dismissReport: (threadId) => api.post(`/threads/${threadId}/dismiss-report`),
    addReply: (threadId, data) => api.post(`/threads/${threadId}/reply`, data),
    likeReply: (threadId, replyId) => api.post(`/threads/${threadId}/reply/${replyId}/like`),
    reportReply: (threadId, replyId, data) => api.post(`/threads/${threadId}/reply/${replyId}/report`, data),
    deleteReply: (threadId, replyId) => api.delete(`/threads/${threadId}/reply/${replyId}`),
};

export default ApiService;
