import { z } from 'zod';

const profileSchema = z.record(z.unknown()).default({});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  phone: z.string().trim().min(6).max(30).optional(),
  profile: profileSchema.optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

export { loginSchema, registerSchema };
