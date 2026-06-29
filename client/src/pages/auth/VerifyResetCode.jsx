import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import AuthShell from '@features/auth/AuthShell';
import useAuth from '@hooks/useAuth';
import useNotification from '@hooks/useNotification';
import useAutoClearErrors from '@hooks/useAutoClearErrors';
import Button from '@components/ui/Button';

const verifyCodeSchema = z.object({
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

const VerifyResetCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const { verifyResetCode, requestPasswordReset, isLoading, error, clearError } = useAuth();
  const { notification, dismiss, showSuccess } = useNotification(error, {
    onErrorDismiss: clearError,
  });
  const navTimerRef = useRef(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: { code: '' },
  });

  useAutoClearErrors(errors, clearErrors);

  const codeValue = watch('code');

  const onVerified = useCallback((resetToken) => {
    showSuccess('Code verified. Now set a new password.');
    navTimerRef.current = setTimeout(() => {
      navigate('/reset-password', { state: { email, resetToken } });
    }, 1500);
  }, [navigate, email, showSuccess]);

  useEffect(() => {
    return () => {
      clearError();
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
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

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    const result = await verifyResetCode({ email, code: values.code });
    if (result?.error) return;
    const resetToken = result?.payload?.resetToken;
    if (resetToken) {
      onVerified(resetToken);
    }
  });

  const handleResend = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    const result = await requestPasswordReset(email);
    if (!result?.error) {
      startCooldown();
      showSuccess('A new reset code has been sent to your email.');
    }
  };

  const handleDigitChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length > 1) return;
    const chars = (codeValue || '').split('');
    chars[index] = val;
    const newCode = chars.join('');
    setValue('code', newCode, { shouldValidate: true });
    if (val && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleDigitKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !(codeValue || '')[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
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
      eyebrow="Reset password"
      title="Check your inbox"
      subtitle={
        <>
          A 6-digit code has been sent to <strong className="text-charcoal-950">{maskEmail(email)}</strong>.
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
            Reset code
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
                value={(codeValue || '')[i] || ''}
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
          disabled={isSubmitting || isLoading || (codeValue || '').length !== 6}
          loading={isSubmitting || isLoading}
          variant="primary"
        >
          {isSubmitting || isLoading ? 'Verifying...' : 'Verify code'}
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

export default VerifyResetCode;
