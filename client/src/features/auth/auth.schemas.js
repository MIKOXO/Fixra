import { z } from 'zod';

const optionalPhoneSchema = z.preprocess(
  (value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    return value;
  },
  z.string().trim().min(6, 'Phone number must be at least 6 characters').max(30).optional()
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
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
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
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string().min(8, 'Please confirm your password').max(128),
    phone: optionalPhoneSchema,
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export { inviteRegisterSchema, loginSchema, registerSchema };
