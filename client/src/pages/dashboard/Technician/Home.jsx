import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  MdAssignment,
  MdConstruction,
  MdHourglassEmpty,
  MdCheckCircleOutline,
  MdOutlineSchedule,
  MdChecklist,
  MdBuild,
  MdThumbUp,
  MdSchedule,
} from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import useAuth from '@hooks/useAuth';
import { fetchTickets } from '@store/slices/ticketSlice';
import { fetchCurrentUser } from '@store/slices/authSlice';
import { updateProfile } from '@services/user.api';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

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

const STATUS_ICONS = {
  REPORTED: MdChecklist,
  TRIAGED: MdConstruction,
  ASSIGNED: MdBuild,
  IN_PROGRESS: MdConstruction,
  PENDING_REVIEW: MdHourglassEmpty,
  RESOLVED: MdThumbUp,
  CLOSED: MdCheckCircleOutline,
};

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const {
    isLoading: ticketsLoading,
    error: ticketsError,
    tickets,
  } = useSelector((s) => s.tickets);

  const [togglingAvailability, setTogglingAvailability] = useState(false);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const name = useMemo(
    () => user?.name?.split(' ')[0] || 'there',
    [user]
  );

  const allTickets = useMemo(() => tickets ?? [], [tickets]);

  const activeTickets = useMemo(
    () => allTickets.filter((t) => !['RESOLVED', 'CLOSED'].includes(t.status)),
    [allTickets]
  );

  const inProgress = useMemo(
    () => activeTickets.filter((t) => t.status === 'IN_PROGRESS').length,
    [activeTickets]
  );

  const pendingReview = useMemo(
    () => activeTickets.filter((t) => t.status === 'PENDING_REVIEW').length,
    [activeTickets]
  );

  const isAvailable = user?.profile?.isAvailable ?? true;

  const handleToggleAvailability = useCallback(async () => {
    if (togglingAvailability) return;
    setTogglingAvailability(true);
    try {
      await updateProfile({
        profile: { ...user?.profile, isAvailable: !isAvailable },
      });
      await dispatch(fetchCurrentUser()).unwrap();
    } catch {
      // silently fail — user can retry
    } finally {
      setTogglingAvailability(false);
    }
  }, [togglingAvailability, isAvailable, user, dispatch]);

  const timelineEvents = useMemo(() => {
    if (allTickets.length === 0) return [];
    const events = [];
    allTickets.forEach((t) => {
      (t.auditTrail ?? []).forEach((entry) => {
        events.push({
          id: `${t._id || t.id}-${entry.timestamp}`,
          date: new Date(entry.timestamp),
          text: entry.toStatus.replace(/_/g, ' '),
          status: entry.toStatus,
          title: t.title,
          actor: entry.actorId?.name || 'System',
          reason: entry.reason,
        });
      });
    });
    events.sort((a, b) => b.date - a.date);
    return events.slice(0, 6);
  }, [allTickets]);

  const dataLoading = ticketsLoading;
  const anyError = ticketsError;

  return (
    <div className="px-6 py-8">
      {dataLoading ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-2 lg:col-span-2">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-7 w-56" />
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
            Could not load your assignments.{' '}
            <button
              onClick={() => dispatch(fetchTickets())}
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
          className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-[2fr_1fr]"
        >
          {/* Greeting — spans both columns */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-charcoal-950">
              {getGreeting()}, {name}
            </h1>
          </motion.div>

          {/* Hero card — active assignments with stat pills */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal-500">
                Active Assignments
              </p>
              <p className="mt-2 font-heading text-5xl font-bold text-charcoal-950">
                {activeTickets.length}
              </p>

              {activeTickets.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1.5 font-body text-xs font-semibold text-primary-700">
                    <MdConstruction className="text-sm" />
                    In progress · {inProgress}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 font-body text-xs font-semibold text-amber-700">
                    <MdHourglassEmpty className="text-sm" />
                    Pending review · {pendingReview}
                  </span>
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center justify-center py-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-charcoal-100">
                    <MdCheckCircleOutline className="text-xl text-charcoal-400" />
                  </div>
                  <p className="mt-3 font-heading text-sm font-semibold text-charcoal-950">
                    No active assignments
                  </p>
                  <p className="mt-0.5 font-body text-xs text-charcoal-500">
                    Tickets assigned to you will appear here.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick actions side card */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal-500">
                Quick Actions
              </p>
              <div className="mt-4 space-y-2.5">
                <button
                  onClick={() => navigate('/technician/assignments')}
                  className="flex w-full items-center gap-3 rounded-xl bg-primary-500 px-4 py-3 font-heading text-xs font-semibold text-white transition-all hover:bg-primary-600 active:scale-[0.98]"
                >
                  <MdAssignment className="text-base" />
                  View Assignments
                </button>

                <button
                  onClick={handleToggleAvailability}
                  disabled={togglingAvailability}
                  className="flex w-full items-center justify-between rounded-xl border border-charcoal-200/70 bg-white px-4 py-2.5 font-body text-xs font-medium text-charcoal-800 transition-colors hover:bg-charcoal-50"
                >
                  <span className="flex items-center gap-3">
                    <MdSchedule className="text-base text-charcoal-400" />
                    Available for work
                  </span>
                  <span
                    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ${
                      isAvailable ? 'bg-primary-500' : 'bg-charcoal-300'
                    } ${togglingAvailability ? 'opacity-50' : ''}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        isAvailable ? 'translate-x-[18px]' : 'translate-x-[3px]'
                      }`}
                    />
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Recent activity timeline — full width */}
          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm lg:col-span-2"
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
                  Updates on your assigned tickets will appear here once work
                  begins.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-0">
                {timelineEvents.map((event, idx) => {
                  const StatusIcon =
                    STATUS_ICONS[event.status] || MdChecklist;
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
  );
};

export default Home;
