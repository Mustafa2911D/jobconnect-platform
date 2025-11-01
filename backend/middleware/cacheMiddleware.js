import redis from 'redis';

// ===== REDIS CLIENT SETUP =====
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('Redis Client Connected');
});

(async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
})();

// ===== CACHE MIDDLEWARE =====
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }
    
    if (req.user || req.path.includes('/auth/') || req.path.includes('/dashboard')) {
      return next();
    }
    
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedData = await client.get(key);
      
      if (cachedData) {
        console.log('Cache hit for:', key);
        return res.json(JSON.parse(cachedData));
      }
      
      const originalJson = res.json;
      res.json = function(data) {
        if (data.success !== false) {
          client.setEx(key, duration, JSON.stringify(data))
            .catch(err => console.error('Redis set error:', err));
        }
        originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// ===== CACHE MANAGEMENT =====
export const clearCache = async (pattern) => {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
      console.log(`Cleared ${keys.length} cache entries for pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

// ===== CACHE SERVICE =====
export const cacheService = {
  get: async (key) => {
    try {
      return await client.get(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },
  
  set: async (key, value, duration = 300) => {
    try {
      await client.setEx(key, duration, value);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },
  
  delete: async (key) => {
    try {
      await client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  },
  
  deletePattern: async (pattern) => {
    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }
};

export default client;