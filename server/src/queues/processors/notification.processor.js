import { Worker } from 'bullmq';
import Notification from '../../models/Notification.js';
import DeadLetterLog from '../../models/DeadLetterLog.js';
import { redis } from '../../config/redis.js';

let notificationWorker = null;

if (redis) {
  notificationWorker = new Worker('notifications', async (job) => {
    const { notificationId, channels } = job.data;

    const notification = await Notification.findById(notificationId);
    if (!notification) return;

    for (const channel of channels) {
      if (channel === 'EMAIL') {
        console.log(`[Notification Worker] Would send EMAIL for notification ${notificationId}`);
      } else if (channel === 'PUSH') {
        console.log(`[Notification Worker] Would send PUSH for notification ${notificationId}`);
      }
    }

    notification.deliveryStatus = 'SENT';
    await notification.save();
  }, {
    connection: redis,
    concurrency: 5,
  });

  notificationWorker.on('failed', async (job, err) => {
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      await DeadLetterLog.create({
        queue: 'notifications',
        jobId: job.id,
        data: job.data,
        error: err.message,
        failedAt: new Date(),
      });
    }
  });
}

export { notificationWorker };
