import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(6).max(30).optional(),
  profile: z.record(z.unknown()).optional(),
});

const fcmTokenSchema = z.object({
  fcmToken: z.string().min(1),
});

export { updateProfileSchema, fcmTokenSchema };
