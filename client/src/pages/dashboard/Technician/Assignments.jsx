import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { MdAssignment } from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import Select from '@components/ui/Select';
import useAuth from '@hooks/useAuth';
import { fetchTickets, clearTicketError } from '@store/slices/ticketSlice';
import TicketDetailDrawer from '@features/tickets/TicketDetailDrawer';
import UpdateStatusModal from '@features/tickets/UpdateStatusModal';

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.13,
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

const TECHNICIAN_STATUSES = ['IN_PROGRESS', 'PENDING_REVIEW', 'RESOLVED'];

function TableSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-charcoal-50/50 px-5 py-4">
          <Skeleton className="h-4 w-[28%] rounded" />
          <Skeleton className="h-4 w-[18%] rounded" />
          <Skeleton className="h-4 w-[14%] rounded" />
          <Skeleton className="h-5 w-[10%] rounded-full" />
          <Skeleton className="h-5 w-[12%] rounded-full" />
          <Skeleton className="ml-auto h-8 w-[12%] rounded-xl" />
        </div>
      ))}
    </div>
  );
}

const Assignments = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { tickets, isLoading, error } = useSelector((s) => s.tickets);

  const [statusFilter, setStatusFilter] = useState('');
  const [drawerTicketId, setDrawerTicketId] = useState(null);
  const [updateTarget, setUpdateTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearTicketError()), 6000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const filteredTickets = useMemo(() => {
    return (tickets ?? []).filter((t) => {
      if (statusFilter && t.status !== statusFilter) return false;
      return true;
    });
  }, [tickets, statusFilter]);

  const handleOpenDrawer = (id) => {
    setDrawerTicketId(id);
  };

  const handleCloseDrawer = () => {
    setDrawerTicketId(null);
  };

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All Statuses' },
      ...TECHNICIAN_STATUSES.map((s) => ({ value: s, label: s })),
    ],
    []
  );

  const hasFilters = !!statusFilter;

  return (
    <div className="px-6 py-8">
      {isLoading && !tickets?.length ? (
        <>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-36" />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-11 rounded-xl" />
          </div>
          <TableSkeleton />
        </>
      ) : filteredTickets.length === 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
              Technician
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">
              Assignments
            </h1>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="All Statuses"
            />
          </motion.div>
          <motion.div variants={itemVariants} className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <MdAssignment className="text-3xl text-primary-400" />
            </div>
            <h2 className="mt-4 font-heading text-xl font-bold text-charcoal-950">
              {hasFilters ? 'No matching assignments' : 'No assignments yet'}
            </h2>
            <p className="mt-1 font-body text-sm text-charcoal-500">
              {hasFilters
                ? 'Try adjusting your filters.'
                : 'Tickets assigned to you will appear here.'}
            </p>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
              Technician
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">
              Assignments
            </h1>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="All Statuses"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="mt-6 overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="flex items-center gap-4 px-5 py-3 font-heading text-[11px] font-semibold uppercase tracking-[0.06em] text-charcoal-400">
                <span className="w-[28%]">Title</span>
                <span className="w-[18%]">Property</span>
                <span className="w-[14%]">Category</span>
                <span className="w-[10%]">Priority</span>
                <span className="w-[12%]">Status</span>
                <span className="w-[12%]" />
              </div>
              <div className="divide-y divide-charcoal-100 rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
                {filteredTickets.map((ticket) => {
                  const tid = ticket._id || ticket.id;
                  const propertyName =
                    ticket.propertyId?.name || ticket.propertyName || '—';
                  return (
                    <button
                      key={tid}
                      onClick={() => handleOpenDrawer(tid)}
                      className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-charcoal-50/50"
                    >
                      <span className="w-[28%] truncate font-body text-sm font-medium text-charcoal-950">
                        {ticket.title}
                      </span>
                      <span className="w-[18%] truncate font-body text-xs text-charcoal-500">
                        {propertyName}
                      </span>
                      <span className="w-[14%] truncate font-body text-xs text-charcoal-500">
                        {ticket.category}
                      </span>
                      <span className="w-[10%]">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                            PRIORITY_COLORS[ticket.priority] ||
                            'bg-charcoal-100 text-charcoal-600'
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </span>
                      <span className="w-[12%]">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                            STATUS_COLORS[ticket.status] ||
                            'bg-charcoal-100 text-charcoal-600'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </span>
                      <span
                        className="w-[12%] text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {ticket.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => setUpdateTarget(tid)}
                            className="rounded-lg bg-primary-50 px-3 py-1.5 font-heading text-[11px] font-semibold text-primary-600 transition-colors hover:bg-primary-100"
                          >
                            Update Status
                          </button>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      <UpdateStatusModal
        isOpen={!!updateTarget}
        ticketId={updateTarget}
        onClose={() => setUpdateTarget(null)}
        onSuccess={() => dispatch(fetchTickets())}
      />

      <TicketDetailDrawer
        isOpen={!!drawerTicketId}
        ticketId={drawerTicketId}
        onClose={() => setDrawerTicketId(null)}
        userRole={user?.role}
      />
    </div>
  );
};

export default Assignments;
