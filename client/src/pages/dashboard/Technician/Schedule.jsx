import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  format,
  formatDistanceToNow,
  isToday,
  isThisWeek,
  startOfDay,
} from 'date-fns';
import { MdSchedule, MdAssignment } from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import { fetchTickets, clearTicketError } from '@store/slices/ticketSlice';

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

function ScheduleSkeleton() {
  return (
    <div className="mt-6 space-y-8">
      {[1, 2].map((g) => (
        <div key={g}>
          <Skeleton className="h-4 w-28 rounded" />
          <div className="mt-3 space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl bg-charcoal-50/50 px-5 py-4"
              >
                <Skeleton className="h-4 w-[30%] rounded" />
                <Skeleton className="h-4 w-[18%] rounded" />
                <Skeleton className="h-5 w-[10%] rounded-full" />
                <Skeleton className="h-5 w-[12%] rounded-full" />
                <Skeleton className="ml-auto h-4 w-[14%] rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const Schedule = () => {
  const dispatch = useDispatch();
  const { tickets, isLoading } = useSelector((s) => s.tickets);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  useEffect(() => {
    if (tickets?.length) {
      dispatch(clearTicketError());
    }
  }, [tickets, dispatch]);

  const groups = useMemo(() => {
    const all = tickets ?? [];
    const today = [];
    const thisWeek = [];
    const later = [];

    all.forEach((t) => {
      const date = new Date(t.updatedAt || t.createdAt);
      if (isToday(date)) {
        today.push(t);
      } else if (isThisWeek(date)) {
        thisWeek.push(t);
      } else {
        later.push(t);
      }
    });

    const result = [];
    if (today.length > 0) result.push({ label: 'Today', items: today });
    if (thisWeek.length > 0) result.push({ label: 'This Week', items: thisWeek });
    if (later.length > 0) result.push({ label: 'Later', items: later });
    return result;
  }, [tickets]);

  const showSkeleton = isLoading && !tickets?.length;

  return (
    <div className="px-6 py-8">
      {showSkeleton ? (
        <>
          <div className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <ScheduleSkeleton />
        </>
      ) : groups.length === 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
              Technician
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">
              Schedule
            </h1>
          </motion.div>
          <motion.div variants={itemVariants} className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
              <MdSchedule className="text-3xl text-primary-400" />
            </div>
            <h2 className="mt-4 font-heading text-xl font-bold text-charcoal-950">
              No scheduled assignments
            </h2>
            <p className="mt-1 font-body text-sm text-charcoal-500">
              Assigned tickets will appear here grouped by date.
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
              Schedule
            </h1>
          </motion.div>

          {/* NOTE: grouping uses updatedAt as a proxy for visit date.
              The ticket schema has no dedicated scheduled-visit field yet;
              once one is added, switch to that instead. */}

          <div className="mt-8 space-y-8">
            {groups.map((group) => (
              <motion.div key={group.label} variants={itemVariants}>
                <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-charcoal-500">
                  {group.label}
                </h2>
                <div className="mt-3 divide-y divide-charcoal-100 rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
                  {group.items.map((ticket) => {
                    const tid = ticket._id || ticket.id;
                    const propertyName =
                      ticket.propertyId?.name || ticket.propertyName || '—';
                    const date = new Date(
                      ticket.updatedAt || ticket.createdAt
                    );
                    return (
                      <div
                        key={tid}
                        className="flex items-center gap-4 px-5 py-3.5"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-body text-sm font-medium text-charcoal-950">
                            {ticket.title}
                          </p>
                          <p className="mt-0.5 truncate font-body text-xs text-charcoal-500">
                            {propertyName}
                          </p>
                        </div>
                        <span className="shrink-0">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                              PRIORITY_COLORS[ticket.priority] ||
                              'bg-charcoal-100 text-charcoal-600'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </span>
                        <span className="shrink-0">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                              STATUS_COLORS[ticket.status] ||
                              'bg-charcoal-100 text-charcoal-600'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </span>
                        <span className="shrink-0 font-body text-xs text-charcoal-400">
                          {formatDistanceToNow(date, { addSuffix: true })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Schedule;
