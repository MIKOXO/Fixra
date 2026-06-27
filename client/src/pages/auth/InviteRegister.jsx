import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthShell from '@features/auth/AuthShell';
import { inviteRegisterSchema } from '@features/auth/auth.schemas';
import { getDashboardPathForRole, getRoleLabel } from '@features/auth/auth.utils';
import { fetchInviteTokenMeta } from '@services/auth.api';
import useAuth from '@hooks/useAuth';
import useNotification from '@hooks/useNotification';
import useAutoClearErrors from '@hooks/useAutoClearErrors';
import PhoneInput from '@components/ui/PhoneInput';
import PasswordStrengthIndicator from '@components/ui/PasswordStrengthIndicator';

const inputClassName =
  'mt-2 w-full rounded-2xl border border-charcoal-200 bg-white px-4 py-3 text-charcoal-950 outline-none transition focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

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
    if (meta.landlordId) {
      lines.push({ label: 'Landlord ID', value: meta.landlordId });
    }

    if (meta.propertyId) {
      lines.push({ label: 'Property ID', value: meta.propertyId });
    }

    if (meta.unitId) {
      lines.push({ label: 'Unit ID', value: meta.unitId });
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

    if (meta.landlordId) {
      lines.push({ label: 'Landlord ID', value: meta.landlordId });
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
    onErrorDismiss: clearError
  });
  const navTimerRef = useRef(null);
  const [invite, setInvite] = useState(null);
  const [inviteStatus, setInviteStatus] = useState('loading');
  const [inviteMessage, setInviteMessage] = useState('');

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

  const redirectAfterSuccess = useCallback((role) => {
    showSuccess('Account created! Redirecting...');
    navTimerRef.current = setTimeout(() => {
      navigate(getDashboardPathForRole(role), { replace: true });
    }, 1500);
  }, [navigate, showSuccess]);

  useEffect(() => {
    if (isAuthenticated && user) {
      redirectAfterSuccess(user.role);
    }
  }, [isAuthenticated, user, redirectAfterSuccess]);

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
        if (!active) {
          return;
        }

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
        if (!active) {
          return;
        }

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
    const registeredUser = result?.payload;

    if (registeredUser) {
      redirectAfterSuccess(registeredUser.role);
    }
  });

  if (inviteStatus === 'error') {
    return (
      <AuthShell
        eyebrow="Invite signup"
        title="This invite cannot be used"
        subtitle={inviteMessage || 'We could not verify the invite token.'}
        highlights={[]}
      >
        <div className="space-y-4">
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            {inviteMessage}
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full bg-primary-500 px-5 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              Back to login
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-charcoal-300 bg-white px-5 py-3 font-heading text-sm font-semibold text-charcoal-900 transition-colors hover:bg-charcoal-50"
            >
              Go home
            </Link>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Invite signup"
      title="Complete your invited account"
      subtitle="Your invite is verified before the form opens. Review the details below, then finish creating your secure account."
      highlights={[]}
    >
      {inviteStatus === 'loading' ? (
        <div className="rounded-3xl border border-charcoal-200 bg-charcoal-50 px-4 py-5 text-charcoal-700">
          Verifying invite link...
        </div>
      ) : null}

      {inviteStatus === 'ready' ? (
        <div className="space-y-5">
          <div className="rounded-3xl border border-sage-200 bg-sage-50 px-5 py-4">
            <p className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-sage-700">
              Invite details
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {contextLines.map((item) => (
                <div key={`${item.label}-${item.value}`} className="rounded-2xl bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal-500">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-charcoal-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-charcoal-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                readOnly
                className={`${inputClassName} cursor-not-allowed bg-charcoal-50`}
                {...register('email')}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-charcoal-700" htmlFor="name">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={inputClassName}
                placeholder="Jordan Reyes"
                {...register('name')}
              />
              {errors.name?.message ? (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              ) : null}
            </div>

            <div>
              <label className="text-sm font-medium text-charcoal-700" htmlFor="phone">
                Phone
              </label>
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
              {errors.phone?.message ? (
                <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
              ) : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-charcoal-700" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className={inputClassName}
                  placeholder="Minimum 8 characters"
                  {...register('password')}
                />
                {errors.password?.message ? (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                ) : null}
                <PasswordStrengthIndicator password={passwordValue} />
              </div>

              <div>
                <label className="text-sm font-medium text-charcoal-700" htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className={inputClassName}
                  placeholder="Repeat your password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword?.message ? (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                ) : null}
              </div>
            </div>

            {notification ? (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm flex items-center justify-between gap-3 ${
                  notification.type === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700'
                    : 'border-sage-200 bg-sage-50 text-sage-700'
                }`}
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

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="inline-flex w-full items-center justify-center rounded-full bg-primary-500 px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting || isLoading ? 'Creating account...' : 'Complete registration'}
            </button>
          </form>
        </div>
      ) : null}
    </AuthShell>
  );
};

export default InviteRegister;
