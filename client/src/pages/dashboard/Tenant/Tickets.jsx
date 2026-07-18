import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import {
  MdConfirmationNumber,
  MdOutlineSchedule,
  MdChevronRight,
  MdFilterList,
} from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import Select from '@components/ui/Select';
import useAuth from '@hooks/useAuth';
import { fetchTickets } from '@store/slices/ticketSlice';
import TicketDetailDrawer from '@features/tickets/TicketDetailDrawer';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'REPORTED', label: 'Reported' },
  { value: 'TRIAGED', label: 'Triaged' },
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

const PRIORITY_COLORS = {
  LOW: 'bg-charcoal-100 text-charcoal-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-primary-100 text-primary-700',
  EMERGENCY: 'bg-primary-200 text-primary-800',
};

const CATEGORY_COLORS = {
  PLUMBING: 'bg-primary-100 text-primary-700',
  ELECTRICAL: 'bg-amber-100 text-amber-700',
  STRUCTURAL: 'bg-charcoal-100 text-charcoal-700',
  APPLIANCE: 'bg-sage-100 text-sage-700',
  HVAC: 'bg-primary-50 text-primary-600',
  OTHER: 'bg-charcoal-50 text-charcoal-600',
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

const TicketsSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading tickets">
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
          className="flex w-full items-center gap-4 rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
          <Skeleton className="hidden h-3 w-16 shrink-0 sm:block" />
          <Skeleton className="h-4 w-4 shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

const Tickets = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isLoading, error, tickets } = useSelector((s) => s.tickets);
  const [statusFilter, setStatusFilter] = useState('');
  const [drawerTicketId, setDrawerTicketId] = useState(null);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const filtered = useMemo(() => {
    if (!tickets) return [];
    if (!statusFilter) return tickets;
    return tickets.filter((t) => (t.status || t.status) === statusFilter);
  }, [tickets, statusFilter]);

  return (
    <>
      <div className="px-6 py-8">
        {isLoading ? (
          <TicketsSkeleton />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
              Tenant dashboard
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-charcoal-950">
              My Tickets
            </h1>
            <p className="mt-1 font-body text-sm text-charcoal-500">
              View and track all your maintenance requests.
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
                Failed to load tickets.{' '}
                <button
                  onClick={() => dispatch(fetchTickets())}
                  className="ml-1 font-semibold underline underline-offset-2 hover:text-primary-800"
                >
                  Retry
                </button>
              </span>
            </div>
            ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-charcoal-200/70 bg-white px-6 py-12 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal-100">
                <MdConfirmationNumber className="text-2xl text-charcoal-400" />
              </div>
              <p className="mt-4 font-heading text-base font-semibold text-charcoal-950">
                {statusFilter ? 'No tickets match this status' : 'No tickets yet'}
              </p>
              <p className="mt-1 max-w-xs font-body text-sm text-charcoal-500">
                {statusFilter
                  ? 'Try selecting a different status filter.'
                  : 'Your maintenance requests will appear here once you submit one.'}
              </p>
            </div>
            ) : (
            <motion.div variants={itemVariants} className="space-y-3">
              {filtered.map((ticket) => (
                <button
                  key={ticket._id || ticket.id}
                  onClick={() => setDrawerTicketId(ticket._id || ticket.id)}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-charcoal-200/70 bg-white p-5 text-left shadow-sm transition-all hover:border-charcoal-300 hover:shadow-md"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-body text-sm font-medium text-charcoal-950 group-hover:text-primary-700">
                      {ticket.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                          CATEGORY_COLORS[ticket.category] || 'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {ticket.category}
                      </span>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                          PRIORITY_COLORS[ticket.priority] || 'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                      STATUS_COLORS[ticket.status] || 'bg-charcoal-100 text-charcoal-600'
                    }`}
                  >
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 font-body text-xs text-charcoal-400 sm:flex">
                    <MdOutlineSchedule className="text-xs" />
                    {formatDistanceToNow(new Date(ticket.createdAt || ticket.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <MdChevronRight className="shrink-0 text-charcoal-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary-400" />
                </button>
              ))}
            </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <TicketDetailDrawer
        isOpen={!!drawerTicketId}
        ticketId={drawerTicketId}
        userRole={user?.role}
        onClose={() => setDrawerTicketId(null)}
      />
    </>
  );
};

export default Tickets;
