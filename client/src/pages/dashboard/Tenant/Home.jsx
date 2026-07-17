import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  MdHome,
  MdConfirmationNumber,
  MdAdd,
  MdChevronRight,
  MdOutlineSchedule,
  MdOutlineListAlt,
  MdOutlineMessage,
  MdCheckCircleOutline,
  MdOutlineEngineering,
  MdOutlineRateReview,
  MdOutlineAssignment,
} from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import useAuth from '@hooks/useAuth';
import { fetchTickets } from '@store/slices/ticketSlice';
import { fetchProperties } from '@store/slices/propertySlice';
import TicketDetailDrawer from '@features/tickets/TicketDetailDrawer';

const STATUS_COLORS = {
  REPORTED: 'bg-amber-400/20 text-amber-700',
  TRIAGED: 'bg-primary-100 text-primary-700',
  ASSIGNED: 'bg-sage-100 text-sage-700',
  IN_PROGRESS: 'bg-primary-200 text-primary-800',
  PENDING_REVIEW: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-sage-200 text-sage-700',
  CLOSED: 'bg-charcoal-200/50 text-charcoal-600',
};

const STATUS_LABELS = {
  REPORTED: 'Maintenance request submitted',
  TRIAGED: 'Issue reviewed and categorized',
  ASSIGNED: 'Technician assigned',
  IN_PROGRESS: 'Repair work in progress',
  PENDING_REVIEW: 'Awaiting your review',
  RESOLVED: 'Issue resolved',
  CLOSED: 'Ticket closed',
};

const STATUS_ICONS = {
  REPORTED: MdConfirmationNumber,
  TRIAGED: MdOutlineAssignment,
  ASSIGNED: MdOutlineEngineering,
  IN_PROGRESS: MdOutlineEngineering,
  PENDING_REVIEW: MdOutlineRateReview,
  RESOLVED: MdCheckCircleOutline,
  CLOSED: MdCheckCircleOutline,
};

const LIFECYCLE_ORDER = [
  'REPORTED',
  'TRIAGED',
  'ASSIGNED',
  'IN_PROGRESS',
  'PENDING_REVIEW',
  'RESOLVED',
  'CLOSED',
];

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
      staggerChildren: 0.13,
      delayChildren: 0.06,
    },
  },
};

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [drawerTicketId, setDrawerTicketId] = useState(null);

  const {
    isLoading: propertiesLoading,
    error: propertiesError,
    properties,
  } = useSelector((s) => s.properties);
  const {
    isLoading: ticketsLoading,
    error: ticketsError,
    tickets,
  } = useSelector((s) => s.tickets);

  useEffect(() => {
    dispatch(fetchProperties());
    dispatch(fetchTickets());
  }, [dispatch]);

  const property = properties?.[0];

  const activeTicket = useMemo(
    () => (tickets ?? []).find((t) => t.status !== 'CLOSED'),
    [tickets]
  );

  const progressPct = useMemo(() => {
    if (!activeTicket) return 0;
    const idx = LIFECYCLE_ORDER.indexOf(activeTicket.status);
    if (idx === -1) return 0;
    return Math.round((idx / (LIFECYCLE_ORDER.length - 1)) * 100);
  }, [activeTicket]);

  const timelineEvents = useMemo(() => {
    if (!tickets || tickets.length === 0) return [];
    const events = [];
    (tickets ?? []).forEach((t) => {
      const label =
        STATUS_LABELS[t.status] || `${t.title} — ${t.status}`;
      events.push({
        id: `${t._id || t.id}-status`,
        date: new Date(t.updatedAt || t.createdAt),
        text: label,
        status: t.status,
        title: t.title,
      });
    });
    events.sort((a, b) => b.date - a.date);
    return events.slice(0, 6);
  }, [tickets]);

  const dataLoading = propertiesLoading || ticketsLoading;
  const anyError = propertiesError || ticketsError;

  return (
    <>
      <div className="px-6 py-8">
        {dataLoading ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-[1fr_340px]">
            <div className="space-y-2 lg:col-span-2">
              <Skeleton className="h-3 w-36" />
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-[196px] rounded-2xl" />
            <Skeleton className="h-[196px] rounded-2xl" />
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-4 w-32" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl bg-charcoal-50/50 p-4"
                >
                  <Skeleton className="h-3 w-3 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-2/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : anyError ? (
          <div className="flex items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-5 py-4">
            <span className="font-body text-sm text-primary-700">
              Could not load data.{' '}
              <button
                onClick={() => {
                  dispatch(fetchProperties());
                  dispatch(fetchTickets());
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
            className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-[1fr_340px]"
          >
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
              <h1 className="mt-1 font-heading text-2xl font-bold text-charcoal-950">
                Welcome, {user?.name}
              </h1>
              {property && (
                <p className="mt-2 flex items-center gap-1.5 font-heading text-base font-light text-charcoal-400">
                  <MdHome className="shrink-0 text-charcoal-300" />
                  Everything at{' '}
                  <span className="font-semibold text-charcoal-500">
                    {property.address?.region}, {property.address?.city}
                    {' '}&mdash;{' '}
                    {property.address?.houseNumber}
                  </span>
                </p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                onClick={() =>
                  activeTicket &&
                  setDrawerTicketId(
                    activeTicket._id || activeTicket.id
                  )
                }
                className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition-all ${
                  activeTicket
                    ? 'border-amber-200/70 bg-gradient-to-br from-amber-50 to-amber-50/40 hover:border-amber-300 hover:shadow-md'
                    : 'cursor-default border-charcoal-200/70 bg-white'
                }`}
              >
                {activeTicket ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                          <MdConfirmationNumber className="text-xl text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-heading text-sm font-bold text-charcoal-950">
                            Active Request
                          </p>
                          <p className="mt-0.5 truncate font-body text-xs text-charcoal-600">
                            {activeTicket.title}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 font-body text-xs font-semibold ${
                          STATUS_COLORS[activeTicket.status] ||
                          'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {activeTicket.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-charcoal-500">
                        <span>Requested</span>
                        <span>Resolved</span>
                      </div>
                      <div className="relative h-2 rounded-full bg-charcoal-200/60">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-500 via-primary-500 to-sage-500 transition-all duration-700"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-right text-xs font-medium text-charcoal-600">
                        {progressPct}% complete
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-amber-200/50 pt-3">
                      <span className="flex items-center gap-1.5 font-body text-xs text-charcoal-500">
                        <MdOutlineSchedule className="text-xs" />
                        {formatDistanceToNow(
                          new Date(
                            activeTicket.createdAt ||
                              activeTicket.updatedAt
                          ),
                          { addSuffix: true }
                        )}
                      </span>
                      <span className="flex items-center gap-1 font-body text-xs font-semibold text-primary-500 transition-colors group-hover:text-primary-600">
                        View Details
                        <MdChevronRight className="text-sm transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal-100">
                      <MdCheckCircleOutline className="text-xl text-charcoal-400" />
                    </div>
                    <p className="mt-3 font-heading text-sm font-semibold text-charcoal-950">
                      No active requests
                    </p>
                    <p className="mt-0.5 font-body text-xs text-charcoal-500">
                      All your maintenance issues are resolved.
                    </p>
                  </div>
                )}
              </button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm">
                <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal-500">
                  Quick Actions
                </p>
                <div className="mt-3 space-y-2.5">
                  <button
                    onClick={() => navigate('/tenant/submit-ticket')}
                    className="flex w-full items-center gap-3 rounded-xl bg-primary-500 px-4 py-3 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-600 active:scale-[0.98]"
                  >
                    <MdAdd className="text-base" />
                    Submit New Request
                  </button>
                  <button
                    onClick={() => navigate('/tenant/tickets')}
                    className="flex w-full items-center gap-3 rounded-xl border border-charcoal-200/70 bg-white px-4 py-2.5 font-body text-xs font-medium text-charcoal-800 transition-colors hover:bg-charcoal-50"
                  >
                    <MdOutlineListAlt className="text-base text-charcoal-400" />
                    View All Tickets
                  </button>
                  <button
                    onClick={() => navigate('/tenant/messages')}
                    className="flex w-full items-center gap-3 rounded-xl border border-charcoal-200/70 bg-white px-4 py-2.5 font-body text-xs font-medium text-charcoal-800 transition-colors hover:bg-charcoal-50"
                  >
                    <MdOutlineMessage className="text-base text-charcoal-400" />
                    Contact Landlord
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm lg:col-span-2"
            >
              <h2 className="font-heading text-base font-bold text-charcoal-950">
                Recent Activity
              </h2>

              {timelineEvents.length === 0 ? (
                <div className="mt-5 flex flex-col items-center justify-center rounded-xl bg-charcoal-50/50 px-6 py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal-100">
                    <MdOutlineSchedule className="text-xl text-charcoal-400" />
                  </div>
                  <p className="mt-3 font-heading text-sm font-semibold text-charcoal-950">
                    No activity yet
                  </p>
                  <p className="mt-0.5 max-w-xs font-body text-xs text-charcoal-500">
                    Your maintenance activity timeline will appear here
                    once you submit a request.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-0">
                  {timelineEvents.map((event, idx) => {
                    const StatusIcon =
                      STATUS_ICONS[event.status] || MdConfirmationNumber;
                    const dotColor =
                      STATUS_COLORS[event.status]?.split(' ')[0] ||
                      'bg-charcoal-300';
                    return (
                      <div
                        key={event.id}
                        className="relative flex gap-4 pb-5 last:pb-0"
                      >
                        {idx < timelineEvents.length - 1 && (
                          <div className="absolute left-[13px] top-[30px] h-full w-px bg-charcoal-200" />
                        )}
                        <div
                          className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            dotColor || 'bg-charcoal-200'
                          }`}
                        >
                          <StatusIcon className="text-xs text-white" />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="truncate font-body text-xs font-medium text-charcoal-950">
                            {event.text}
                          </p>
                          <p className="mt-0.5 font-body text-[11px] text-charcoal-500">
                            {event.title} —{' '}
                            {formatDistanceToNow(event.date, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>

      <TicketDetailDrawer
        isOpen={!!drawerTicketId}
        ticketId={drawerTicketId}
        onClose={() => setDrawerTicketId(null)}
      />
    </>
  );
};

export default Home;
