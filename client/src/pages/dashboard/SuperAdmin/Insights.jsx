import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  MdPeople,
  MdConfirmationNumber,
  MdApartment,
} from 'react-icons/md';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from 'recharts';
import Skeleton from '@components/ui/Skeleton';
import { fetchPlatformStats, fetchAdminProperties } from '@store/slices/adminSlice';

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  LANDLORD: 'Landlord',
  TENANT: 'Tenant',
  CONTRACTOR: 'Contractor',
  TECHNICIAN: 'Technician',
};

const ROLE_PALETTE = ['#e85d3a', '#5b8c5a', '#f0a030', '#6b7db3', '#d4a574'];

const STATUS_LABELS = {
  REPORTED: 'Reported',
  TRIAGED: 'Triaged',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  PENDING_REVIEW: 'Pending Review',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const STATUS_PALETTE = {
  REPORTED: '#f5a623',
  TRIAGED: '#e85d3a',
  ASSIGNED: '#5b8c5a',
  IN_PROGRESS: '#d4a574',
  PENDING_REVIEW: '#f0a030',
  RESOLVED: '#4a90d9',
  CLOSED: '#8f8f9e',
};

const REGION_SHADES = [
  '#fdede8', '#fad9cf', '#f5bcab', '#f09d83', '#eb7d5b',
  '#e85d3a', '#d44d2b', '#b83e20', '#9a3017', '#7a2310',
];

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

function ChartSkeleton({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm ${className}`}>
      <Skeleton className="h-4 w-44 rounded" />
      <Skeleton className="mt-1 h-3 w-32 rounded" />
      <Skeleton className="mt-6 h-[280px] w-full rounded-xl" />
    </div>
  );
}

function EmptyChart({ icon: Icon, label, sublabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal-100">
        <Icon className="text-xl text-charcoal-400" />
      </div>
      <p className="mt-3 font-heading text-sm font-semibold text-charcoal-950">
        {label}
      </p>
      <p className="mt-0.5 font-body text-xs text-charcoal-500">
        {sublabel}
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-xl border border-charcoal-200/70 bg-white px-4 py-2.5 shadow-md">
      <p className="font-body text-xs text-charcoal-500">{d.name}</p>
      <p className="font-heading text-sm font-bold text-charcoal-950">
        {d.value} user{d.value !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

function BarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-charcoal-200/70 bg-white px-4 py-2.5 shadow-md">
      <p className="font-body text-xs text-charcoal-500">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-heading text-sm font-bold text-charcoal-950">
          {entry.value} ticket{entry.value !== 1 ? 's' : ''}
        </p>
      ))}
    </div>
  );
}

function RegionTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-charcoal-200/70 bg-white px-4 py-2.5 shadow-md">
      <p className="font-body text-xs text-charcoal-500">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-heading text-sm font-bold text-charcoal-950">
          {entry.value} propert{entry.value !== 1 ? 'ies' : 'y'}
        </p>
      ))}
    </div>
  );
}

const Insights = () => {
  const dispatch = useDispatch();
  const { platformStats, properties, isLoading, propertiesLoading, error } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchPlatformStats());
    dispatch(fetchAdminProperties({ limit: 500 }));
  }, [dispatch]);

  const usersByRole = useMemo(() => {
    if (!platformStats?.usersByRole) return [];
    return Object.entries(platformStats.usersByRole)
      .filter(([, count]) => count > 0)
      .map(([role, count]) => ({
        name: ROLE_LABELS[role] || role.replace(/_/g, ' '),
        value: count,
      }));
  }, [platformStats]);

  const ticketsByStatus = useMemo(() => {
    if (!platformStats?.ticketsByStatus) return [];
    const order = ['REPORTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_REVIEW', 'RESOLVED', 'CLOSED'];
    return order
      .filter((s) => platformStats.ticketsByStatus[s] != null)
      .map((s) => ({
        name: STATUS_LABELS[s] || s.replace(/_/g, ' '),
        value: platformStats.ticketsByStatus[s],
        fill: STATUS_PALETTE[s] || '#8f8f9e',
      }));
  }, [platformStats]);

  const propertiesByRegion = useMemo(() => {
    const list = properties?.properties;
    if (!list || list.length === 0) return [];
    const counts = {};
    list.forEach((p) => {
      const region = p.address?.region || 'Unknown';
      counts[region] = (counts[region] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, [properties]);

  const statsLoading = isLoading && !platformStats;
  const propsLoading = propertiesLoading && !properties;
  const showSkeleton = statsLoading || propsLoading;

  return (
    <div className="px-6 py-8">
      {showSkeleton ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      ) : error && !platformStats ? (
        <div className="flex items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-5 py-4">
          <span className="font-body text-sm text-primary-700">
            Could not load insights.{' '}
            <button
              onClick={() => {
                dispatch(fetchPlatformStats());
                dispatch(fetchAdminProperties({ limit: 500 }));
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
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
              Super Admin
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">
              Insights
            </h1>
          </motion.div>

          {/* Top row: Properties by Region (wider) | Users by Role (narrower) */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-6 lg:grid-cols-3"
          >
            {/* Properties by Region — wider */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-base font-bold text-charcoal-950">
                      Properties by Region
                    </h2>
                    <p className="mt-0.5 font-body text-xs text-charcoal-500">
                      Geographic distribution
                    </p>
                  </div>
                  {propertiesByRegion.length > 0 && (
                    <div className="shrink-0 rounded-xl bg-primary-50 px-4 py-2 text-right">
                      <p className="font-heading text-xl font-bold text-primary-600">
                        {propertiesByRegion.reduce((a, b) => a + b.value, 0)}
                      </p>
                      <p className="font-body text-[11px] text-primary-500">
                        {propertiesByRegion.length} region{propertiesByRegion.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>

                {propertiesByRegion.length > 0 ? (
                  <div className="mt-6">
                    <ResponsiveContainer width="100%" height={Math.max(260, propertiesByRegion.length * 36)}>
                      <BarChart
                        data={propertiesByRegion}
                        layout="vertical"
                        margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
                        barCategoryGap="30%"
                      >
                        <XAxis
                          type="number"
                          tick={false}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 13, fill: '#3b3b44', fontWeight: 500 }}
                          axisLine={false}
                          tickLine={false}
                          width={120}
                        />
                        <Tooltip content={<RegionTooltip />} cursor={{ fill: '#f5f5f7' }} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                          {propertiesByRegion.map((entry, i) => (
                            <Cell
                              key={entry.name}
                              fill={REGION_SHADES[i % REGION_SHADES.length]}
                            />
                          ))}
                          <LabelList
                            dataKey="value"
                            position="right"
                            offset={8}
                            formatter={(val) => `${val}`}
                            style={{ fontSize: 12, fill: '#3b3b44', fontWeight: 600 }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart
                    icon={MdApartment}
                    label="No property data"
                    sublabel="Regional distribution will appear once properties are added."
                  />
                )}
              </div>
            </div>

            {/* Users by Role — narrower */}
            <div>
              <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
                <h2 className="font-heading text-base font-bold text-charcoal-950">
                  Users by Role
                </h2>
                <p className="mt-0.5 font-body text-xs text-charcoal-500">
                  Distribution across all roles
                </p>

                {usersByRole.length > 0 ? (
                  <div className="mt-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={usersByRole}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {usersByRole.map((entry, i) => (
                            <Cell
                              key={entry.name}
                              fill={ROLE_PALETTE[i % ROLE_PALETTE.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          iconSize={8}
                          formatter={(value) => (
                            <span className="font-body text-xs text-charcoal-600">{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <EmptyChart
                    icon={MdPeople}
                    label="No user data"
                    sublabel="User distribution will appear once users register."
                  />
                )}
              </div>
            </div>
          </motion.div>

          {/* Bottom: Tickets by Status — full width */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
              <h2 className="font-heading text-base font-bold text-charcoal-950">
                Tickets by Status
              </h2>
              <p className="mt-0.5 font-body text-xs text-charcoal-500">
                Current ticket pipeline
              </p>

              {ticketsByStatus.length > 0 ? (
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ticketsByStatus} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d9d9de" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#91919e' }}
                        axisLine={{ stroke: '#d9d9de' }}
                        tickLine={false}
                        interval={0}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#91919e' }}
                        axisLine={{ stroke: '#d9d9de' }}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<BarTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={32}>
                        {ticketsByStatus.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart
                  icon={MdConfirmationNumber}
                  label="No ticket data"
                  sublabel="Ticket distribution will appear once tickets are created."
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Insights;
