import Job from '../models/Job.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { addNote, transitionStatus } from './ticket.service.js';
import { AppError } from '../middleware/error.middleware.js';

const createEstimate = async (contractorId, ticketId, estimatedCost) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
  }

  if (ticket.status !== 'ASSIGNED') {
    throw new AppError('Ticket must be in ASSIGNED status to create an estimate', 400, 'INVALID_TICKET_STATUS');
  }

  if (ticket.contractorId?.toString() !== contractorId) {
    throw new AppError('You are not assigned to this ticket', 403, 'FORBIDDEN');
  }

  const existingJob = await Job.findOne({ ticketId, approvalStatus: { $ne: 'REJECTED' } });
  if (existingJob) {
    throw new AppError('An active estimate already exists for this ticket', 409, 'ESTIMATE_EXISTS');
  }

  const job = await Job.create({ ticketId, contractorId, estimatedCost });

  ticket.jobId = job._id;
  await ticket.save();

  return job;
};

const approveEstimate = async (jobId, landlordId) => {
  const job = await Job.findById(jobId).populate('ticketId');

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.approvalStatus !== 'PENDING') {
    throw new AppError('Estimate has already been processed', 400, 'ESTIMATE_PROCESSED');
  }

  const ticket = job.ticketId;

  if (ticket.landlordId?.toString() !== landlordId) {
    throw new AppError('You do not own this property', 403, 'FORBIDDEN');
  }

  job.approvalStatus = 'APPROVED';
  job.approvedAt = new Date();
  await job.save();

  await transitionStatus(ticket._id.toString(), landlordId, 'LANDLORD', 'IN_PROGRESS', 'Estimate approved');

  return job;
};

const rejectEstimate = async (jobId, landlordId, reason) => {
  const job = await Job.findById(jobId).populate('ticketId');

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.approvalStatus !== 'PENDING') {
    throw new AppError('Estimate has already been processed', 400, 'ESTIMATE_PROCESSED');
  }

  const ticket = job.ticketId;

  if (ticket.landlordId?.toString() !== landlordId) {
    throw new AppError('You do not own this property', 403, 'FORBIDDEN');
  }

  job.approvalStatus = 'REJECTED';
  await job.save();

  await addNote(ticket._id.toString(), landlordId, `Estimate rejected: ${reason}`);

  return job;
};

const dispatchTechnician = async (jobId, contractorId, technicianId) => {
  const job = await Job.findById(jobId);

  if (!job) {
    throw new AppError('Job not found', 404, 'JOB_NOT_FOUND');
  }

  if (job.contractorId?.toString() !== contractorId) {
    throw new AppError('You are not the contractor for this job', 403, 'FORBIDDEN');
  }

  const tech = await User.findById(technicianId);

  if (!tech || tech.role !== 'TECHNICIAN') {
    throw new AppError('Technician not found', 404, 'TECHNICIAN_NOT_FOUND');
  }

  if (tech.profile?.contractorId?.toString() !== contractorId) {
    throw new AppError('This technician does not belong to your company', 403, 'FORBIDDEN');
  }

  const ticket = await Ticket.findById(job.ticketId);

  if (!ticket) {
    throw new AppError('Associated ticket not found', 404, 'TICKET_NOT_FOUND');
  }

  job.technicianId = technicianId;
  await job.save();

  ticket.technicianId = technicianId;
  await ticket.save();

  return job;
};

const getJobByTicket = async (ticketId) => {
  const job = await Job.findOne({ ticketId })
    .populate('contractorId', 'name email profile.businessName')
    .populate('technicianId', 'name email');

  if (!job) {
    throw new AppError('Job not found for this ticket', 404, 'JOB_NOT_FOUND');
  }

  return job;
};

export { approveEstimate, createEstimate, dispatchTechnician, getJobByTicket, rejectEstimate };
