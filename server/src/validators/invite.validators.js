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
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .refine((val) => /[A-Z]/.test(val), 'Password must contain an uppercase letter')
    .refine((val) => /[a-z]/.test(val), 'Password must contain a lowercase letter')
    .refine((val) => /[0-9]/.test(val), 'Password must contain a number')
    .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain a special character'),
  phone: z.string().regex(ethiopianPhoneRegex, ethiopianPhoneMessage).optional(),
});

export { generateInviteSchema, inviteTokenQuerySchema, registerWithInviteSchema };
