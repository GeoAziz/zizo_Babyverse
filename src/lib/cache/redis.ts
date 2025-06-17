import { Redis } from 'ioredis';
import { env } from '@/lib/env';

if (!env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined in environment variables');
}

const redis = new Redis(env.REDIS_URL);

export const cacheSet = async (key: string, value: any, expireInSeconds: number = 3600) => {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', expireInSeconds);
    return true;
  } catch (error) {
    console.error('Error setting cache:', error);
    return false;
  }
};

export const cacheGet = async (key: string) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
};

export const cacheDelete = async (key: string) => {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting cache:', error);
    return false;
  }
};