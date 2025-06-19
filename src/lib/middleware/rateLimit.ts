import { Redis } from 'ioredis';
import { env } from '@/lib/env';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const redis = new Redis(env.REDIS_URL || 'redis://localhost:6379');

export const rateLimiter = async (req: NextRequest) => {
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'anonymous';
  const key = `rate-limit:${ip}`;
  
  try {
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.expire(key, 60); // Reset after 60 seconds
    }
    
    if (requests > 60) { // 60 requests per minute limit
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }
    
    return null; // Continue to the API route
  } catch (error) {
    console.error('Rate limiting error:', error);
    return null; // Continue on error
  }
};

export const apiRateLimit = async (ip: string, endpoint: string, limit: number = 60, windowMs: number = 60000) => {
  const key = `rate-limit:${endpoint}:${ip}`;
  
  try {
    const requests = await redis.incr(key);
    
    if (requests === 1) {
      await redis.pexpire(key, windowMs);
    }
    
    return requests <= limit;
  } catch (error) {
    console.error('API rate limiting error:', error);
    return true; // Allow on error
  }
};