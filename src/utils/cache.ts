/**
 * Caching utility for API results
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number; // Time to live in milliseconds
}

class ApiCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private config: CacheConfig;
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: config.maxSize || 100,
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutes default
    };
    
    // Cleanup expired entries periodically
    setInterval(() => this.cleanup(), 60 * 1000); // Every minute
  }
  
  /**
   * Generate a cache key from parameters
   * @param service Service name (e.g., 'gemini', 'datamuse')
   * @param method Method name (e.g., 'translate', 'synonyms')
   * @param params Additional parameters
   * @returns Cache key string
   */
  generateKey(service: string, method: string, params: Record<string, any>): string {
    const paramStr = JSON.stringify(params);
    return `${service}:${method}:${paramStr}`;
  }
  
  /**
   * Get data from cache
   * @param key Cache key
   * @returns Cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set data in cache
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (optional, uses default if not provided)
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.config.maxSize) {
      this.removeOldest();
    }
    
    const now = Date.now();
    const expiresAt = now + (ttl || this.config.defaultTTL);
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }
  
  /**
   * Remove the oldest cache entry
   */
  private removeOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
  
  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   * @returns Object with cache statistics
   */
  getStats(): { size: number; maxSize: number; keys: string[] } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
  
  /**
   * Check if a key exists and is not expired
   * @param key Cache key
   * @returns boolean indicating if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
  
  /**
   * Remove a specific cache entry
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
}

// Export singleton instance
export const apiCache = new ApiCache();

// Export class for custom instances
export { ApiCache };

/**
 * Cache wrapper for async functions
 * @param fn Async function to wrap
 * @param cacheKey Cache key generator
 * @param ttl Time to live in milliseconds
 * @returns Wrapped function with caching
 */
export const withCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  cacheKey: (...args: Parameters<T>) => string,
  ttl?: number
): T => {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = cacheKey(...args);
    
    // Try to get from cache
    const cached = apiCache.get<ReturnType<T>>(key);
    if (cached !== null) {
      return cached;
    }
    
    // Execute the function
    const result = await fn(...args);
    
    // Cache the result
    apiCache.set(key, result, ttl);
    
    return result;
  }) as T;
};