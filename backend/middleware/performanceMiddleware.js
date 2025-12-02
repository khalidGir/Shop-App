import winston from 'winston';

// Create performance logger
const perfLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'shop-app-performance' },
  transports: [
    new winston.transports.File({ filename: 'logs/performance.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  perfLogger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Middleware to measure request duration
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  // Capture response finish to calculate duration
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log performance metrics
    perfLogger.info({
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    // Alert if request takes too long
    if (duration > 5000) {
      perfLogger.warn({
        message: 'Slow request detected',
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        threshold: '5000ms'
      });
    }
  });
  
  next();
};

// Middleware to add a request ID for tracking
const requestIdMiddleware = (req, res, next) => {
  req.id = Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-ID', req.id);
  next();
};

export { performanceMonitor, requestIdMiddleware };