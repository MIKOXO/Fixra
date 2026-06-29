import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import AuthShell from '@features/auth/AuthShell';
import useAuth from '@hooks/useAuth';
import useNotification from '@hooks/useNotification';
import useAutoClearErrors from '@hooks/useAutoClearErrors';
import Button from '@components/ui/Button';
import PasswordStrengthIndicator from '@components/ui/PasswordStrengthIndicator';

const resetSchema = z
  .object({
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(128)
      .refine((val) => /[A-Z]/.test(val), 'Password must contain an uppercase letter')
      .refine((val) => /[a-z]/.test(val), 'Password must contain a lowercase letter')
      .refine((val) => /[0-9]/.test(val), 'Password must contain a number')
      .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain a special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const resetToken = location.state?.resetToken;
  const { resetPassword, isLoading, error, clearError } = useAuth();
  const { notification, dismiss, showSuccess } = useNotification(error, {
    onErrorDismiss: clearError,
  });
  const navTimerRef = useRef(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useAutoClearErrors(errors, clearErrors);

  const passwordValue = watch('newPassword');

  const redirectToLogin = useCallback(() => {
    showSuccess('Password reset successfully. Please log in.');
    navTimerRef.current = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 1500);
  }, [navigate, showSuccess]);

  useEffect(() => {
    return () => {
      clearError();
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, [clearError]);

  if (!email || !resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    const result = await resetPassword({
      email,
      resetToken,
      newPassword: values.newPassword,
    });
    if (result?.error) return;
    redirectToLogin();
  });

  return (
    <AuthShell
      eyebrow="Reset password"
      title="Choose a new password"
      subtitle="Enter your new password below. Make sure it is strong and unique."
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
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal-700" htmlFor="newPassword">
              New password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={inputClassName}
                placeholder="Min 8 chars"
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
              >
                {showNewPassword ? (
                  <HiOutlineEyeOff className="w-5 h-5" />
                ) : (
                  <HiOutlineEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.newPassword?.message ? (
              <p className="mt-1 text-xs text-red-600">{errors.newPassword.message}</p>
            ) : null}
            <PasswordStrengthIndicator password={passwordValue} />
          </div>

          <div>
            <label className="text-sm font-medium text-charcoal-700" htmlFor="confirmPassword">
              Confirm password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={inputClassName}
                placeholder="Repeat password"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <HiOutlineEyeOff className="w-5 h-5" />
                ) : (
                  <HiOutlineEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword?.message ? (
              <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
            ) : null}
          </div>
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
          {isSubmitting || isLoading ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>
    </AuthShell>
  );
};

export default ResetPassword;
