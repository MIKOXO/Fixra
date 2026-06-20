import { Redis } from 'ioredis';

const REDIS_URL = process.env.UPSTASH_REDIS_URL;

let redis = null;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 50, 2000),
  });
}

export { redis };
