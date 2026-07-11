import { z } from 'zod';

const ethiopianPhoneRegex = /^\+251\d{9}$/;
const ethiopianPhoneMessage = 'Phone must be a valid Ethiopian number starting with +251 and 9 digits (e.g. +251911234567)';

const profileSchema = z.record(z.unknown()).default({});

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .refine((val) => /[A-Z]/.test(val), 'Password must contain an uppercase letter')
    .refine((val) => /[a-z]/.test(val), 'Password must contain a lowercase letter')
    .refine((val) => /[0-9]/.test(val), 'Password must contain a number')
    .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain a special character'),
  phone: z.string().regex(ethiopianPhoneRegex, ethiopianPhoneMessage).optional(),
  profile: profileSchema.optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});

const verifyEmailSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  code: z.string().length(6, 'Code must be exactly 6 digits'),
});

const resendVerificationSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

const requestPasswordResetSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

const verifyResetCodeSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  code: z.string().length(6, 'Code must be exactly 6 digits'),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .refine((val) => /[A-Z]/.test(val), 'Password must contain an uppercase letter')
    .refine((val) => /[a-z]/.test(val), 'Password must contain a lowercase letter')
    .refine((val) => /[0-9]/.test(val), 'Password must contain a number')
    .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain a special character'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .refine((val) => /[A-Z]/.test(val), 'Password must contain an uppercase letter')
    .refine((val) => /[a-z]/.test(val), 'Password must contain a lowercase letter')
    .refine((val) => /[0-9]/.test(val), 'Password must contain a number')
    .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain a special character'),
});

export { changePasswordSchema, loginSchema, registerSchema, verifyEmailSchema, resendVerificationSchema, requestPasswordResetSchema, verifyResetCodeSchema, resetPasswordSchema };
