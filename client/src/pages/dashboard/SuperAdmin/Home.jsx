import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  MdPeople,
  MdApartment,
  MdConfirmationNumber,
  MdDashboard,
} from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import useAuth from '@hooks/useAuth';

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

function PageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-2">
      <div className="space-y-2 lg:col-span-2">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-7 w-56" />
      </div>
      <Skeleton className="h-[196px] rounded-2xl" />
      <Skeleton className="h-[196px] rounded-2xl" />
    </div>
  );
}

const Home = () => {
  const { user } = useAuth();

  const name = useMemo(
    () => user?.name?.split(' ')[0] || 'there',
    [user]
  );

  return (
    <div className="px-6 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-x-6 gap-y-6 lg:grid-cols-2"
      >
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-charcoal-950">
            Welcome back, {name}
          </h1>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal-500">
              Platform Overview
            </p>
            <p className="mt-2 font-heading text-5xl font-bold text-charcoal-950">
              Admin
            </p>
            <p className="mt-3 font-body text-sm text-charcoal-500">
              Manage users, monitor properties, and oversee platform activity.
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="rounded-2xl border border-charcoal-200/70 bg-white p-6 shadow-sm">
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.2em] text-charcoal-500">
              Quick Stats
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-xl bg-charcoal-50/50 px-4 py-3">
                <MdPeople className="text-lg text-charcoal-400" />
                <span className="font-body text-sm text-charcoal-700">Users</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-charcoal-50/50 px-4 py-3">
                <MdApartment className="text-lg text-charcoal-400" />
                <span className="font-body text-sm text-charcoal-700">Properties</span>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-charcoal-50/50 px-4 py-3">
                <MdConfirmationNumber className="text-lg text-charcoal-400" />
                <span className="font-body text-sm text-charcoal-700">Tickets</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
