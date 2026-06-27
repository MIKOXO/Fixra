import { z } from 'zod';

const ethiopianPhoneRegex = /^\+251\d{9}$/;
const ethiopianPhoneMessage = 'Phone must be a valid Ethiopian number starting with +251 and 9 digits (e.g. +251911234567)';

const profileSchema = z.record(z.unknown()).default({});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  phone: z.string().regex(ethiopianPhoneRegex, ethiopianPhoneMessage).optional(),
  profile: profileSchema.optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

export { loginSchema, registerSchema };
