import { z } from 'zod';

const ethiopianPhoneRegex = /^\+251\d{9}$/;
const ethiopianPhoneMessage = 'Phone must be a valid Ethiopian number starting with +251 and 9 digits (e.g. +251911234567)';

const generateInviteSchema = z.object({
  role: z.enum(['TENANT', 'TECHNICIAN', 'CONTRACTOR']),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  meta: z.record(z.unknown()).optional(),
});

const inviteTokenQuerySchema = z.object({
  token: z.string().trim().min(1, 'Invite token is required'),
});

const registerWithInviteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  password: z.string().min(8).max(128),
  phone: z.string().regex(ethiopianPhoneRegex, ethiopianPhoneMessage).optional(),
});

export { generateInviteSchema, inviteTokenQuerySchema, registerWithInviteSchema };
