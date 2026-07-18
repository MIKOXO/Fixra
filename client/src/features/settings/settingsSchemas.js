import { z } from 'zod';

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .refine((val) => /[A-Z]/.test(val), 'Must contain an uppercase letter')
      .refine((val) => /[a-z]/.test(val), 'Must contain a lowercase letter')
      .refine((val) => /[0-9]/.test(val), 'Must contain a number')
      .refine((val) => /[^A-Za-z0-9]/.test(val), 'Must contain a special character'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Passwords do not match',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from your current password',
    path: ['newPassword'],
  });
