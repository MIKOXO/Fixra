import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  MdBarChart,
  MdCheckCircleOutline,
  MdOutlineSchedule,
  MdRefresh,
  MdTrendingUp,
} from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import { fetchContractorStats } from '@store/slices/analyticsSlice';

const containerVariants = {
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

function tooltipStyle() {
  return {
    border: '1px solid #d9d9de',
    borderRadius: '12px',
    background: '#fff',
    padding: '10px 14px',
    boxShadow: '0 4px 16px rgba(26,26,31,0.08)',
    fontSize: '13px',
  };
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle()}>
      <p className="font-heading text-xs font-semibold text-charcoal-700">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="mt-1 font-body text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

function ChartCard({ title, subtitle, icon: Icon, loading, isEmpty, children }) {
  return (
    <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
          <Icon className="text-base text-primary-500" />
        </div>
        <div>
          <h3 className="font-heading text-base font-bold text-charcoal-950">{title}</h3>
          {subtitle && <p className="mt-0.5 font-body text-xs text-charcoal-500">{subtitle}</p>}
        </div>
      </div>
      {loading ? (
        <ChartSkeleton />
      ) : isEmpty ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-charcoal-200">
          <Icon className="text-2xl text-charcoal-300" />
          <p className="mt-2 font-body text-sm text-charcoal-400">No data available</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading analytics">
      {/* header */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* stat cards row */}
      <div className="grid gap-6 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-start gap-3">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <ChartSkeleton />
          </div>
        ))}
      </div>

      {/* chart card */}
      <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <ChartSkeleton />
      </div>
    </div>
  );
}

const STAT_CARDS = [
  {
    key: 'jobsCompleted',
    label: 'Jobs Completed',
    icon: MdCheckCircleOutline,
    format: (v) => (v ?? 0).toString(),
    sub: 'Total resolved jobs',
  },
  {
    key: 'avgResolutionTime',
    label: 'Avg Resolution Time',
    icon: MdOutlineSchedule,
    format: (v) => (v != null ? `${v}h` : '—'),
    sub: 'Average hours per job',
  },
  {
    key: 'reopenRate',
    label: 'Reopen Rate',
    icon: MdRefresh,
    format: (v) => (v != null ? `${(v * 100).toFixed(1)}%` : '—'),
    sub: 'Jobs reopened after review',
  },
];

const Analytics = () => {
  const dispatch = useDispatch();
  const { contractorStats, contractorLoading, error } = useSelector((s) => s.analytics);

  useEffect(() => {
    dispatch(fetchContractorStats());
  }, [dispatch]);

  const jobsByMonth = contractorStats?.jobsByMonth ?? [];

  return (
    <div className="px-6 py-8">
      {contractorLoading ? (
        <PageSkeleton />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
              Contractor
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">Analytics</h1>
            <p className="mt-1 font-body text-sm text-charcoal-500">
              Your performance metrics at a glance.
            </p>
          </motion.div>

          {error ? (
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-5 py-4">
                <span className="font-body text-sm text-primary-700">
                  Failed to load analytics.{' '}
                  <button
                    onClick={() => dispatch(fetchContractorStats())}
                    className="ml-1 font-semibold underline underline-offset-2 hover:text-primary-800"
                  >
                    Retry
                  </button>
                </span>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Stat cards */}
              <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-3">
                {STAT_CARDS.map(({ key, label, icon: Icon, format, sub }) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm"
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
                        <Icon className="text-base text-primary-500" />
                      </div>
                      <div>
                        <p className="font-heading text-sm font-bold text-charcoal-950">{label}</p>
                        <p className="mt-0.5 font-body text-xs text-charcoal-500">{sub}</p>
                      </div>
                    </div>
                    <p className="font-heading text-4xl font-bold text-charcoal-950">
                      {contractorStats ? format(contractorStats[key]) : '—'}
                    </p>
                  </div>
                ))}
              </motion.div>

              {/* Line chart */}
              <motion.div variants={itemVariants}>
                <ChartCard
                  title="Jobs Completed per Month"
                  subtitle="Monthly trend of completed jobs"
                  icon={MdTrendingUp}
                  loading={false}
                  isEmpty={jobsByMonth.length === 0}
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={jobsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d9d9de" />
                      <XAxis
                        dataKey="month"
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
                        name="Jobs completed"
                        stroke="#e85d3a"
                        strokeWidth={2}
                        dot={{ fill: '#e85d3a', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </motion.div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
