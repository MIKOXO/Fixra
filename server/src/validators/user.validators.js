import { z } from 'zod';

const ethiopianPhoneRegex = /^\+251\d{9}$/;
const ethiopianPhoneMessage = 'Phone must be a valid Ethiopian number starting with +251 and 9 digits (e.g. +251911234567)';

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().regex(ethiopianPhoneRegex, ethiopianPhoneMessage).optional(),
  profile: z.record(z.unknown()).optional(),
});

const fcmTokenSchema = z.object({
  fcmToken: z.string().min(1),
});

export { updateProfileSchema, fcmTokenSchema };
