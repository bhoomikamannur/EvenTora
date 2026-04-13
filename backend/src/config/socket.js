const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  // Track online users per community
  const communityOnline = {};

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // User opens Threads page of a community
    socket.on('join-community', (communityId) => {
      socket.join(communityId);

      // Increment count
      communityOnline[communityId] = (communityOnline[communityId] || 0) + 1;

      // Broadcast updated count to everyone in that community
      io.to(communityId).emit('online-count', communityOnline[communityId]);

      console.log(`👥 Community ${communityId}: ${communityOnline[communityId]} online`);
    });

    // User leaves Threads page
    socket.on('leave-community', (communityId) => {
      socket.leave(communityId);

      communityOnline[communityId] = Math.max((communityOnline[communityId] || 1) - 1, 0);

      io.to(communityId).emit('online-count', communityOnline[communityId]);
    });

    // New thread posted — broadcast to everyone in that community
    socket.on('new-thread', (communityId, thread) => {
      io.to(communityId).emit('thread-added', thread);
    });

    // New reply posted — broadcast to everyone
    socket.on('new-reply', (communityId, data) => {
      io.to(communityId).emit('reply-added', data);
    });

    // User disconnects (closed tab/browser)
    socket.on('disconnecting', () => {
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          communityOnline[room] = Math.max((communityOnline[room] || 1) - 1, 0);
          io.to(room).emit('online-count', communityOnline[room]);
        }
      });
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });

    // Like update on a thread
    socket.on('thread-liked', (communityId, data) => {
    socket.to(communityId).emit('thread-like-updated', data);
    });

    // Like update on a reply
    socket.on('reply-liked', (communityId, data) => {
    socket.to(communityId).emit('reply-like-updated', data);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket not initialized');
  return io;
};

module.exports = { initSocket, getIO };