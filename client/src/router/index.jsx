import { useEffect } from 'react';
import { createBrowserRouter, Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { setOnAuthExpired } from '@services/api';
import Landing from '@pages/public/Landing';
import Login from '@pages/auth/Login';
import Register from '@pages/auth/Register';
import InviteRegister from '@pages/auth/InviteRegister';
import VerifyEmail from '@pages/auth/VerifyEmail';
import ForgotPassword from '@pages/auth/ForgotPassword';
import VerifyResetCode from '@pages/auth/VerifyResetCode';
import ResetPassword from '@pages/auth/ResetPassword';
import OAuthCallback from '@pages/auth/OAuthCallback';
import Dashboard from '@pages/app/Dashboard';
import ProtectedRoute from './ProtectedRoute';

const RootLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOnAuthExpired(() => {
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    });
  }, [location.pathname, navigate]);

  return <Outlet />;
};

const NotFound = () => (
  <div className="flex min-h-screen items-center justify-center bg-surface-warm px-6 text-center">
    <div className="max-w-lg">
      <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
        404
      </p>
      <h1 className="mt-4 font-heading text-4xl font-bold text-charcoal-950">
        Page not found
      </h1>
      <p className="mt-3 text-charcoal-600">
        The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
      >
        Return home
      </Link>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <Landing />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/register/invite',
        element: <InviteRegister />,
      },
      {
        path: '/auth/callback',
        element: <OAuthCallback />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmail />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: '/verify-reset-code',
        element: <VerifyResetCode />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/app/:section?',
            element: <Dashboard />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export { router };
