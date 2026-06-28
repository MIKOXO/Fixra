import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import AuthShell from '@features/auth/AuthShell';
import { getDashboardPathForRole } from '@features/auth/auth.utils';
import useAuth from '@hooks/useAuth';
import useAutoClearErrors from '@hooks/useAutoClearErrors';
import useNotification from '@hooks/useNotification';
import Button from '@components/ui/Button';

const verifySchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits'),
});

const RESEND_COOLDOWN = 60;

const maskEmail = (email) => {
  const [local, domain] = email.split('@');
  const maskedLocal = local.length <= 2
    ? local[0] + '*'.repeat(Math.max(local.length - 1, 1))
    : local[0] + '***';
  return `${maskedLocal}@${domain}`;
};

const formatTimeLeft = (ms) => {
  if (ms <= 0) return 'Expired';
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const initialExpiresAt = location.state?.expiresAt;
  const { verifyEmail, resendVerification, user, isAuthenticated, isLoading, error, clearError } = useAuth();
  const { notification, dismiss } = useNotification(error, { onErrorDismiss: clearError });
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt ? new Date(initialExpiresAt).getTime() : null);
  const [timeLeft, setTimeLeft] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    clearErrors,
    watch,
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  useAutoClearErrors(errors, clearErrors);

  const codeValue = watch('code');

  const redirectAfterSuccess = useCallback((role) => {
    navigate(getDashboardPathForRole(role), { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectAfterSuccess(user.role);
    }
  }, [isAuthenticated, user, redirectAfterSuccess]);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const startCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      setTimeLeft(Math.max(0, expiresAt - Date.now()));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!email) {
    return (
      <AuthShell
        eyebrow="Verify email"
        title="No email found"
        subtitle="We could not determine which email to verify. Try logging in and check if you need to register first."
        footer={
          <Link
            to="/login"
            className="text-sm font-semibold text-charcoal-600 transition-colors hover:text-primary-600"
          >
            Back to login
          </Link>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-charcoal-600">
            If you already have an account,{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              log in here
            </Link>
            . Otherwise,{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
              create a new account
            </Link>
            .
          </p>
        </div>
      </AuthShell>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    const result = await verifyEmail({ email, code: values.code });
    if (result?.error) return;
    const loggedInUser = result?.payload;
    if (loggedInUser) {
      redirectAfterSuccess(loggedInUser.role);
    }
  });

  const handleResend = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    const result = await resendVerification(email);
    if (!result?.error) {
      startCooldown();
      if (result?.payload?.expiresAt) {
        setExpiresAt(new Date(result.payload.expiresAt).getTime());
      }
    }
  };

  const handleDigitChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length > 1) return;
    const chars = codeValue.split('');
    chars[index] = val;
    const newCode = chars.join('');
    setValue('code', newCode, { shouldValidate: true });
    if (val && index < 5) {
      const next = document.getElementById(`code-${index + 1}`);
      next?.focus();
    }
  };

  const handleDigitKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !codeValue[index] && index > 0) {
      const prev = document.getElementById(`code-${index - 1}`);
      prev?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setValue('code', pasted, { shouldValidate: true });
      document.getElementById('code-5')?.focus();
    }
  };

  return (
    <AuthShell
      eyebrow="Verify email"
      title="Check your inbox"
      subtitle={
        <>
          A 6-digit code has been sent to <strong className="text-charcoal-950">{maskEmail(email)}</strong>.
          {expiresAt ? (
            <span className="mt-1 block text-xs text-charcoal-500">
              {timeLeft > 0 ? `Code expires in ${formatTimeLeft(timeLeft)}` : 'Code expired'}
            </span>
          ) : (
            <span> It expires in 10 minutes.</span>
          )}
        </>
      }
      footer={
        <Link
          to="/login"
          className="text-sm font-semibold text-charcoal-600 transition-colors hover:text-primary-600"
        >
          Back to login
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="mb-3 block text-center text-sm font-medium text-charcoal-700">
            Verification code
          </label>
          <div className="flex items-center justify-center gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                id={`code-${i}`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={codeValue[i] || ''}
                onChange={(e) => handleDigitChange(e, i)}
                onKeyDown={(e) => handleDigitKeyDown(e, i)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="h-12 w-11 rounded-xl border bg-white text-center text-xl font-bold text-charcoal-950 outline-none transition duration-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
              />
            ))}
          </div>
          <input type="hidden" {...register('code')} />
          {errors.code?.message ? (
            <p className="mt-2 text-center text-xs text-red-600">{errors.code.message}</p>
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
          disabled={isSubmitting || isLoading || codeValue.length !== 6}
          loading={isSubmitting || isLoading}
          variant="primary"
          className="w-full"
        >
          {isSubmitting || isLoading ? 'Verifying...' : 'Verify email'}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || isSubmitting}
            className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 disabled:cursor-not-allowed disabled:text-charcoal-400"
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : 'Resend code'}
          </button>
        </div>
      </form>
    </AuthShell>
  );
};

export default VerifyEmail;
