import { Worker } from 'bullmq';
import Notification from '../../models/Notification.js';
import DeadLetterLog from '../../models/DeadLetterLog.js';
import User from '../../models/User.js';
import Ticket from '../../models/Ticket.js';
import Job from '../../models/Job.js';
import { redis } from '../../config/redis.js';
import { sendEmail } from '../../services/email.service.js';
import { ticketStatusTemplate, estimateSubmittedTemplate, estimateApprovedTemplate } from '../../utils/emailTemplates.js';

let notificationWorker = null;

if (redis) {
  notificationWorker = new Worker('notifications', async (job) => {
    const { notificationId, channels } = job.data;

    const notification = await Notification.findById(notificationId);
    if (!notification) return;

    for (const channel of channels) {
      if (channel === 'EMAIL') {
        const recipient = await User.findById(notification.recipientId);
        if (!recipient?.email) continue;

        const ticket = await Ticket.findById(notification.ticketId);
        if (!ticket) continue;

        let subject, html;

        if (notification.type.startsWith('TICKET_')) {
          const status = notification.type === 'TICKET_REOPENED' ? 'ASSIGNED' : notification.type.replace('TICKET_', '');
          ({ subject, html } = ticketStatusTemplate(ticket, status));
        } else if (notification.type === 'ESTIMATE_SUBMITTED' || notification.type === 'ESTIMATE_APPROVED') {
          const jobData = ticket.jobId ? await Job.findById(ticket.jobId) : null;
          if (!jobData) continue;

          ({ subject, html } = notification.type === 'ESTIMATE_SUBMITTED'
            ? estimateSubmittedTemplate(jobData, ticket)
            : estimateApprovedTemplate(jobData, ticket));
        } else if (notification.type === 'ESTIMATE_REJECTED') {
          ({ subject, html } = ticketStatusTemplate(ticket, 'REJECTED'));
        }

        if (!subject || !html) continue;

        const result = await sendEmail(recipient.email, subject, html);
        if (!result.success) {
          throw new Error(`Email send failed for notification ${notificationId}: ${result.error}`);
        }
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
