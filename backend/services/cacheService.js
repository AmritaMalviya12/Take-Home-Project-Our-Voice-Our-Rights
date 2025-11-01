const ApiCache = require('../models/ApiCache');

class CacheService {
  async setCache(endpoint, data, ttlMinutes = 60) {
    try {
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
      
      await ApiCache.findOneAndUpdate(
        { endpoint },
        {
          endpoint,
          data,
          expires_at: expiresAt,
          created_at: new Date()
        },
        { upsert: true }
      );
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async getCache(endpoint) {
    try {
      const cached = await ApiCache.findOne({
        endpoint,
        expires_at: { $gt: new Date() }
      });
      
      return cached ? cached.data : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async clearExpiredCache() {
    try {
      // MongoDB TTL index automatically handles this
      return true;
    } catch (error) {
      console.error('Clear cache error:', error);
      return false;
    }
  }
}

module.exports = new CacheService();