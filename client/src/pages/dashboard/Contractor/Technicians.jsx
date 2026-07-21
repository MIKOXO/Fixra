import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MdAdd, MdPeople } from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import { fetchTechnicians, toggleAvailability, removeTechnician, clearTechnicianError } from '@store/slices/technicianSlice';
import InviteTechnicianModal from '@features/technicians/InviteTechnicianModal';

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.08,
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
    <div className="space-y-8" aria-busy="true" aria-label="Loading technicians">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-2/5 rounded" />
              <Skeleton className="h-5 w-9 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-3 w-3/5 rounded" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-4 w-28 rounded" />
            <div className="mt-4 flex items-center justify-between gap-3">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Technicians = () => {
  const dispatch = useDispatch();
  const { technicians, isLoading, error, operationLoading } = useSelector((s) => s.technicians);
  const jobs = useSelector((s) => s.jobs.jobs);

  const [showInvite, setShowInvite] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchTechnicians());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearTechnicianError()), 6000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const activeJobCounts = (jobs ?? []).reduce((map, job) => {
    if (['RESOLVED', 'CLOSED'].includes(job.status)) return map;
    const tid = job.technicianId?._id || job.technicianId;
    if (!tid) return map;
    map[tid] = (map[tid] || 0) + 1;
    return map;
  }, {});

  return (
    <div className="px-6 py-8">
      {isLoading ? (
        <PageSkeleton />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-x-6 gap-y-6"
        >
          {/* Header row */}
          <motion.div variants={itemVariants} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
                Contractor
              </p>
              <h1 className="mt-1 font-heading text-2xl font-bold text-charcoal-950">Technicians</h1>
              <p className="mt-1 font-body text-sm text-charcoal-500">
                Manage your team and their availability.
              </p>
            </div>
            <button
              onClick={() => setShowInvite(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              <MdAdd className="text-lg" />
              Invite Technician
            </button>
          </motion.div>

          {error ? (
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 rounded-2xl border border-primary-200/60 bg-primary-50/60 px-5 py-4">
                <span className="font-body text-sm text-primary-700">
                  Failed to load technicians.{' '}
                  <button
                    onClick={() => dispatch(fetchTechnicians())}
                    className="ml-1 font-semibold underline underline-offset-2 hover:text-primary-800"
                  >
                    Retry
                  </button>
                </span>
              </div>
            </motion.div>
          ) : (technicians ?? []).length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
                <MdPeople className="text-3xl text-primary-400" />
              </div>
              <h2 className="mt-4 font-heading text-xl font-bold text-charcoal-950">No technicians yet</h2>
              <p className="mt-1 font-body text-sm text-charcoal-500">
                Invite technicians to your team to dispatch them on jobs.
              </p>
              <button
                onClick={() => setShowInvite(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
              >
                <MdAdd className="text-lg" />
                Invite Technician
              </button>
            </motion.div>
          ) : (
            <>
              {(technicians ?? []).map((tech) => {
                const id = tech._id || tech.id;
                const isAvailable = tech.profile?.isAvailable !== false;
                const activeJobs = activeJobCounts[id] || 0;
                const specializations = tech.profile?.specializations ?? [];

                return (
                  <motion.div
                    key={id}
                    variants={itemVariants}
                    className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="min-w-0 flex-1 truncate font-heading text-base font-bold text-charcoal-950">
                        {tech.name || tech.email}
                      </h3>
                      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={isAvailable}
                          onChange={() => dispatch(toggleAvailability({ id, isAvailable: !isAvailable }))}
                        />
                        <div className="h-5 w-9 rounded-full bg-charcoal-200 transition-colors peer-checked:bg-sage-500 peer-focus:ring-2 peer-focus:ring-sage-300" />
                        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                      </label>
                    </div>

                    {tech.email && tech.name && (
                      <p className="mt-0.5 truncate font-body text-xs text-charcoal-400">{tech.email}</p>
                    )}

                    {specializations.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {specializations.map((s) => (
                          <span
                            key={s}
                            className="rounded-full bg-charcoal-100 px-2.5 py-0.5 font-body text-[11px] font-medium text-charcoal-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-3 font-body text-sm text-charcoal-600">
                      <span className="font-semibold text-charcoal-900">{activeJobs}</span> active{' '}
                      {activeJobs === 1 ? 'job' : 'jobs'}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                          isAvailable ? 'bg-sage-100 text-sage-700' : 'bg-charcoal-100 text-charcoal-500'
                        }`}
                      >
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <button
                        onClick={() => setDeactivateTarget(tech)}
                        disabled={operationLoading}
                        className="rounded-xl border border-primary-200/90 bg-white px-3 py-1.5 font-heading text-xs font-semibold text-primary-500 transition-colors hover:bg-primary-50 disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </motion.div>
      )}

      <InviteTechnicianModal isOpen={showInvite} onClose={() => setShowInvite(false)} />

      <DeleteConfirmModal
        isOpen={!!deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
        title="Deactivate Technician"
        message={`Are you sure you want to deactivate "${deactivateTarget?.name || deactivateTarget?.email}"? They will lose access to the platform.`}
        onConfirm={() => {
          dispatch(removeTechnician(deactivateTarget._id || deactivateTarget.id));
          setDeactivateTarget(null);
        }}
      />
    </div>
  );
};

export default Technicians;
