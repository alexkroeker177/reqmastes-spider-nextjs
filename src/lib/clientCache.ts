interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiration: number; // Custom expiration time in milliseconds
}

// Cache durations in milliseconds
export const CACHE_DURATIONS = {
  DEFAULT: 15 * 60 * 1000, // 15 minutes
  CURRENT_MONTH: 30 * 60 * 1000, // 30 minutes
  PREVIOUS_MONTH: 6 * 60 * 60 * 1000, // 6 hours
  OLDER_MONTHS: 24 * 60 * 60 * 1000, // 24 hours
};

export function getClientCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const { data, timestamp, expiration }: CacheItem<T> = JSON.parse(item);
    const now = Date.now();

    if (now - timestamp > expiration) {
      // Cache expired
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading from client cache:', error);
    return null;
  }
}

export function setClientCache<T>(key: string, data: T, expiration = CACHE_DURATIONS.DEFAULT): void {
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiration
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error('Error writing to client cache:', error);
  }
}

export function clearClientCache(key?: string): void {
  try {
    if (key) {
      localStorage.removeItem(key);
    } else {
      localStorage.clear();
    }
  } catch (error) {
    console.error('Error clearing client cache:', error);
  }
} 