// src/services/cache-service.js
class CacheService {
    constructor() {
      this.memoryCache = new Map();
      this.cacheTTL = 15 * 60 * 1000; // 15 minuti
    }
    
    getFromCache(key) {
      if (this.memoryCache.has(key)) {
        const cachedData = this.memoryCache.get(key);
        if (Date.now() - cachedData.timestamp < this.cacheTTL) {
          return cachedData.data;
        }
        this.memoryCache.delete(key);
      }
      return null;
    }
    
    setInCache(key, data) {
      this.memoryCache.set(key, {
        data,
        timestamp: Date.now()
      });
    }
  }
  
  export const cacheService = new CacheService();