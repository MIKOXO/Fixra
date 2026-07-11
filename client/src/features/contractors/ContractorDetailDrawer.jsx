import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdBusiness } from 'react-icons/md';
import { format } from 'date-fns';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';

const STATUS_COLORS = {
  ACTIVE: 'bg-sage-100 text-sage-700',
  PENDING: 'bg-amber-100 text-amber-700',
  REVOKED: 'bg-charcoal-100 text-charcoal-500',
};

const ContractorDetailDrawer = ({ isOpen, link, onClose, onRevoke }) => {
  const tickets = useSelector((s) => s.tickets.tickets);
  const [showRevoke, setShowRevoke] = useState(false);

  const contractor = link?.contractorId;

  const activeJobs = useMemo(
    () =>
      (tickets ?? []).filter((t) => {
        const cid = t.contractorId?._id || t.contractorId;
        return cid && cid === (contractor?._id || contractor?.id) && !['RESOLVED', 'CLOSED'].includes(t.status);
      }).length,
    [tickets, contractor]
  );

  const completedJobs = useMemo(
    () =>
      (tickets ?? []).filter((t) => {
        const cid = t.contractorId?._id || t.contractorId;
        return cid && cid === (contractor?._id || contractor?.id) && ['RESOLVED', 'CLOSED'].includes(t.status);
      }).length,
    [tickets, contractor]
  );

  const avgResolutionHours = useMemo(() => {
    const resolved = (tickets ?? []).filter((t) => {
      const cid = t.contractorId?._id || t.contractorId;
      if (!cid || cid !== (contractor?._id || contractor?.id)) return false;
      if (t.status !== 'RESOLVED') return false;
      return t.resolvedAt || t.updatedAt;
    });
    if (resolved.length === 0) return null;
    const totalHours = resolved.reduce((sum, t) => {
      const created = new Date(t.createdAt).getTime();
      const resolvedAt = new Date(t.resolvedAt || t.updatedAt).getTime();
      return sum + (resolvedAt - created) / (1000 * 60 * 60);
    }, 0);
    return (totalHours / resolved.length).toFixed(1);
  }, [tickets, contractor]);

  const handleClose = () => {
    setShowRevoke(false);
    onClose?.();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="cd-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={handleClose}
            />
            <motion.div
              key="cd-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-white shadow-xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-charcoal-100 px-6 py-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3 pr-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
                      <MdBusiness className="text-lg text-primary-500" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-heading text-lg font-bold text-charcoal-950">
                        {contractor?.profile?.businessName || contractor?.name || 'Contractor'}
                      </h2>
                      {link?.status && (
                        <span
                          className={`mt-0.5 inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${STATUS_COLORS[link.status] || 'bg-charcoal-100 text-charcoal-600'}`}
                        >
                          {link.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-charcoal-400 transition-colors hover:bg-charcoal-100 hover:text-charcoal-700"
                  >
                    <MdClose className="text-lg" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  <div className="space-y-6">
                    {contractor?.email && (
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Email
                        </h3>
                        <p className="mt-1 font-body text-sm text-charcoal-700">{contractor.email}</p>
                      </div>
                    )}

                    {link?.joinedAt && (
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Linked Since
                        </h3>
                        <p className="mt-1 font-body text-sm text-charcoal-700">
                          {format(new Date(link.joinedAt), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    )}

                    {link?.serviceCategories && link.serviceCategories.length > 0 && (
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Service Categories
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {link.serviceCategories.map((cat) => (
                            <span
                              key={cat}
                              className="rounded-full bg-charcoal-100 px-3 py-1 font-body text-xs font-medium text-charcoal-600"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                        Performance
                      </h3>
                      <div className="mt-2 grid grid-cols-3 gap-4">
                        <div className="rounded-xl border border-charcoal-100 bg-charcoal-50/50 px-4 py-3 text-center">
                          <p className="font-heading text-xl font-bold text-charcoal-950">
                            {activeJobs}
                          </p>
                          <p className="font-body text-[11px] text-charcoal-500">Active Jobs</p>
                        </div>
                        <div className="rounded-xl border border-charcoal-100 bg-charcoal-50/50 px-4 py-3 text-center">
                          <p className="font-heading text-xl font-bold text-charcoal-950">
                            {completedJobs}
                          </p>
                          <p className="font-body text-[11px] text-charcoal-500">Completed</p>
                        </div>
                        <div className="rounded-xl border border-charcoal-100 bg-charcoal-50/50 px-4 py-3 text-center">
                          <p className="font-heading text-xl font-bold text-charcoal-950">
                            {avgResolutionHours ?? '—'}
                          </p>
                          <p className="font-body text-[11px] text-charcoal-500">Avg Hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-charcoal-100 px-6 py-4">
                  <button
                    onClick={() => setShowRevoke(true)}
                    className="w-full rounded-xl border border-primary-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-primary-500 transition-colors hover:bg-primary-50"
                  >
                    Revoke Access
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DeleteConfirmModal
        isOpen={showRevoke}
        onClose={() => setShowRevoke(false)}
        title="Revoke Contractor"
        message={`Are you sure you want to revoke access for "${contractor?.profile?.businessName || contractor?.name}"? They will no longer have access to your properties.`}
        onConfirm={() => {
          setShowRevoke(false);
          onRevoke?.(link?._id || link?.id);
        }}
      />
    </>
  );
};

export default ContractorDetailDrawer;