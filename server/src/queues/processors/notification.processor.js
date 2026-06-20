import { Worker } from 'bullmq';
import Notification from '../../models/Notification.js';
import DeadLetterLog from '../../models/DeadLetterLog.js';
import User from '../../models/User.js';
import Ticket from '../../models/Ticket.js';
import Job from '../../models/Job.js';
import { redis } from '../../config/redis.js';
import { sendEmail } from '../../services/email.service.js';
import { sendPush } from '../../services/push.service.js';
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
        const recipient = await User.findById(notification.recipientId);
        if (!recipient?.fcmToken) continue;

        const pushTitles = {
          TICKET_CREATED: 'Ticket Created',
          TICKET_TRIAGED: 'Ticket Triaged',
          TICKET_ASSIGNED: 'Ticket Assigned',
          TICKET_IN_PROGRESS: 'Ticket In Progress',
          TICKET_PENDING_REVIEW: 'Pending Review',
          TICKET_RESOLVED: 'Ticket Resolved',
          TICKET_REOPENED: 'Ticket Reopened',
          TICKET_CLOSED: 'Ticket Closed',
          ESTIMATE_SUBMITTED: 'Estimate Submitted',
          ESTIMATE_APPROVED: 'Estimate Approved',
          ESTIMATE_REJECTED: 'Estimate Rejected',
        };

        const title = pushTitles[notification.type] || 'Notification';
        const dataPayload = {};
        if (notification.ticketId) dataPayload.ticketId = notification.ticketId.toString();

        const result = await sendPush(recipient.fcmToken, title, notification.message, dataPayload);
        if (!result.success) {
          throw new Error(`Push send failed for notification ${notificationId}: ${result.error}`);
        }
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
