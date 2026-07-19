import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { MdBuild, MdPeople, MdPerson, MdBarChart, MdSettings } from 'react-icons/md';
import useAuth from '@hooks/useAuth';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

const QUICK_LINKS = [
  { label: 'Jobs', icon: MdBuild },
  { label: 'Technicians', icon: MdPeople },
  { label: 'Profile', icon: MdPerson },
  { label: 'Analytics', icon: MdBarChart },
  { label: 'Settings', icon: MdSettings },
];

const Home = () => {
  const { user } = useAuth();

  const email = useMemo(() => user?.email ?? '—', [user]);
  const name = useMemo(() => user?.name ?? 'Contractor', [user]);

  return (
    <div className="px-6 py-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">
            {getGreeting()}, {name}
          </h1>
          <p className="mt-2 font-body text-sm text-charcoal-500">
            Manage your jobs, coordinate your technicians, and track your
            performance across assigned properties.
          </p>
        </motion.div>

        <motion.section
          variants={itemVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal-500">
              Email
            </p>
            <p className="mt-2 text-sm font-medium text-charcoal-900">{email}</p>
          </div>
          <div className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-charcoal-500">
              Role
            </p>
            <p className="mt-2 text-sm font-medium text-charcoal-900">Contractor</p>
          </div>
        </motion.section>

        <motion.section variants={itemVariants}>
          <h2 className="font-heading text-lg font-bold text-charcoal-950">
            Quick Links
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {QUICK_LINKS.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-2xl border border-charcoal-200/70 bg-white p-5 text-center shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
                  <Icon className="text-lg text-primary-500" />
                </div>
                <p className="font-heading text-sm font-semibold text-charcoal-950">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default Home;
