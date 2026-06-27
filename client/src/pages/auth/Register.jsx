import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import AuthShell from '@features/auth/AuthShell';
import { registerSchema } from '@features/auth/auth.schemas';
import { getDashboardPathForRole } from '@features/auth/auth.utils';
import useAuth from '@hooks/useAuth';
import Button from '@components/ui/Button';
import PhoneInput from '@components/ui/PhoneInput';
import PasswordStrengthIndicator from '@components/ui/PasswordStrengthIndicator';

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const Register = () => {
  const navigate = useNavigate();
  const { registerLandlord, user, isAuthenticated, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardPathForRole(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => () => clearError(), [clearError]);

  const passwordValue = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    const result = await registerLandlord(values);
    const registeredUser = result?.payload;

    if (registeredUser) {
      navigate(getDashboardPathForRole(registeredUser.role), { replace: true });
    }
  });

  return (
    <AuthShell
      eyebrow="Landlord signup"
      title="Create your landlord account"
      footer={
        <Link to="/" className="text-sm font-semibold text-charcoal-600 transition-colors hover:text-primary-600">
          Back to homepage
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="space-y-3">
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
            <HiOutlineUser className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          </div>
          {errors.name?.message ? (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          ) : null}
        </div>

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
            <HiOutlinePhone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400 pointer-events-none" />
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors"
              >
                {showPassword ? (
                  <HiOutlineEyeOff className="w-5 h-5" />
                ) : (
                  <HiOutlineEye className="w-5 h-5" />
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

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          loading={isSubmitting || isLoading}
          variant="primary"
        >
          {isSubmitting || isLoading ? 'Creating account...' : 'Create landlord account'}
        </Button>

        <div className="text-center text-xs">
          <p className="text-charcoal-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 transition-colors hover:text-primary-700">
              Log in
            </Link>
          </p>
        </div>
      </form>
    </AuthShell>
  );
};

export default Register;
