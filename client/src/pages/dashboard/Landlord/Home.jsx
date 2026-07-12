import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  MdApartment,
  MdHomeWork,
  MdConfirmationNumber,
  MdCheckCircle,
} from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import useAuth from '@hooks/useAuth';
import { fetchLandlordStats } from '@store/slices/analyticsSlice';
import { fetchTickets } from '@store/slices/ticketSlice';
import { fetchProperties } from '@store/slices/propertySlice';

const STATUS_COLORS = {
  REPORTED: 'bg-amber-400/20 text-amber-700',
  TRIAGED: 'bg-primary-100 text-primary-700',
  ASSIGNED: 'bg-sage-100 text-sage-700',
  IN_PROGRESS: 'bg-primary-200 text-primary-800',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-sage-200 text-sage-700',
  CLOSED: 'bg-charcoal-200/50 text-charcoal-600',
};

const PROPERTY_DOT_COLORS = {
  green: 'bg-sage-500',
  amber: 'bg-amber-500',
  red: 'bg-primary-500',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return format(new Date(), 'EEEE, MMMM d, yyyy');
}

function AnimatedNumber({ value, duration = 1.2 }) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;
    hasAnimated.current = true;

    const start = 0;
    const startTime = performance.now();
    const isFloat = !Number.isInteger(value);

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (value - start) * eased;

      if (ref.current) {
        if (isFloat) {
          ref.current.textContent = `$${current.toFixed(0)}`;
        } else {
          ref.current.textContent = Math.round(current).toLocaleString();
        }
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span ref={ref}>0</span>;
}

function StatCard({ icon: Icon, label, value, trend }) {
  return (
    <div className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
        <Icon className="text-lg text-primary-500" />
      </div>
        {trend != null && (
          <span
            className={`text-xs font-semibold ${trend >= 0 ? 'text-sage-600' : 'text-primary-500'}`}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
    </div>
      <p className="mt-3 font-heading text-2xl font-bold text-charcoal-950">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-0.5 font-body text-xs font-medium uppercase tracking-[0.08em] text-charcoal-500">
        {label}
      </p>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="mt-3 h-7 w-20 rounded" />
      <Skeleton className="mt-1 h-3 w-24 rounded" />
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const {
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useSelector((s) => s.analytics);
  const {
    isLoading: ticketsLoading,
    error: ticketsError,
    tickets,
  } = useSelector((s) => s.tickets);
  const {
    isLoading: propertiesLoading,
    error: propertiesError,
    properties,
  } = useSelector((s) => s.properties);

  useEffect(() => {
    dispatch(fetchLandlordStats());
    dispatch(fetchTickets());
    dispatch(fetchProperties());
  }, [dispatch]);

  const totalProperties = properties?.length ?? 0;
  const totalUnits = useMemo(
    () => (properties ?? []).length,
    [properties]
  );
  const openTickets = useMemo(
    () => (tickets ?? []).filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status)).length,
    [tickets]
  );
  const resolvedThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return (tickets ?? []).filter((t) => {
      if (t.status !== 'RESOLVED') return false;
      const resolvedAt = t.resolvedAt || t.updatedAt;
      return resolvedAt && new Date(resolvedAt) >= startOfMonth;
    }).length;
  }, [tickets]);

  const recentTickets = useMemo(() => {
    const sorted = [...(tickets ?? [])].sort(
      (a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
    );
    return sorted.slice(0, 5);
  }, [tickets]);

  const pendingJobs = useMemo(
    () => (tickets ?? []).filter(
      (t) => t.jobId && t.job?.approvalStatus === 'PENDING'
    ),
    [tickets]
  );

  const outdatedReportedTickets = useMemo(
    () => (tickets ?? []).filter((t) => {
      if (t.status !== 'REPORTED') return false;
      const created = new Date(t.createdAt || t.updatedAt);
      const hoursDiff = (Date.now() - created.getTime()) / (1000 * 60 * 60);
      return hoursDiff > 24;
    }),
    [tickets]
  );

  const hasPending = pendingJobs.length > 0 || outdatedReportedTickets.length > 0;

  const propertyTicketCounts = useMemo(() => {
    const map = {};
    (tickets ?? []).forEach((t) => {
      const pid = t.propertyId?._id || t.propertyId;
      if (!pid) return;
      map[pid] = (map[pid] || 0) + 1;
    });
    return map;
  }, [tickets]);

  const dataLoading = analyticsLoading || ticketsLoading || propertiesLoading;
  const anyError = analyticsError || ticketsError || propertiesError;

  return (
    <div className="px-6 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
          {formatDate()}
        </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">
          {getGreeting()}, {user?.name}
        </h1>
        </div>

        <section>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {dataLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : anyError ? (
              <div className="col-span-full flex items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-5 py-4">
                <span className="font-body text-sm text-primary-700">
                  Could not load stats. <button onClick={() => { dispatch(fetchLandlordStats()); dispatch(fetchTickets()); dispatch(fetchProperties()); }} className="ml-1 font-semibold underline underline-offset-2 hover:text-primary-800">Retry</button>
                </span>
              </div>
            ) : (
              <>
                <StatCard icon={MdApartment} value={totalProperties} label="Total Properties" trend={null} />
                <StatCard icon={MdHomeWork} value={totalUnits} label="Total Units" trend={null} />
                <StatCard icon={MdConfirmationNumber} value={openTickets} label="Open Tickets" trend={null} />
                <StatCard icon={MdCheckCircle} value={resolvedThisMonth} label="Resolved This Month" trend={null} />
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-charcoal-950">Recent Tickets</h2>
            <button
              onClick={() => navigate('/landlord/tickets')}
              className="font-body text-xs font-semibold text-primary-500 underline underline-offset-2 hover:text-primary-600"
            >
              View all
            </button>
          </div>

          {ticketsLoading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl bg-charcoal-50/50 p-4">
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <Skeleton className="h-4 w-1/4 rounded" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="ml-auto h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : ticketsError ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary-50/50 px-4 py-3">
              <span className="font-body text-sm text-primary-600">
                Failed to load tickets. <button onClick={() => dispatch(fetchTickets())} className="font-semibold underline underline-offset-2 hover:text-primary-800">Retry</button>
              </span>
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <MdConfirmationNumber className="text-3xl text-charcoal-300" />
              <p className="mt-2 font-body text-sm text-charcoal-500">No tickets yet</p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-charcoal-100">
              {recentTickets.map((ticket) => {
                const propertyName =
                  ticket.propertyId?.name || ticket.propertyName || 'Unknown';
                return (
                  <button
                    key={ticket._id || ticket.id}
                    onClick={() => navigate(`/landlord/tickets/${ticket._id || ticket.id}`)}
                    className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-charcoal-50/50 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-body text-sm font-medium text-charcoal-950">
                        {ticket.title}
                      </p>
                      <p className="mt-0.5 truncate font-body text-xs text-charcoal-500">
                        {propertyName}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                        STATUS_COLORS[ticket.status] || 'bg-charcoal-100 text-charcoal-600'
                      }`}
                    >
                      {ticket.status}
                    </span>
                    <span className="shrink-0 font-body text-[11px] font-medium uppercase tracking-[0.05em] text-charcoal-400">
                      {ticket.category}
                    </span>
                    <span className="shrink-0 font-body text-xs text-charcoal-400">
                      {formatDistanceToNow(new Date(ticket.createdAt || ticket.updatedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {hasPending && (
          <section className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-6 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-charcoal-950">
              Pending Actions
            </h2>
            <p className="font-body text-xs text-amber-700">
              Items requiring your attention
            </p>
            <div className="mt-4 space-y-3">
              {pendingJobs.map((ticket) => (
                <button
                  key={ticket._id || ticket.id}
                  onClick={() => navigate(`/landlord/tickets/${ticket._id || ticket.id}`)}
                  className="flex w-full items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-left transition-colors hover:bg-white"
                >
                  <div>
                    <p className="font-body text-sm font-medium text-charcoal-950">
                      {(ticket.propertyId?.name || 'Property')} —{' '}
                      {ticket.title}
                    </p>
                    <p className="font-body text-xs text-amber-600">
                      Cost estimate pending approval
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-200/50 px-3 py-1 font-body text-xs font-semibold text-amber-800">
                    PENDING
                  </span>
                </button>
              ))}
              {outdatedReportedTickets.map((ticket) => (
                <button
                  key={ticket._id || ticket.id}
                  onClick={() => navigate(`/landlord/tickets/${ticket._id || ticket.id}`)}
                  className="flex w-full items-center justify-between rounded-xl bg-white/80 px-4 py-3 text-left transition-colors hover:bg-white"
                >
                  <div>
                    <p className="font-body text-sm font-medium text-charcoal-950">
                      {(ticket.propertyId?.name || 'Property')} —{' '}
                      {ticket.title}
                    </p>
                    <p className="font-body text-xs text-amber-600">
                      Reported over 24 hours ago — needs triage
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-400/50 px-3 py-1 font-body text-xs font-semibold text-amber-800">
                    UNTRIAGED
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-lg font-bold text-charcoal-950">
            Properties at a Glance
          </h2>

          {propertiesLoading ? (
            <div className="mt-4 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl bg-charcoal-50/50 p-4">
                  <Skeleton className="h-4 w-1/3 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                  <Skeleton className="h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          ) : propertiesError ? (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-primary-50/50 px-4 py-3">
              <span className="font-body text-sm text-primary-600">
                Failed to load properties. <button onClick={() => dispatch(fetchProperties())} className="font-semibold underline underline-offset-2 hover:text-primary-800">Retry</button>
              </span>
            </div>
          ) : (properties ?? []).length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
              <MdApartment className="text-3xl text-charcoal-300" />
              <p className="mt-2 font-body text-sm text-charcoal-500">No properties yet</p>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-charcoal-100">
              {(properties ?? []).map((property) => {
                const pid = property._id || property.id;
                const openCount = propertyTicketCounts[pid] || 0;
                const unitCount = 1;
                const dotColor =
                  openCount === 0
                    ? PROPERTY_DOT_COLORS.green
                    : openCount <= 3
                      ? PROPERTY_DOT_COLORS.amber
                      : PROPERTY_DOT_COLORS.red;

                return (
                  <button
                    key={pid}
                    onClick={() => navigate(`/landlord/properties/${pid}`)}
                    className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:bg-charcoal-50/50 first:pt-0 last:pb-0"
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`} />
                    <p className="flex-1 font-body text-sm font-medium text-charcoal-950">
                      {property.name}
                    </p>
                    <span className="font-body text-xs text-charcoal-500">
                      {unitCount} {unitCount === 1 ? 'unit' : 'units'}
                    </span>
                    <span className="font-body text-xs text-charcoal-500">
                      {openCount} open
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
};

export default Home;