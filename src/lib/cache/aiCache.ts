import { Redis } from 'ioredis';
import { env } from '@/lib/env';
import { logError } from '@/lib/monitoring/index';

const redis = new Redis(env.REDIS_URL || 'redis://localhost:6379');

interface CacheConfig {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class AICache {
  private static instance: AICache;
  private readonly defaultTTL = 3600; // 1 hour default TTL
  private readonly prefix: string;

  private constructor(config: CacheConfig = {}) {
    this.prefix = config.prefix || 'ai-cache:';
  }

  public static getInstance(config: CacheConfig = {}): AICache {
    if (!AICache.instance) {
      AICache.instance = new AICache(config);
    }
    return AICache.instance;
  }

  private generateKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(this.generateKey(key));
      if (!data) return null;

      const cached = JSON.parse(data) as CacheEntry<T>;
      return cached.data;
    } catch (error) {
      logError('Cache retrieval error', error, { key });
      return null;
    }
  }

  async set<T>(key: string, data: T, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
      };

      await redis.set(
        this.generateKey(key),
        JSON.stringify(entry),
        'EX',
        ttl
      );
    } catch (error) {
      logError('Cache set error', error, { key });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await redis.del(this.generateKey(key));
    } catch (error) {
      logError('Cache delete error', error, { key });
    }
  }

  async clearPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(this.generateKey(pattern));
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      logError('Cache clear pattern error', error, { pattern });
    }
  }
}

// Utility function to generate cache key for AI requests
export const generateAICacheKey = (
  type: 'recommendation' | 'bundling' | 'chat',
  params: Record<string, any>
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  return `${type}:${JSON.stringify(sortedParams)}`;
};

// Higher-order function for caching AI responses
export const withAICache = <T>(
  fn: (...args: any[]) => Promise<T>,
  type: 'recommendation' | 'bundling' | 'chat',
  ttl?: number
) => {
  return async (...args: any[]): Promise<T> => {
    const cache = AICache.getInstance();
    const cacheKey = generateAICacheKey(type, { args });

    const cached = await cache.get<T>(cacheKey);
    if (cached) return cached;

    const result = await fn(...args);
    await cache.set(cacheKey, result, ttl);
    
    return result;
  };
};