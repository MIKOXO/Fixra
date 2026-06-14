import { z } from 'zod';

const generateInviteSchema = z.object({
  role: z.enum(['TENANT', 'TECHNICIAN', 'CONTRACTOR']),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  meta: z.record(z.unknown()).optional(),
});

const registerWithInviteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(128),
  phone: z.string().trim().min(6).max(30).optional(),
});

export { generateInviteSchema, registerWithInviteSchema };
