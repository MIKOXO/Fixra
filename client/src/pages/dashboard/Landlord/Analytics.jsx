import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend,
} from 'recharts';
import { MdBarChart, MdEngineering, MdInsights, MdSchedule } from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import { fetchLandlordStats } from '@store/slices/analyticsSlice';

const inputClass =
  'rounded-xl border border-charcoal-200/90 bg-white px-3.5 py-2.5 font-body text-sm text-charcoal-700 outline-none transition duration-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const CHART_COLORS = ['#e85d3a', '#eaae08', '#568159', '#4c4c57', '#f4795a', '#fdd846'];

function ChartSkeleton() {
  return <Skeleton className="h-64 w-full rounded-xl" />;
}

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

function transformMaintenanceData(data) {
  if (!data || data.length === 0) return [];
  const categories = [...new Set(data.map((d) => d.category))];
  const unitIds = [...new Set(data.map((d) => d.unitId))];
  return unitIds.map((unitId) => {
    const row = { unit: unitId || 'Unknown' };
    categories.forEach((cat) => {
      row[cat] = data.find((d) => d.unitId === unitId && d.category === cat)?.count || 0;
    });
    return row;
  });
}

function ChartCard({ title, subtitle, children, isEmpty, icon: Icon, loading }) {
  return (
    <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50">
          <Icon className="text-base text-primary-500" />
        </div>
        <div>
          <h3 className="font-heading text-base font-bold text-charcoal-950">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 font-body text-xs text-charcoal-500">{subtitle}</p>
          )}
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

function CustomTooltip({ active, payload, label, valuePrefix, valueSuffix }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={tooltipStyle()}>
      <p className="font-heading text-xs font-semibold text-charcoal-700">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="mt-1 font-body text-xs" style={{ color: entry.color }}>
          {entry.name}: {valuePrefix}{entry.value?.toLocaleString()}{valueSuffix}
        </p>
      ))}
    </div>
  );
}

const Analytics = () => {
  const dispatch = useDispatch();
  const {
    resolutionTime,
    technicianPerformance,
    costPerProperty,
    maintenanceFrequency,
    isLoading,
  } = useSelector((s) => s.analytics);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetch = useCallback(() => {
    const params = {};
    if (dateFrom) params.from = dateFrom;
    if (dateTo) params.to = dateTo;
    dispatch(fetchLandlordStats(params));
  }, [dispatch, dateFrom, dateTo]);

  useEffect(() => { fetch(); }, [fetch]);

  const maintenanceData = useMemo(() => transformMaintenanceData(maintenanceFrequency), [maintenanceFrequency]);
  const maintenanceCategories = useMemo(() => {
    if (!maintenanceFrequency || maintenanceFrequency.length === 0) return [];
    return [...new Set(maintenanceFrequency.map((d) => d.category))];
  }, [maintenanceFrequency]);

  const getReopenRate = (row) => {
    if (!row.totalAssigned || row.totalAssigned === 0) return 0;
    return row.reopenedCount / row.totalAssigned;
  };

  const getPerformanceDot = (row) => {
    const rate = getReopenRate(row);
    if (rate < 0.1) return 'bg-sage-500';
    if (rate < 0.25) return 'bg-amber-500';
    return 'bg-primary-500';
  };

  return (
    <div className="px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
            Landlord
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">Analytics</h1>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <label className="block font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-charcoal-500">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </div>
          <div>
            <label className="block font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-charcoal-500">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`mt-1 ${inputClass}`}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Resolution Time"
          subtitle="Average time to resolve tickets per property"
          icon={MdSchedule}
          loading={isLoading}
          isEmpty={!resolutionTime || resolutionTime.length === 0}
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={resolutionTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9d9de" />
              <XAxis
                dataKey="propertyName"
                tick={{ fontSize: 11, fill: '#91919e' }}
                axisLine={{ stroke: '#d9d9de' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#91919e' }}
                axisLine={{ stroke: '#d9d9de' }}
                tickLine={false}
                label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#91919e' } }}
              />
              <Tooltip content={<CustomTooltip valueSuffix=" hrs" />} />
              <Line
                type="monotone"
                dataKey="avgResolutionHours"
                name="Avg hours"
                stroke="#e85d3a"
                strokeWidth={2}
                dot={{ fill: '#e85d3a', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Cost Per Property"
          subtitle="Total estimated cost by property"
          icon={MdBarChart}
          loading={isLoading}
          isEmpty={!costPerProperty || costPerProperty.length === 0}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={costPerProperty}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9d9de" />
              <XAxis
                dataKey="propertyName"
                tick={{ fontSize: 11, fill: '#91919e' }}
                axisLine={{ stroke: '#d9d9de' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#91919e' }}
                axisLine={{ stroke: '#d9d9de' }}
                tickLine={false}
                label={{ value: 'ETB', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#91919e' } }}
              />
              <Tooltip content={<CustomTooltip valuePrefix="ETB " />} />
              <Bar dataKey="totalCost" name="Total cost" fill="#e85d3a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Maintenance Frequency"
          subtitle="Tickets by category and unit"
          icon={MdInsights}
          loading={isLoading}
          isEmpty={maintenanceData.length === 0}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={maintenanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d9d9de" />
              <XAxis
                dataKey="unit"
                tick={{ fontSize: 11, fill: '#91919e' }}
                axisLine={{ stroke: '#d9d9de' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#91919e' }}
                axisLine={{ stroke: '#d9d9de' }}
                tickLine={false}
              />
              <Tooltip />
              <Legend
                wrapperStyle={{ fontSize: '11px', fontWeight: 500 }}
                iconType="circle"
                iconSize={8}
              />
              {maintenanceCategories.map((cat, i) => (
                <Bar
                  key={cat}
                  dataKey={cat}
                  name={cat}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  stackId={undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Technician Performance"
          subtitle="Workload and quality metrics"
          icon={MdEngineering}
          loading={isLoading}
          isEmpty={!technicianPerformance || technicianPerformance.length === 0}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="font-heading text-[11px] font-semibold uppercase tracking-[0.06em] text-charcoal-400">
                  <th className="pb-2 pr-3">Technician</th>
                  <th className="pb-2 pr-3">Completed</th>
                  <th className="pb-2 pr-3">Avg Hours</th>
                  <th className="pb-2 pr-3">Reopens</th>
                  <th className="pb-2 pr-2">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-50">
                {(technicianPerformance ?? []).map((row, i) => (
                  <tr key={row.technicianId || i} className="font-body text-sm text-charcoal-700">
                    <td className="py-2.5 pr-3 font-medium text-charcoal-950">
                      {row.technicianName || 'Unknown'}
                    </td>
                    <td className="py-2.5 pr-3">{row.resolvedCount ?? 0}</td>
                    <td className="py-2.5 pr-3">
                      {row.avgResolutionHours != null ? `${row.avgResolutionHours}h` : '—'}
                    </td>
                    <td className="py-2.5 pr-3">{row.reopenedCount ?? 0}</td>
                    <td className="py-2.5 pr-2">
                      <span className={`inline-block h-2.5 w-2.5 rounded-full ${getPerformanceDot(row)}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;