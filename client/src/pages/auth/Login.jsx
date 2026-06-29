import { useCallback, useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineMail, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import AuthShell from '@features/auth/AuthShell';
import { loginSchema } from '@features/auth/auth.schemas';
import { getDashboardPathForRole } from '@features/auth/auth.utils';
import useAuth from '@hooks/useAuth';
import useNotification from '@hooks/useNotification';
import useAutoClearErrors from '@hooks/useAutoClearErrors';
import Button from '@components/ui/Button';

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated, isLoading, error, clearError } =
    useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { notification, dismiss, showSuccess } = useNotification(error, {
    onErrorDismiss: clearError
  });
  const navTimerRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useAutoClearErrors(errors, clearErrors);

  const redirectAfterSuccess = useCallback((role) => {
    showSuccess('Welcome back! Redirecting...');
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

  const onSubmit = handleSubmit(async (values) => {
    const result = await login(values);
    if (result?.error) {
      const msg = result.payload || '';
      if (msg.includes('Email not verified')) {
        navigate('/verify-email', { state: { email: values.email }, replace: true });
      }
      return;
    }
    const loggedInUser = result?.payload;

    if (loggedInUser) {
      redirectAfterSuccess(loggedInUser.role);
    }
  });

  const handleGoogleLogin = () => {
    window.location.assign(`${import.meta.env.VITE_API_URL}/auth/google`);
  };

  return (
    <AuthShell
      eyebrow='Welcome back'
      title='Log in to your Fixra workspace'
      footer={
        <Link
          to='/'
          className='text-sm font-semibold text-charcoal-600 transition-colors hover:text-primary-600'>
          Back to homepage
        </Link>
      }>
      <form onSubmit={onSubmit} className='space-y-3'>
        <div>
          <label
            className='text-sm font-medium text-charcoal-700'
            htmlFor='email'>
            Email
          </label>
          <div className='relative'>
            <input
              id='email'
              type='email'
              autoComplete='email'
              className={inputClassName}
              placeholder='you@company.com'
              {...register('email')}
            />
            <HiOutlineMail className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400' />
          </div>
          {errors.email?.message ? (
            <p className='mt-1 text-xs text-red-600'>{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label
            className='text-sm font-medium text-charcoal-700'
            htmlFor='password'>
            Password
          </label>
          <div className='relative'>
            <input
              id='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              className={inputClassName}
              placeholder='Your password'
              {...register('password')}
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 transition-colors'>
              {showPassword ? (
                <HiOutlineEyeOff className='w-5 h-5' />
              ) : (
                <HiOutlineEye className='w-5 h-5' />
              )}
            </button>
          </div>
          {errors.password?.message ? (
            <p className='mt-1 text-xs text-red-600'>
              {errors.password.message}
            </p>
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
          type='submit'
          disabled={isSubmitting || isLoading}
          loading={isSubmitting || isLoading}
          variant='primary'>
          {isSubmitting || isLoading ? 'Signing in...' : 'Log in'}
        </Button>

        <div className='flex items-center justify-between gap-4 text-xs'>
          <p className='text-charcoal-600'>
            New to Fixra?{' '}
            <Link
              to='/register'
              className='font-semibold text-primary-600 transition-colors hover:text-primary-700'>
              Create account
            </Link>
          </p>
          <Link
            to='/forgot-password'
            className='font-semibold text-charcoal-600 transition-colors hover:text-primary-600'>
            Forgot password?
          </Link>
        </div>

        <div className='relative flex items-center'>
          <div className='flex-grow border-t border-charcoal-200'></div>
          <span className='mx-4 text-xs text-charcoal-500'>Or</span>
          <div className='flex-grow border-t border-charcoal-200'></div>
        </div>

        <Button type='button' onClick={handleGoogleLogin} variant='secondary'>
          <FcGoogle className='w-5 h-5 mr-2' /> Continue with Google
        </Button>
      </form>
    </AuthShell>
  );
};

export default Login;
