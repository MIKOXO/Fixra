import { z } from 'zod';

const createEstimateSchema = z.object({
  ticketId: z.string(),
  estimatedCost: z.number().positive(),
});

const rejectEstimateSchema = z.object({
  reason: z.string().trim().min(1).max(500),
});

const dispatchTechnicianSchema = z.object({
  technicianId: z.string(),
});

export { createEstimateSchema, dispatchTechnicianSchema, rejectEstimateSchema };
