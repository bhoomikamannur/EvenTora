const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const loggingMiddleware = require('./src/middleware/logger');
const apiLimiter = require('./src/middleware/rateLimit');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware - Apply logger first to capture all requests
app.use(loggingMiddleware);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to all /api routes
app.use('/api/', apiLimiter);

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

// Health check route (outside of rate limiting for monitoring)
app.get('/health', (req, res) => {
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

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
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
