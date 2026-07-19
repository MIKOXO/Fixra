import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  MdBuild,
  MdFilterList,
  MdRequestQuote,
  MdConstruction,
} from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import Select from '@components/ui/Select';
import { fetchContractorJobs, clearJobError } from '@store/slices/jobSlice';
import TicketDetailDrawer from '@features/tickets/TicketDetailDrawer';
import SubmitEstimateModal from '@features/jobs/SubmitEstimateModal';
import DispatchTechnicianModal from '@features/jobs/DispatchTechnicianModal';
import useAuth from '@hooks/useAuth';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const STATUS_COLORS = {
  REPORTED: 'bg-amber-400/20 text-amber-700',
  TRIAGED: 'bg-primary-100 text-primary-700',
  ASSIGNED: 'bg-sage-100 text-sage-700',
  IN_PROGRESS: 'bg-primary-200 text-primary-800',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-sage-200 text-sage-700',
  CLOSED: 'bg-charcoal-200/50 text-charcoal-600',
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

function TableSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading jobs">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-10 w-44 rounded-xl" />
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-charcoal-200/70 bg-white px-5 py-4 shadow-sm"
          >
            <Skeleton className="h-4 w-[30%] rounded" />
            <Skeleton className="h-4 w-[20%] rounded" />
            <Skeleton className="h-5 w-[12%] rounded-full" />
            <Skeleton className="ml-auto h-8 w-[14%] rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

const Jobs = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isLoading, error, jobs } = useSelector((s) => s.jobs);
  const [statusFilter, setStatusFilter] = useState('');
  const [drawerTicketId, setDrawerTicketId] = useState(null);
  const [estimateTarget, setEstimateTarget] = useState(null);
  const [dispatchTarget, setDispatchTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchContractorJobs());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearJobError()), 6000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const filtered = useMemo(() => {
    if (!jobs) return [];
    if (!statusFilter) return jobs;
    return jobs.filter((t) => t.status === statusFilter);
  }, [jobs, statusFilter]);

  const needsEstimate = useMemo(
    () =>
      (jobs ?? []).filter((t) => t.status === 'ASSIGNED' && !t.jobId).length > 0,
    [jobs]
  );

  return (
    <>
      <div className="px-6 py-8">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
                Contractor
              </p>
              <h1 className="mt-1 font-heading text-2xl font-bold text-charcoal-950">
                Jobs
              </h1>
              <p className="mt-1 font-body text-sm text-charcoal-500">
                Manage estimates and track assigned work.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <MdFilterList className="text-lg text-charcoal-400" />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={STATUS_OPTIONS}
                placeholder="All statuses"
                className="w-44"
              />
            </motion.div>

            {error ? (
              <div className="flex items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-5 py-4">
                <span className="font-body text-sm text-primary-700">
                  Failed to load jobs.{' '}
                  <button
                    onClick={() => dispatch(fetchContractorJobs())}
                    className="ml-1 font-semibold underline underline-offset-2 hover:text-primary-800"
                  >
                    Retry
                  </button>
                </span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-charcoal-200/70 bg-white px-6 py-12 text-center shadow-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal-100">
                  <MdBuild className="text-2xl text-charcoal-400" />
                </div>
                <p className="mt-4 font-heading text-base font-semibold text-charcoal-950">
                  {statusFilter ? 'No jobs match this status' : 'No jobs yet'}
                </p>
                <p className="mt-1 max-w-xs font-body text-sm text-charcoal-500">
                  {statusFilter
                    ? 'Try selecting a different status filter.'
                    : 'Jobs assigned to your business will appear here.'}
                </p>
              </div>
            ) : (
              <motion.div variants={itemVariants}>
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="flex items-center gap-4 px-5 py-3 font-heading text-[11px] font-semibold uppercase tracking-[0.06em] text-charcoal-400">
                      <span className="w-[30%]">Title</span>
                      <span className="w-[22%]">Property</span>
                      <span className="w-[14%]">Status</span>
                      <span className="w-[14%]">Estimate</span>
                      <span className="w-[20%] text-right">Action</span>
                    </div>
                    <div className="divide-y divide-charcoal-100 rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
                      {filtered.map((ticket) => {
                        const tid = ticket._id || ticket.id;
                        const propertyName =
                          ticket.propertyId?.name || ticket.propertyName || '—';
                        const unitInfo = ticket.unitNumber || ticket.unitId || '';
                        const hasJob = !!ticket.jobId;
                        const isAssignedNoJob = ticket.status === 'ASSIGNED' && !hasJob;
                        const isApprovedNoTech = ticket.status === 'IN_PROGRESS' && hasJob;

                        return (
                          <button
                            key={tid}
                            onClick={() => setDrawerTicketId(tid)}
                            className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-charcoal-50/50"
                          >
                            <span className="w-[30%] truncate font-body text-sm font-medium text-charcoal-950">
                              {ticket.title}
                            </span>
                            <span className="w-[22%] truncate font-body text-xs text-charcoal-500">
                              {propertyName}
                              {unitInfo ? ` / ${unitInfo}` : ''}
                            </span>
                            <span className="w-[14%]">
                              <span
                                className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                                  STATUS_COLORS[ticket.status] || 'bg-charcoal-100 text-charcoal-600'
                                }`}
                              >
                                {ticket.status.replace(/_/g, ' ')}
                              </span>
                            </span>
                            <span className="w-[14%] font-body text-xs text-charcoal-500">
                              {hasJob ? 'Submitted' : '—'}
                            </span>
                            <span className="w-[20%] text-right" onClick={(e) => e.stopPropagation()}>
                              {isAssignedNoJob && (
                                <button
                                  onClick={() => setEstimateTarget(ticket)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 font-heading text-[11px] font-semibold text-primary-600 transition-colors hover:bg-primary-100"
                                >
                                  <MdRequestQuote className="text-xs" />
                                  Estimate
                                </button>
                              )}
                              {isApprovedNoTech && (
                                <button
                                  onClick={() => setDispatchTarget(ticket)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-sage-50 px-3 py-1.5 font-heading text-[11px] font-semibold text-sage-700 transition-colors hover:bg-sage-100"
                                >
                                  <MdConstruction className="text-xs" />
                                  Dispatch
                                </button>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <SubmitEstimateModal
        isOpen={!!estimateTarget}
        onClose={() => setEstimateTarget(null)}
        ticket={estimateTarget}
      />

      <DispatchTechnicianModal
        isOpen={!!dispatchTarget}
        onClose={() => setDispatchTarget(null)}
        ticket={dispatchTarget}
        jobId={dispatchTarget?.jobId}
      />

      <TicketDetailDrawer
        isOpen={!!drawerTicketId}
        ticketId={drawerTicketId}
        onClose={() => setDrawerTicketId(null)}
        userRole={user?.role}
        onSubmitEstimate={(ticket) => {
          setDrawerTicketId(null);
          setTimeout(() => setEstimateTarget(ticket), 100);
        }}
        onDispatchTechnician={(ticket) => {
          setDrawerTicketId(null);
          setTimeout(() => setDispatchTarget(ticket), 100);
        }}
      />
    </>
  );
};

export default Jobs;
