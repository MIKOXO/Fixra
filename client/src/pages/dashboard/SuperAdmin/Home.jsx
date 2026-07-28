import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  MdPeople,
  MdApartment,
  MdConfirmationNumber,
  MdLink,
  MdWarning,
  MdPersonOff,
  MdSchedule,
  MdHourglassEmpty,
} from 'react-icons/md';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Skeleton from '@components/ui/Skeleton';
import useAuth from '@hooks/useAuth';
import {
  fetchPlatformStats,
  fetchUserGrowth,
  fetchAttentionItems,
} from '@store/slices/adminSlice';

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};

function AnimatedNumber({ value, duration = 1.2 }) {
  const ref = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;
    hasAnimated.current = true;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(value * eased);
      if (ref.current) ref.current.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span ref={ref}>0</span>;
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm">
      <Icon className="text-lg text-charcoal-400" />
      <p className="mt-3 font-heading text-3xl font-bold text-charcoal-950">
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
      <Skeleton className="mt-2 h-3 w-32 rounded" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
      <Skeleton className="h-4 w-48 rounded" />
      <Skeleton className="mt-1 h-3 w-36 rounded" />
      <Skeleton className="mt-6 h-[260px] w-full rounded-xl" />
    </div>
  );
}

function AttentionSkeleton() {
  return (
    <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-6 shadow-sm">
      <Skeleton className="h-4 w-40 rounded" />
      <Skeleton className="mt-1 h-3 w-52 rounded" />
      <div className="mt-4 space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl bg-white/80 p-4">
            <Skeleton className="h-4 w-3/5 rounded" />
            <Skeleton className="mt-1 h-3 w-2/5 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-charcoal-200/70 bg-white px-4 py-2.5 shadow-md">
      <p className="font-body text-xs text-charcoal-500">{label}</p>
      <p className="font-heading text-sm font-bold text-charcoal-950">
        {payload[0].value} signup{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const {
    platformStats,
    userGrowth,
    attentionItems,
    isLoading,
    error,
  } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchPlatformStats());
    dispatch(fetchUserGrowth());
    dispatch(fetchAttentionItems());
  }, [dispatch]);

  const totalUsers = useMemo(() => {
    if (!platformStats?.usersByRole) return 0;
    return Object.values(platformStats.usersByRole).reduce((a, b) => a + b, 0);
  }, [platformStats]);

  const ticketBreakdown = useMemo(() => {
    if (!platformStats?.ticketsByStatus) return [];
    const order = ['REPORTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_REVIEW', 'RESOLVED', 'CLOSED'];
    return order
      .filter((s) => platformStats.ticketsByStatus[s])
      .map((s) => ({
        label: s.replace(/_/g, ' '),
        count: platformStats.ticketsByStatus[s],
      }));
  }, [platformStats]);

  const hasAttentionItems = useMemo(() => {
    if (!attentionItems) return false;
    const { recentDeactivations, staleTickets, pendingContractorLinks } = attentionItems;
    return (
      (recentDeactivations?.length ?? 0) > 0 ||
      (staleTickets?.length ?? 0) > 0 ||
      (pendingContractorLinks?.length ?? 0) > 0
    );
  }, [attentionItems]);

  const dataLoading = isLoading;
  const anyError = error;

  return (
    <div className="px-6 py-8">
      {dataLoading && !platformStats ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-7 w-56" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
            <ChartSkeleton />
            <AttentionSkeleton />
          </div>
        </div>
      ) : anyError ? (
        <div className="flex items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-5 py-4">
          <span className="font-body text-sm text-primary-700">
            Could not load dashboard.{' '}
            <button
              onClick={() => {
                dispatch(fetchPlatformStats());
                dispatch(fetchUserGrowth());
                dispatch(fetchAttentionItems());
              }}
              className="ml-1 font-semibold underline underline-offset-2 hover:text-primary-800"
            >
              Retry
            </button>
          </span>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-x-6 gap-y-6"
        >
          <motion.div variants={itemVariants}>
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-charcoal-950">
              Welcome back, {user?.name}
            </h1>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <StatCard icon={MdPeople} label="Total Users" value={totalUsers} />
            <StatCard icon={MdApartment} label="Total Properties" value={platformStats?.totalProperties ?? 0} />
            <StatCard
              icon={MdConfirmationNumber}
              label="Total Tickets"
              value={ticketBreakdown.reduce((a, b) => a + b.count, 0)}
            />
            <StatCard icon={MdLink} label="Active Contractor Links" value={platformStats?.activeContractorLinks ?? 0} />
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]"
          >
            <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-base font-bold text-charcoal-950">
                New Signups (Last 30 Days)
              </h2>
              <p className="mt-0.5 font-body text-xs text-charcoal-500">
                Daily user registration trend
              </p>

              {userGrowth && userGrowth.length > 0 ? (
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d9d9de" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#91919e' }}
                        axisLine={{ stroke: '#d9d9de' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#91919e' }}
                        axisLine={{ stroke: '#d9d9de' }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#e85d3a"
                        strokeWidth={2}
                        dot={{ fill: '#e85d3a', r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal-100">
                    <MdPeople className="text-xl text-charcoal-400" />
                  </div>
                  <p className="mt-3 font-heading text-sm font-semibold text-charcoal-950">
                    No signup data
                  </p>
                  <p className="mt-0.5 font-body text-xs text-charcoal-500">
                    User registration data will appear here.
                  </p>
                </div>
              )}
            </div>

            {hasAttentionItems && (
              <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <MdWarning className="text-lg text-amber-600" />
                  <h2 className="font-heading text-base font-bold text-charcoal-950">
                    Attention Needed
                  </h2>
                </div>
                <p className="mt-0.5 font-body text-xs text-amber-700">
                  Items requiring your review
                </p>

                <div className="mt-4 space-y-4">
                  {attentionItems?.recentDeactivations?.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate('/admin/users')}
                        className="flex w-full items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-left transition-colors hover:bg-white"
                      >
                        <MdPersonOff className="text-sm text-primary-500" />
                        <span className="flex-1 font-body text-xs font-semibold text-charcoal-800">
                          Recent Deactivations
                        </span>
                        <span className="rounded-full bg-primary-100 px-2 py-0.5 font-body text-[11px] font-semibold text-primary-700">
                          {attentionItems.recentDeactivations.length}
                        </span>
                      </button>
                      <div className="mt-1.5 space-y-1">
                        {attentionItems.recentDeactivations.slice(0, 4).map((u) => (
                          <div
                            key={u._id}
                            className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2"
                          >
                            <span className="font-body text-xs text-charcoal-700">
                              {u.name}
                            </span>
                            <span className="font-body text-[11px] text-charcoal-400">
                              {u.role}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {attentionItems?.staleTickets?.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate('/admin/tickets')}
                        className="flex w-full items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-left transition-colors hover:bg-white"
                      >
                        <MdHourglassEmpty className="text-sm text-amber-600" />
                        <span className="flex-1 font-body text-xs font-semibold text-charcoal-800">
                          Stale Tickets
                        </span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 font-body text-[11px] font-semibold text-amber-700">
                          {attentionItems.staleTickets.length}
                        </span>
                      </button>
                      <div className="mt-1.5 space-y-1">
                        {attentionItems.staleTickets.slice(0, 4).map((t) => (
                          <div
                            key={t._id}
                            className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2"
                          >
                            <span className="font-body text-xs text-charcoal-700 truncate">
                              {t.title}
                            </span>
                            <span className="shrink-0 font-body text-[11px] text-charcoal-400">
                              {t.tenantId?.name || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {attentionItems?.pendingContractorLinks?.length > 0 && (
                    <div>
                      <button
                        type="button"
                        onClick={() => navigate('/admin/users')}
                        className="flex w-full items-center gap-2 rounded-lg bg-white/80 px-3 py-2 text-left transition-colors hover:bg-white"
                      >
                        <MdSchedule className="text-sm text-sage-600" />
                        <span className="flex-1 font-body text-xs font-semibold text-charcoal-800">
                          Pending Contractor Invites
                        </span>
                        <span className="rounded-full bg-sage-100 px-2 py-0.5 font-body text-[11px] font-semibold text-sage-700">
                          {attentionItems.pendingContractorLinks.length}
                        </span>
                      </button>
                      <div className="mt-1.5 space-y-1">
                        {attentionItems.pendingContractorLinks.slice(0, 4).map((link) => (
                          <div
                            key={link._id}
                            className="flex items-center justify-between rounded-lg bg-white/60 px-3 py-2"
                          >
                            <span className="font-body text-xs text-charcoal-700 truncate">
                              {link.contractorEmail}
                            </span>
                            <span className="shrink-0 font-body text-[11px] text-charcoal-400">
                              {link.landlordId?.name || '—'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
