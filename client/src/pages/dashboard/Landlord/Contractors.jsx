import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MdEngineering, MdAdd, MdVisibility, MdBlock } from 'react-icons/md';
import Skeleton from '@components/ui/Skeleton';
import DeleteConfirmModal from '@components/ui/DeleteConfirmModal';
import { fetchContractors, revokeContractor, clearContractorError } from '@store/slices/contractorSlice';
import { fetchTickets } from '@store/slices/ticketSlice';
import InviteContractorModal from '@features/contractors/InviteContractorModal';
import ContractorDetailDrawer from '@features/contractors/ContractorDetailDrawer';

const STATUS_COLORS = {
  ACTIVE: 'bg-sage-100 text-sage-700',
  PENDING: 'bg-amber-100 text-amber-700',
  REVOKED: 'bg-charcoal-100 text-charcoal-500',
};

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-charcoal-200/70 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-1/2 rounded" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-3 w-2/3 rounded" />
      <div className="mt-3 flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-4 w-28 rounded" />
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  );
}

const Contractors = () => {
  const dispatch = useDispatch();
  const { contractors, isLoading, error, operationLoading } = useSelector((s) => s.contractors);
  const tickets = useSelector((s) => s.tickets.tickets);

  const [showInvite, setShowInvite] = useState(false);
  const [drawerLink, setDrawerLink] = useState(null);
  const [revokeTarget, setRevokeTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchContractors());
    dispatch(fetchTickets());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => dispatch(clearContractorError()), 6000);
      return () => clearTimeout(t);
    }
  }, [error, dispatch]);

  const activeJobCounts = useMemo(() => {
    const map = {};
    (tickets ?? []).forEach((t) => {
      if (['RESOLVED', 'CLOSED'].includes(t.status)) return;
      const cid = t.contractorId?._id || t.contractorId;
      if (!cid) return;
      map[cid] = (map[cid] || 0) + 1;
    });
    return map;
  }, [tickets]);

  return (
    <div className="px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-[0.35em] text-primary-500">
            Landlord
          </p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">Contractors</h1>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
        >
          <MdAdd className="text-lg" />
          Invite Contractor
        </button>
      </div>

      {isLoading ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (contractors ?? []).length === 0 ? (
        <div className="mt-16 flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50">
            <MdEngineering className="text-3xl text-primary-400" />
          </div>
          <h2 className="mt-4 font-heading text-xl font-bold text-charcoal-950">No contractors yet</h2>
          <p className="mt-1 font-body text-sm text-charcoal-500">
            Invite contractors to handle maintenance work on your properties.
          </p>
          <button
            onClick={() => setShowInvite(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            <MdAdd className="text-lg" />
            Invite Contractor
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(contractors ?? []).map((link) => {
            const c = link.contractorId;
            const cid = c?._id || c?.id;
            const activeJobs = activeJobCounts[cid] || 0;

            return (
              <div
                key={link._id || link.id}
                className="rounded-2xl border border-charcoal-200/70 bg-white shadow-sm"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 flex-1 truncate font-heading text-lg font-bold text-charcoal-950">
                      {c?.profile?.businessName || c?.name || 'Unknown'}
                    </h3>
                    {link.status && (
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${
                          STATUS_COLORS[link.status] || 'bg-charcoal-100 text-charcoal-600'
                        }`}
                      >
                        {link.status}
                      </span>
                    )}
                  </div>
                  {c?.email && (
                    <p className="mt-1 truncate font-body text-sm text-charcoal-500">{c.email}</p>
                  )}

                  {link.serviceCategories && link.serviceCategories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {link.serviceCategories.map((cat) => (
                        <span
                          key={cat}
                          className="rounded-full bg-charcoal-100 px-2.5 py-0.5 font-body text-[11px] font-medium text-charcoal-600"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 font-body text-sm text-charcoal-600">
                    <span className="font-semibold text-charcoal-900">{activeJobs}</span> active{' '}
                    {activeJobs === 1 ? 'job' : 'jobs'}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setDrawerLink(link)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-charcoal-200/90 bg-white px-3 py-2 font-heading text-xs font-semibold text-charcoal-700 transition-colors hover:bg-charcoal-50"
                    >
                      <MdVisibility className="text-sm" />
                      View Detail
                    </button>
                    <button
                      onClick={() => setRevokeTarget(link)}
                      disabled={link.status !== 'ACTIVE'}
                      className="flex items-center gap-1.5 rounded-xl border border-primary-200/90 bg-white px-3 py-2 font-heading text-xs font-semibold text-primary-500 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <MdBlock className="text-sm" />
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <InviteContractorModal isOpen={showInvite} onClose={() => setShowInvite(false)} />

      <ContractorDetailDrawer
        isOpen={!!drawerLink}
        link={drawerLink}
        onClose={() => setDrawerLink(null)}
        onRevoke={(linkId) => {
          dispatch(revokeContractor(linkId));
        }}
      />

      <DeleteConfirmModal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="Revoke Contractor"
        message={`Are you sure you want to revoke access for "${revokeTarget?.contractorId?.profile?.businessName || revokeTarget?.contractorId?.name}"? They will no longer have access to your properties.`}
        onConfirm={() => {
          if (revokeTarget) {
            dispatch(revokeContractor(revokeTarget._id || revokeTarget.id));
            setRevokeTarget(null);
          }
        }}
      />
    </div>
  );
};

export default Contractors;