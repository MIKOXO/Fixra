import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '@features/auth/AuthShell';
import { getDashboardPathForRole } from '@features/auth/auth.utils';
import useAuth from '@hooks/useAuth';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { fetchCurrentUser } = useAuth();

  useEffect(() => {
    let active = true;

    fetchCurrentUser()
      .unwrap()
      .then((user) => {
        if (active && user?.role) {
          navigate(getDashboardPathForRole(user.role), { replace: true });
        }
      })
      .catch(() => {
        if (active) {
          navigate('/login', { replace: true });
        }
      });

    return () => {
      active = false;
    };
  }, [fetchCurrentUser, navigate]);

  return (
    <AuthShell
      eyebrow="OAuth callback"
      title="Signing you in"
      subtitle="We are verifying your Google session and loading your role-specific dashboard."
      highlights={[]}
    >
      <div className="rounded-3xl border border-charcoal-200 bg-charcoal-50 px-4 py-5 text-charcoal-700">
        Finishing Google sign-in...
      </div>
    </AuthShell>
  );
};

export default OAuthCallback;
