import { Redis } from 'ioredis';

const REDIS_URL = process.env.UPSTASH_REDIS_URL;

let redis = null;

if (REDIS_URL) {
  redis = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 10) return null;
      return Math.min(times * 200, 5000);
    },
  });

  redis.on('error', () => {});
}

export { redis };
