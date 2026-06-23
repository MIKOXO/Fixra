import { createBrowserRouter, Link } from 'react-router-dom';
import Landing from '@pages/public/Landing';
import ProtectedRoute from './ProtectedRoute';

const AuthPlaceholder = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-surface-warm px-6">
    <div className="w-full max-w-lg rounded-3xl border border-charcoal-200 bg-white p-8 shadow-[0_24px_80px_rgba(26,26,31,0.08)]">
      <p className="font-heading text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
        Fixra
      </p>
      <h1 className="mt-4 font-heading text-3xl font-bold text-charcoal-950">
        {title}
      </h1>
      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-primary-500 px-6 py-3 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          Back to home
        </Link>
      </div>
    </div>
  </div>
);

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-warm px-6 text-center">
    <div>
      <p className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">
        404
      </p>
      <h1 className="mt-4 font-heading text-4xl font-bold text-charcoal-950">
        Page not found
      </h1>
      <p className="mt-3 font-body text-charcoal-500">
        The page you’re looking for does not exist.
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
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <AuthPlaceholder title="Log in" />,
  },
  {
    path: '/register',
    element: <AuthPlaceholder title="Create your account" />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: 'app',
        element: <AuthPlaceholder title="Protected area" />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export { router };
