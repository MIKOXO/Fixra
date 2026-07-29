import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MdConfirmationNumber } from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import Select from '@components/ui/Select';
import TicketDetailDrawer from '@features/tickets/TicketDetailDrawer';
import { fetchAdminTickets } from '@store/slices/adminSlice';
import { fetchTicketById, clearCurrentTicket } from '@store/slices/ticketSlice';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'REPORTED', label: 'Reported' },
  { value: 'TRIAGED', label: 'Triaged' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_REVIEW', label: 'Pending Review' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'STRUCTURAL', label: 'Structural' },
  { value: 'APPLIANCE', label: 'Appliance' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'OTHER', label: 'Other' },
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'EMERGENCY', label: 'Emergency' },
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

const PRIORITY_COLORS = {
  LOW: 'bg-charcoal-100 text-charcoal-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-primary-100 text-primary-700',
  EMERGENCY: 'bg-primary-200 text-primary-800',
};

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

function TableSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-charcoal-50/50 px-5 py-4">
          <Skeleton className="h-4 w-[18%] rounded" />
          <Skeleton className="h-4 w-[16%] rounded" />
          <Skeleton className="h-4 w-[14%] rounded" />
          <Skeleton className="h-4 w-[14%] rounded" />
          <Skeleton className="h-5 w-[10%] rounded-full" />
          <Skeleton className="h-5 w-[10%] rounded-full" />
          <Skeleton className="h-4 w-[12%] rounded" />
        </div>
      ))}
    </div>
  );
}

const Tickets = () => {
  const dispatch = useDispatch();
  const { tickets, ticketsLoading, error } = useSelector((s) => s.admin);

  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const limit = 15;

  useEffect(() => {
    dispatch(fetchAdminTickets({
      page,
      limit,
      status: statusFilter || undefined,
      category: categoryFilter || undefined,
      priority: priorityFilter || undefined,
    }));
  }, [dispatch, page, statusFilter, categoryFilter, priorityFilter]);

  useEffect(() => {
    if (!selectedTicketId) return;
    dispatch(fetchTicketById(selectedTicketId));
  }, [dispatch, selectedTicketId]);

  const ticketList = tickets?.tickets ?? [];
  const pagination = tickets?.pagination ?? { page: 1, limit: 15, total: 0, pages: 1 };
  const hasFilters = statusFilter || categoryFilter || priorityFilter;

  const showSkeleton = ticketsLoading && !tickets;

  return (
    <div className="px-6 py-8">
      {showSkeleton ? (
        <>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <TableSkeleton />
        </>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
              Super Admin
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">
              Tickets
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              value={statusFilter}
              onChange={(v) => { setStatusFilter(v); setPage(1); }}
              options={STATUS_OPTIONS}
              placeholder="All Statuses"
            />
            <Select
              value={categoryFilter}
              onChange={(v) => { setCategoryFilter(v); setPage(1); }}
              options={CATEGORY_OPTIONS}
              placeholder="All Categories"
            />
            <Select
              value={priorityFilter}
              onChange={(v) => { setPriorityFilter(v); setPage(1); }}
              options={PRIORITY_OPTIONS}
              placeholder="All Priorities"
            />
          </motion.div>

          {error && (
            <motion.div variants={itemVariants} className="mt-4 flex items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-5 py-4">
              <span className="font-body text-sm text-primary-700">
                Could not load tickets.{' '}
                <button
                  onClick={() => dispatch(fetchAdminTickets({
                    page, limit,
                    status: statusFilter || undefined,
                    category: categoryFilter || undefined,
                    priority: priorityFilter || undefined,
                  }))}
                  className="ml-1 font-semibold underline underline-offset-2 hover:text-primary-800"
                >
                  Retry
                </button>
              </span>
            </motion.div>
          )}

          {!error && ticketList.length === 0 ? (
            <motion.div variants={itemVariants} className="mt-16 flex flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                <MdConfirmationNumber className="text-3xl text-primary-400" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold text-charcoal-950">
                {hasFilters ? 'No matching tickets' : 'No tickets yet'}
              </h2>
              <p className="mt-1 font-body text-sm text-charcoal-500">
                {hasFilters ? 'Try adjusting your filters.' : 'Tickets will appear here once tenants submit them.'}
              </p>
            </motion.div>
          ) : (
            <>
              <motion.div variants={itemVariants} className="mt-6 overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="flex items-center gap-4 px-5 py-3 font-heading text-[11px] font-semibold uppercase tracking-[0.06em] text-charcoal-400">
                    <span className="w-[18%]">Title</span>
                    <span className="w-[16%]">Property</span>
                    <span className="w-[14%]">Tenant</span>
                    <span className="w-[14%]">Landlord</span>
                    <span className="w-[10%]">Status</span>
                    <span className="w-[10%]">Priority</span>
                    <span className="w-[12%]">Created</span>
                  </div>
                  <div className="divide-y divide-charcoal-100 rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
                    {ticketList.map((t) => {
                      const tid = t._id || t.id;
                      return (
                        <button
                          key={tid}
                          onClick={() => setSelectedTicketId(tid)}
                          className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-charcoal-50/50"
                        >
                          <span className="w-[18%] truncate font-body text-sm font-medium text-charcoal-950">
                            {t.title}
                          </span>
                          <span className="w-[16%] truncate font-body text-xs text-charcoal-500">
                            {t.propertyId?.name || t.propertyName || '—'}
                          </span>
                          <span className="w-[14%] truncate font-body text-xs text-charcoal-500">
                            {t.tenantId?.name || t.tenantName || '—'}
                          </span>
                          <span className="w-[14%] truncate font-body text-xs text-charcoal-500">
                            {t.landlordId?.name || t.landlordName || '—'}
                          </span>
                          <span className="w-[10%]">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${STATUS_COLORS[t.status] || 'bg-charcoal-100 text-charcoal-600'}`}>
                              {t.status?.replace(/_/g, ' ') || '—'}
                            </span>
                          </span>
                          <span className="w-[10%]">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${PRIORITY_COLORS[t.priority] || 'bg-charcoal-100 text-charcoal-600'}`}>
                              {t.priority || '—'}
                            </span>
                          </span>
                          <span className="w-[12%] truncate font-body text-xs text-charcoal-400">
                            {t.createdAt ? format(new Date(t.createdAt), 'MMM d, yyyy') : '—'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {pagination.pages > 1 && (
                <motion.div variants={itemVariants} className="mt-6 flex items-center justify-between">
                  <p className="font-body text-xs text-charcoal-500">
                    Page {pagination.page} of {pagination.pages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={pagination.page <= 1}
                      className="rounded-xl border border-charcoal-200/90 bg-white px-4 py-2 font-heading text-xs font-semibold text-charcoal-700 transition-colors hover:bg-charcoal-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={pagination.page >= pagination.pages}
                      className="rounded-xl border border-charcoal-200/90 bg-white px-4 py-2 font-heading text-xs font-semibold text-charcoal-700 transition-colors hover:bg-charcoal-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      )}

      <TicketDetailDrawer
        isOpen={!!selectedTicketId}
        ticketId={selectedTicketId}
        onClose={() => {
          setSelectedTicketId(null);
          dispatch(clearCurrentTicket());
        }}
        userRole="SUPER_ADMIN"
      />
    </div>
  );
};

export default Tickets;
