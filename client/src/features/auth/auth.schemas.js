import { z } from 'zod';

const ethiopianPhoneRegex = /^\+251\d{9}$/;

const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    return value;
  },
  z.string().regex(ethiopianPhoneRegex, 'Phone must be a valid Ethiopian number starting with +251 and 9 digits (e.g. +251911234567)').optional()
);

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'Password is required').max(128),
});

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(100),
    email: z
      .string()
      .trim()
      .email('Enter a valid email address')
      .transform((value) => value.toLowerCase()),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .refine((val) => /[A-Z]/.test(val), 'Password must contain an uppercase letter')
      .refine((val) => /[a-z]/.test(val), 'Password must contain a lowercase letter')
      .refine((val) => /[0-9]/.test(val), 'Password must contain a number')
      .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain a special character'),
    confirmPassword: z.string().min(8, 'Please confirm your password').max(128),
    phone: optionalPhoneSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

const inviteRegisterSchema = z
  .object({
    name: z.string().trim().min(2, 'Name is too short').max(100),
    email: z
      .string()
      .trim()
      .email('Enter a valid email address')
      .transform((value) => value.toLowerCase()),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .refine((val) => /[A-Z]/.test(val), 'Password must contain an uppercase letter')
      .refine((val) => /[a-z]/.test(val), 'Password must contain a lowercase letter')
      .refine((val) => /[0-9]/.test(val), 'Password must contain a number')
      .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain a special character'),
    confirmPassword: z.string().min(8, 'Please confirm your password').max(128),
    phone: optionalPhoneSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export { inviteRegisterSchema, loginSchema, registerSchema };
