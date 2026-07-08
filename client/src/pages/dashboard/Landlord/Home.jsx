import { Link, useNavigate } from 'react-router-dom';
import useAuth from '@hooks/useAuth';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="px-8 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
            Fixra dashboard
          </p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-charcoal-950">
            Landlord workspace
          </h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full border border-charcoal-300 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900 transition-colors hover:bg-charcoal-50"
        >
          Log out
        </button>
      </div>

      <main className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-charcoal-200/70 bg-white/90 p-8 shadow-[0_24px_90px_rgba(26,26,31,0.10)] backdrop-blur">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
            Signed in as
          </p>
          <h2 className="mt-4 font-heading text-4xl font-bold text-charcoal-950">
            Welcome, {user?.name}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-charcoal-600">
            Manage your properties, track maintenance requests, and oversee
            contractor work all in one place.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-surface-mist px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal-500">
                Email
              </p>
              <p className="mt-2 text-sm font-medium text-charcoal-900">{user?.email}</p>
            </div>
            <div className="rounded-3xl bg-surface-mist px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal-500">
                Role
              </p>
              <p className="mt-2 text-sm font-medium text-charcoal-900">Landlord</p>
            </div>
          </div>
        </section>

        <aside className="rounded-[2rem] border border-charcoal-200/70 bg-charcoal-950 p-8 text-white shadow-[0_24px_90px_rgba(26,26,31,0.16)]">
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-sage-200">
            Quick links
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-sm font-medium text-white/70">Properties</p>
              <p className="mt-1 text-sm leading-6 text-white/85">
                View and manage your rental properties.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-sm font-medium text-white/70">Maintenance</p>
              <p className="mt-1 text-sm leading-6 text-white/85">
                Track open maintenance requests from tenants.
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-3 font-heading text-sm font-semibold text-charcoal-950 transition-colors hover:bg-charcoal-100"
          >
            Back to landing
          </Link>
        </aside>
      </main>
    </div>
  );
};

export default Home;
