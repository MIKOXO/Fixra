import { z } from 'zod';

const attachmentSchema = z.object({
  url: z.string().url(),
  type: z.string().min(1),
});

const createTicketSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  category: z.enum(['PLUMBING', 'ELECTRICAL', 'STRUCTURAL', 'APPLIANCE', 'HVAC', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']).optional(),
  attachments: z.array(attachmentSchema).max(10).optional(),
});

const transitionStatusSchema = z.object({
  status: z.enum(['REPORTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_REVIEW', 'RESOLVED', 'CLOSED']),
  reason: z.string().trim().max(500).optional(),
  contractorId: z.string().optional(),
});

const addNoteSchema = z.object({
  text: z.string().trim().min(1).max(1000),
});

export { addNoteSchema, createTicketSchema, transitionStatusSchema };
