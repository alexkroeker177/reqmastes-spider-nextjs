interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiration: number; // Custom expiration time in milliseconds
}

interface Cache {
  [key: string]: CacheItem<any>;
}

// In-memory cache store
const cache: Cache = {};

// Default cache durations
export const CACHE_DURATIONS = {
  DEFAULT: 15 * 60 * 1000, // 15 minutes
  CURRENT_MONTH: 30 * 60 * 1000, // 30 minutes
  PREVIOUS_MONTH: 6 * 60 * 60 * 1000, // 6 hours
  OLDER_MONTHS: 24 * 60 * 60 * 1000, // 24 hours
};

export function getCachedData<T>(key: string): T | null {
  const item = cache[key];
  if (!item) return null;

  const now = Date.now();
  if (now - item.timestamp > item.expiration) {
    // Cache expired
    delete cache[key];
    return null;
  }

  return item.data;
}

export function setCachedData<T>(key: string, data: T, expiration = CACHE_DURATIONS.DEFAULT): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
    expiration
  };
}

export function clearCache(key?: string): void {
  if (key) {
    delete cache[key];
  } else {
    Object.keys(cache).forEach(k => delete cache[k]);
  }
} 