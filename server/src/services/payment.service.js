import Job from '../models/Job.js';
import User from '../models/User.js';
import { generateReceipt } from './pdf.service.js';
import { uploadBuffer } from './upload.service.js';
import { AppError } from '../middleware/error.middleware.js';

const processPayment = async (jobId) => {
  const job = await Job.findById(jobId).populate('ticketId').populate('contractorId');

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.paymentStatus === 'PAID') {
    return job;
  }

  const ticket = job.ticketId;
  const contractor = job.contractorId;

  if (!ticket) {
    throw new AppError('Associated ticket not found', 404, 'TICKET_NOT_FOUND');
  }

  const landlord = await User.findById(ticket.landlordId);

  if (!landlord) {
    throw new AppError('Landlord not found', 404, 'LANDLORD_NOT_FOUND');
  }

  const pdfBuffer = await generateReceipt(job, ticket, landlord, contractor);

  const result = await uploadBuffer(pdfBuffer, 'fixra/receipts', {
    resourceType: 'raw',
    public_id: `receipt-${job._id}`,
  });

  job.paymentStatus = 'PAID';
  job.receiptUrl = result.url;
  await job.save();

  return job;
};

export { processPayment };
