import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '@hooks/useAuth';
import { getDashboardPathForRole } from '@features/auth/auth.utils';

const RoleGuard = ({ requiredRole, children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && user && user.role !== requiredRole) {
    }
  }, [isLoading, user, requiredRole]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-warm px-6">
        <div className="rounded-3xl border border-charcoal-200 bg-white px-6 py-5 shadow-[0_24px_80px_rgba(26,26,31,0.08)]">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.3em] text-primary-500">
            Loading
          </p>
          <p className="mt-2 text-charcoal-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (user.role !== requiredRole) {
    return <Navigate to={getDashboardPathForRole(user.role)} replace state={{ from: location }} />;
  }

  return children;
};

export default RoleGuard;
