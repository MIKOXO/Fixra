import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { HiOutlineMail } from 'react-icons/hi';
import AuthShell from '@features/auth/AuthShell';
import useAuth from '@hooks/useAuth';
import useNotification from '@hooks/useNotification';
import useAutoClearErrors from '@hooks/useAutoClearErrors';
import Button from '@components/ui/Button';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Enter a valid email address')
    .transform((value) => value.toLowerCase()),
});

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { requestPasswordReset, isLoading, error, clearError } = useAuth();
  const { notification, dismiss, showSuccess } = useNotification(error, {
    onErrorDismiss: clearError,
  });
  const navTimerRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  useAutoClearErrors(errors, clearErrors);

  useEffect(() => {
    return () => {
      clearError();
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, [clearError]);

  const onSubmit = handleSubmit(async (values) => {
    const result = await requestPasswordReset(values.email);
    if (result?.error) return;
    showSuccess('If an account exists, a code has been sent.');

    navTimerRef.current = setTimeout(() => {
      navigate('/verify-reset-code', { state: { email: values.email } });
    }, 1500);
  });

  return (
    <AuthShell
      eyebrow="Forgot password"
      title="Reset your password"
      subtitle="Enter your email address and we will send you a code to reset your password."
      footer={
        <Link
          to="/login"
          className="text-sm font-semibold text-charcoal-600 transition-colors hover:text-primary-600"
        >
          Back to login
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-charcoal-700" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputClassName}
              placeholder="you@company.com"
              {...register('email')}
            />
            <HiOutlineMail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          </div>
          {errors.email?.message ? (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        {notification ? (
          <div
            className={`rounded-xl border px-4 py-2.5 text-xs ${
              notification.type === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-sage-200 bg-sage-50 text-sage-700'
            } flex items-center justify-between gap-3`}
          >
            <span>{notification.message}</span>
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 text-2xl leading-none opacity-60 hover:opacity-100 transition-opacity"
            >
              &times;
            </button>
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          loading={isSubmitting || isLoading}
          variant="primary"
        >
          {isSubmitting || isLoading ? 'Sending...' : 'Send reset code'}
        </Button>
      </form>
    </AuthShell>
  );
};

export default ForgotPassword;
