const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const fs = require('fs');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const { initSocket } = require('./src/config/socket');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Create HTTP server (needed for Socket.io)
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads', 'posts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/clubs', require('./src/routes/clubs'));
app.use('/api/posts', require('./src/routes/posts'));
app.use('/api/events', require('./src/routes/events'));

// Nested routes
const memberRoutes = require('./src/routes/members');
const mediaRoutes = require('./src/routes/media');
const threadRoutes = require('./src/routes/threads');
const threadActionsRoutes = require('./src/routes/threadactions');

app.use('/api/clubs/:clubId/members', memberRoutes);
app.use('/api/clubs/:clubId/media', mediaRoutes);
app.use('/api/clubs/:clubId/threads', threadRoutes);
app.use('/api/threads', threadActionsRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Eventora API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Multer error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File size too large. Maximum 5MB allowed.' });
  }
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Use server.listen instead of app.listen (important for Socket.io!)
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;