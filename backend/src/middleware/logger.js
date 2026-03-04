const winston = require('winston');
const path = require('path');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'eventora-api' },
  transports: [
    // File transport for all combined logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Error logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/errors.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    )
  }));
}

// Logging middleware
const loggingMiddleware = (req, res, next) => {
  // Log request
  const { method, url } = req;
  const timestamp = new Date().toISOString();
  
  logger.info(`${method} ${url}`, {
    method,
    url,
    timestamp,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Capture response data
  const originalJson = res.json;
  res.json = function(data) {
    logger.info('Response sent', {
      method,
      url,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString()
    });
    return originalJson.call(this, data);
  };

  next();
};

module.exports = loggingMiddleware;
