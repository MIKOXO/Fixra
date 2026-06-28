import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '@hooks/useAuth';

const ProtectedRoute = () => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, fetchCurrentUser } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (hasCheckedAuth) return;

    if (isAuthenticated || user) {
      setHasCheckedAuth(true);
      return;
    }

    if (!isLoading) {
      Promise.resolve(fetchCurrentUser()).finally(() => {
        setHasCheckedAuth(true);
      });
    }
  }, [fetchCurrentUser, isAuthenticated, isLoading, user, hasCheckedAuth]);

  if (!hasCheckedAuth || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-warm px-6">
        <div className="rounded-3xl border border-charcoal-200 bg-white px-6 py-5 shadow-[0_24px_80px_rgba(26,26,31,0.08)]">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">
            Loading
          </p>
          <p className="mt-2 text-charcoal-600">Checking your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
