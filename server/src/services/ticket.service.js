import Ticket from '../models/Ticket.js';
import User from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';

const TRANSITIONS = {
  REPORTED: { TRIAGED: ['LANDLORD'] },
  TRIAGED: { ASSIGNED: ['LANDLORD'] },
  ASSIGNED: { IN_PROGRESS: ['CONTRACTOR'] },
  IN_PROGRESS: { PENDING_REVIEW: ['TECHNICIAN'] },
  PENDING_REVIEW: { RESOLVED: ['TENANT'], ASSIGNED: ['TENANT'] },
  RESOLVED: { CLOSED: ['LANDLORD', 'SUPER_ADMIN'] },
};

const buildTicketFilter = (user) => {
  switch (user.role) {
    case 'TENANT':
      return { tenantId: user.id };
    case 'LANDLORD':
      return { landlordId: user.id };
    case 'CONTRACTOR':
      return { contractorId: user.id };
    case 'TECHNICIAN':
      return { technicianId: user.id };
    default:
      return {};
  }
};

const createTicket = async (tenantId, data) => {
  const tenant = await User.findById(tenantId);

  if (!tenant || tenant.role !== 'TENANT') {
    throw new AppError('Only tenants can create tickets', 403, 'FORBIDDEN');
  }

  if (!tenant.profile?.propertyId || !tenant.profile?.landlordId) {
    throw new AppError('Tenant is not assigned to a property', 400, 'TENANT_NOT_ASSIGNED');
  }

  const attachments = (data.attachments || []).map((att) => ({
    url: att.url,
    type: att.type,
    uploadedBy: tenantId,
  }));

  const ticket = await Ticket.create({
    title: data.title,
    description: data.description,
    category: data.category,
    priority: data.priority || 'MEDIUM',
    propertyId: tenant.profile.propertyId,
    unitId: tenant.profile.unitId || null,
    tenantId,
    landlordId: tenant.profile.landlordId,
    attachments,
    status: 'REPORTED',
    auditTrail: [
      {
        fromStatus: null,
        toStatus: 'REPORTED',
        actorId: tenantId,
        reason: 'Ticket submitted',
        timestamp: new Date(),
      },
    ],
  });

  return ticket;
};

const transitionStatus = async (ticketId, actorId, role, toStatus, reason, extra = {}) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
  }

  const allowed = TRANSITIONS[ticket.status];

  if (!allowed || !allowed[toStatus]) {
    throw new AppError(
      `Cannot transition from ${ticket.status} to ${toStatus}`,
      400,
      'INVALID_TRANSITION'
    );
  }

  if (!allowed[toStatus].includes(role)) {
    throw new AppError(
      `Role ${role} is not allowed to move from ${ticket.status} to ${toStatus}`,
      403,
      'FORBIDDEN'
    );
  }

  if (toStatus === 'ASSIGNED' && ticket.status === 'PENDING_REVIEW' && !reason) {
    throw new AppError('Reason is required when rejecting a resolution', 400, 'REASON_REQUIRED');
  }

  if (toStatus === 'ASSIGNED' && ticket.status === 'TRIAGED') {
    if (!extra.contractorId) {
      throw new AppError('Contractor ID is required when assigning', 400, 'CONTRACTOR_REQUIRED');
    }
    ticket.contractorId = extra.contractorId;
  }

  const fromStatus = ticket.status;
  ticket.status = toStatus;

  ticket.auditTrail.push({
    fromStatus,
    toStatus,
    actorId,
    reason: reason || '',
    timestamp: new Date(),
  });

  if (toStatus === 'RESOLVED') {
    ticket.autoCloseAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  }

  await ticket.save();

  return ticket;
};

const addNote = async (ticketId, actorId, text) => {
  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
  }

  ticket.notes.push({
    text,
    addedBy: actorId,
    createdAt: new Date(),
  });

  await ticket.save();

  return ticket;
};

const getTicketById = async (ticketId, user) => {
  const filter = { _id: ticketId, ...buildTicketFilter(user) };
  const ticket = await Ticket.findOne(filter);

  if (!ticket) {
    throw new AppError('Ticket not found', 404, 'TICKET_NOT_FOUND');
  }

  return ticket;
};

const getTickets = async (user) => {
  const filter = buildTicketFilter(user);
  const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
  return tickets;
};

const addAttachment = async (ticketId, user, attachment) => {
  const ticket = await getTicketById(ticketId, user);

  ticket.attachments.push(attachment);
  await ticket.save();

  return ticket;
};

export { addAttachment, addNote, createTicket, getTicketById, getTickets, transitionStatus };
