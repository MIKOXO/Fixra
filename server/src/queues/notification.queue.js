import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

const notificationQueue = redis
  ? new Queue('notifications', { connection: redis })
  : null;

const enqueueNotification = async (notificationId, channels) => {
  if (!notificationQueue) {
    console.warn('Redis not configured; skipping notification queue');
    return;
  }

  await notificationQueue.add('process-notification', { notificationId, channels }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
};

export { notificationQueue, enqueueNotification };
