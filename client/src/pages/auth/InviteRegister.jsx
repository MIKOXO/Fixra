import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineEye, HiOutlineEyeOff, HiOutlineInformationCircle } from 'react-icons/hi';
import AuthShell from '@features/auth/AuthShell';
import { inviteRegisterSchema } from '@features/auth/auth.schemas';
import { getDashboardPathForRole, getRoleLabel } from '@features/auth/auth.utils';
import { fetchInviteTokenMeta } from '@services/auth.api';
import useAuth from '@hooks/useAuth';
import useNotification from '@hooks/useNotification';
import useAutoClearErrors from '@hooks/useAutoClearErrors';
import Button from '@components/ui/Button';
import PhoneInput from '@components/ui/PhoneInput';
import PasswordStrengthIndicator from '@components/ui/PasswordStrengthIndicator';

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const inviteErrorMessages = {
  TOKEN_EXPIRED: 'This invite has expired. Ask your inviter to generate a new one.',
  TOKEN_USED: 'This invite has already been used.',
  INVALID_TOKEN: 'This invite link is invalid.',
  TOKEN_REQUIRED: 'This invite link is missing its token.',
};

const buildContextLines = (invite) => {
  const meta = invite?.meta || {};
  const lines = [];

  if (invite?.role) {
    lines.push({ label: 'Role', value: getRoleLabel(invite.role) });
  }

  if (invite?.email) {
    lines.push({ label: 'Email', value: invite.email });
  }

  if (invite?.role === 'TENANT') {
    if (meta.landlordName) {
      lines.push({
        label: 'Landlord',
        value: meta.landlordEmail
          ? `${meta.landlordName} (${meta.landlordEmail})`
          : meta.landlordName,
      });
    } else if (meta.landlordId) {
      lines.push({ label: 'Landlord', value: meta.landlordId });
    }

    if (meta.propertyName) {
      const location = [meta.propertyHouseNumber, meta.propertyCity].filter(Boolean).join(', ');
      lines.push({
        label: 'Property',
        value: location ? `${meta.propertyName} \u2014 ${location}` : meta.propertyName,
      });
    } else if (meta.propertyId) {
      lines.push({ label: 'Property ID', value: meta.propertyId });
    }

    if (meta.unitId) {
      lines.push({ label: 'Unit', value: meta.unitId });
    }
  }

  if (invite?.role === 'TECHNICIAN') {
    if (meta.contractorId) {
      lines.push({ label: 'Contractor ID', value: meta.contractorId });
    }

    if (Array.isArray(meta.specializations) && meta.specializations.length > 0) {
      lines.push({ label: 'Specializations', value: meta.specializations.join(', ') });
    }
  }

  if (invite?.role === 'CONTRACTOR') {
    if (meta.businessName) {
      lines.push({ label: 'Business', value: meta.businessName });
    }

    if (Array.isArray(meta.serviceCategories) && meta.serviceCategories.length > 0) {
      lines.push({ label: 'Services', value: meta.serviceCategories.join(', ') });
    }

    if (meta.landlordName) {
      lines.push({
        label: 'Landlord',
        value: meta.landlordEmail
          ? `${meta.landlordName} (${meta.landlordEmail})`
          : meta.landlordName,
      });
    } else if (meta.landlordId) {
      lines.push({ label: 'Landlord', value: meta.landlordId });
    }
  }

  return lines;
};

const InviteRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() || '';
  const { registerWithInvite, user, isAuthenticated, isLoading, error, clearError } = useAuth();
  const { notification, dismiss, showSuccess } = useNotification(error, {
    onErrorDismiss: clearError,
  });
  const navTimerRef = useRef(null);
  const [invite, setInvite] = useState(null);
  const [inviteStatus, setInviteStatus] = useState('loading');
  const [inviteMessage, setInviteMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    reset,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm({
    resolver: zodResolver(inviteRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  useAutoClearErrors(errors, clearErrors);

  const passwordValue = watch('password');
  const contextLines = useMemo(() => buildContextLines(invite), [invite]);

  const redirectToVerify = useCallback((email, expiresAt) => {
    showSuccess('Account created! Check your email for the verification code.');
    navTimerRef.current = setTimeout(() => {
      navigate('/verify-email', { state: { email, expiresAt } });
    }, 1500);
  }, [navigate, showSuccess]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role;
      showSuccess('Account created! Redirecting...');
      navTimerRef.current = setTimeout(() => {
        navigate(getDashboardPathForRole(role), { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, navigate, user, showSuccess]);

  useEffect(() => {
    return () => {
      clearError();
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, [clearError]);

  useEffect(() => {
    if (!token) {
      setInviteStatus('error');
      setInviteMessage('This invite link is missing its token.');
      return undefined;
    }

    let active = true;

    setInviteStatus('loading');
    setInviteMessage('');
    setInvite(null);

    fetchInviteTokenMeta(token)
      .then((response) => {
        if (!active) return;

        setInvite(response.invite);
        reset({
          name: '',
          email: response.invite.email || '',
          password: '',
          confirmPassword: '',
          phone: '',
        });
        setInviteStatus('ready');
      })
      .catch((inviteError) => {
        if (!active) return;

        setInviteStatus('error');
        setInviteMessage(
          inviteErrorMessages[inviteError.code] ||
            inviteError.message ||
            'We could not verify this invite link.'
        );
      });

    return () => {
      active = false;
    };
  }, [reset, token]);

  const onSubmit = handleSubmit(async (values) => {
    const result = await registerWithInvite({
      token,
      data: values,
    });
    if (result?.error) return;
    redirectToVerify(values.email, result?.payload?.expiresAt);
  });

  if (inviteStatus === 'error') {
    return (
      <AuthShell
        eyebrow="Invite signup"
        title="This invite cannot be used"
        footer={
          <Link to="/" className="text-sm font-semibold text-charcoal-600 transition-colors hover:text-primary-600">
            Back to homepage
          </Link>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
            {inviteMessage}
          </div>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-primary-500 px-4 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            Back to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Invite signup"
      title="Complete your invited account"
      footer={
        <Link to="/" className="text-sm font-semibold text-charcoal-600 transition-colors hover:text-primary-600">
          Back to homepage
        </Link>
      }
    >
      {inviteStatus === 'loading' ? (
        <div className="rounded-xl border border-charcoal-200 bg-charcoal-50 px-4 py-3 text-sm text-charcoal-700">
          Verifying invite link...
        </div>
      ) : null}

      {inviteStatus === 'ready' ? (
        <div className="space-y-6">
          {contextLines.length > 0 && (
            <div className="rounded-lg bg-primary-50/40 px-4 py-3">
              <div className="mb-2 flex items-center gap-1.5">
                <HiOutlineInformationCircle className="h-4 w-4 text-primary-500" />
                <p className="font-heading text-[10px] font-semibold uppercase tracking-[0.15em] text-primary-600">
                  Invite details
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {contextLines.map((item) => (
                  <span
                    key={`${item.label}-${item.value}`}
                    className="inline-flex items-center gap-1 rounded-md bg-white/70 px-2.5 py-1 text-xs text-charcoal-700 ring-1 ring-charcoal-200/40"
                  >
                    <span className="font-semibold text-charcoal-500">{item.label}:</span>
                    <span className="font-medium">{item.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-charcoal-700" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  readOnly
                  className={`${inputClassName} cursor-not-allowed bg-charcoal-50`}
                  {...register('email')}
                />
                <HiOutlineMail className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal-400" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-charcoal-700" htmlFor="name">
                Full name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  className={inputClassName}
                  placeholder="Jordan Reyes"
                  {...register('name')}
                />
                <HiOutlineUser className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal-400" />
              </div>
              {errors.name?.message ? (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-charcoal-700" htmlFor="phone">
                Phone
              </label>
              <div className="relative">
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      id="phone"
                      className={inputClassName}
                      placeholder="+251 91 123 4567"
                      {...field}
                    />
                  )}
                />
                <HiOutlinePhone className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-charcoal-400" />
              </div>
              {errors.phone?.message ? (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-charcoal-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={inputClassName}
                    placeholder="Min 8 chars"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 transition-colors hover:text-charcoal-600"
                  >
                    {showPassword ? (
                      <HiOutlineEyeOff className="h-5 w-5" />
                    ) : (
                      <HiOutlineEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password?.message ? (
                  <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 transition-colors hover:text-charcoal-600"
                  >
                    {showConfirmPassword ? (
                      <HiOutlineEyeOff className="h-5 w-5" />
                    ) : (
                      <HiOutlineEye className="h-5 w-5" />
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
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-xs ${
                  notification.type === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-sage-200 bg-sage-50 text-sage-700'
                }`}
              >
                <span>{notification.message}</span>
                <button
                  type="button"
                  onClick={dismiss}
                  className="shrink-0 text-2xl leading-none opacity-60 transition-opacity hover:opacity-100"
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
              {isSubmitting || isLoading ? 'Creating account...' : 'Complete registration'}
            </Button>

            <div className="text-center text-xs">
              <p className="text-charcoal-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
                >
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      ) : null}
    </AuthShell>
  );
};

export default InviteRegister;
