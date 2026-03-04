const redis = require('redis');

// Create Redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.warn('⚠️ Redis: Max reconnection attempts reached. Operating in degraded mode.');
        return false; // Stop reconnecting
      }
      return Math.min(retries * 50, 500);
    }
  }
});

// Handle Redis connection events
redisClient.on('connect', () => {
  console.log('✅ Redis client connected');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

redisClient.on('error', (err) => {
  console.warn('⚠️ Redis client error:', err.message);
  console.warn('⚠️ Continuing without Redis caching support');
});

redisClient.on('end', () => {
  console.log('Redis client disconnected');
});

redisClient.on('reconnecting', () => {
  console.log('🔄 Redis client reconnecting...');
});

// Connect to Redis (non-blocking, errors are handled by listeners)
redisClient.connect().catch(err => {
  console.warn('⚠️ Redis connection failed:', err.message);
  console.warn('⚠️ Application will continue without Redis caching');
});

module.exports = redisClient;
