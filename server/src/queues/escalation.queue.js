import { Queue } from 'bullmq';
import { redis } from '../config/redis.js';

const escalationQueue = redis
  ? new Queue('escalations', { connection: redis })
  : null;

const scheduleAutoClose = async (ticketId, delayMs) => {
  if (!escalationQueue) {
    console.warn('Redis not configured; skipping auto-close scheduling');
    return;
  }

  await escalationQueue.add('auto-close', { ticketId }, {
    delay: delayMs,
    jobId: String(ticketId),
  });
};

const removeAutoClose = async (ticketId) => {
  if (!escalationQueue) return;

  try {
    await escalationQueue.remove(String(ticketId));
  } catch {
    // Job may not exist; ignore
  }
};

export { escalationQueue, scheduleAutoClose, removeAutoClose };
