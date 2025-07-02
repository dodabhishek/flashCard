// Performance monitoring middleware
export const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  // Add response time header
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, statusCode } = req;
    
    // Log slow requests (> 1 second)
    if (duration > 1000) {
      console.warn(`🚨 Slow request: ${method} ${url} - ${duration}ms - Status: ${statusCode}`);
    } else if (duration > 500) {
      console.info(`⚠️  Moderate request: ${method} ${url} - ${duration}ms - Status: ${statusCode}`);
    } else {
      console.debug(`✅ Fast request: ${method} ${url} - ${duration}ms - Status: ${statusCode}`);
    }
    
    // Add response time header only if headers haven't been sent
    if (!res.headersSent) {
      res.setHeader('X-Response-Time', `${duration}ms`);
    }
  });
  
  next();
};

// Database query performance monitor
export const dbPerformanceMonitor = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log database query performance if available
    if (req.dbQueryTime) {
      console.info(`📊 DB Query: ${req.dbQueryTime}ms for ${req.method} ${req.url}`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
}; 