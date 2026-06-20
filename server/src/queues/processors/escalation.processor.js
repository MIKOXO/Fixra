import { Worker } from 'bullmq';
import Ticket from '../../models/Ticket.js';
import { transitionStatus } from '../../services/ticket.service.js';
import { redis } from '../../config/redis.js';

const SYSTEM_ACTOR_ID = '000000000000000000000000';

let escalationWorker = null;

if (redis) {
  escalationWorker = new Worker('escalations', async (job) => {
    const { ticketId } = job.data;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket || ticket.status !== 'RESOLVED') return;

    await transitionStatus(
      ticketId,
      SYSTEM_ACTOR_ID,
      'SUPER_ADMIN',
      'CLOSED',
      'Auto-closed: tenant did not confirm resolution within 3 days'
    );
  }, {
    connection: redis,
    concurrency: 5,
  });
}

export { escalationWorker };
