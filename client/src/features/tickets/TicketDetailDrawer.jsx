import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdImage, MdVideocam, MdSend } from 'react-icons/md';
import { format, formatDistanceToNow } from 'date-fns';
import { fetchTicketById, transitionTicketStatus, addTicketNote, clearCurrentTicket } from '@store/slices/ticketSlice';
import { approveEstimate, getJobByTicket } from '@services/job.api';
import { rejectResolution as rejectResolutionApi } from '@services/ticket.api';

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

const inputClass =
  'w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const TicketDetailDrawer = ({ isOpen, ticketId, onAssign, onClose, userRole, onSubmitEstimate, onDispatchTechnician }) => {
  const dispatch = useDispatch();
  const { currentTicket, currentTicketLoading, operationLoading } = useSelector((s) => s.tickets);
  const [noteText, setNoteText] = useState('');
  const [approveLoading, setApproveLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [currentJob, setCurrentJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);

  const t = currentTicket;

  useEffect(() => {
    if (!isOpen || !t?.jobId || userRole !== 'CONTRACTOR') {
      setCurrentJob(null);
      return;
    }
    let cancelled = false;
    setJobLoading(true);
    getJobByTicket(ticketId)
      .then((res) => {
        if (!cancelled) setCurrentJob(res.job || res.data || res);
      })
      .catch(() => {
        if (!cancelled) setCurrentJob(null);
      })
      .finally(() => {
        if (!cancelled) setJobLoading(false);
      });
    return () => { cancelled = true; };
  }, [isOpen, t?.jobId, ticketId, userRole]);

  const handleTriage = async () => {
    try {
      await dispatch(transitionTicketStatus({ id: ticketId, data: { status: 'TRIAGED' } })).unwrap();
      dispatch(fetchTicketById(ticketId));
    } catch (e) {
      setLocalError(e || 'Failed to triage');
    }
  };

  const handleClose = async () => {
    try {
      await dispatch(transitionTicketStatus({ id: ticketId, data: { status: 'CLOSED' } })).unwrap();
      dispatch(fetchTicketById(ticketId));
    } catch (e) {
      setLocalError(e || 'Failed to close');
    }
  };

  const handleApproveEstimate = async () => {
    if (!t?.jobId) return;
    setApproveLoading(true);
    setLocalError('');
    try {
      await approveEstimate(t.jobId);
      dispatch(fetchTicketById(ticketId));
    } catch (e) {
      setLocalError(e?.response?.data?.message || e?.message || 'Failed to approve estimate');
    } finally {
      setApproveLoading(false);
    }
  };

  const handleConfirmResolution = async () => {
    setLocalError('');
    try {
      await dispatch(transitionTicketStatus({ id: ticketId, data: { status: 'RESOLVED' } })).unwrap();
      dispatch(fetchTicketById(ticketId));
    } catch (e) {
      setLocalError(e || 'Failed to confirm resolution');
    }
  };

  const handleRejectResolution = async () => {
    if (!rejectReason.trim()) return;
    setLocalError('');
    try {
      await rejectResolutionApi(ticketId, { reason: rejectReason.trim() });
      dispatch(fetchTicketById(ticketId));
      setRejectOpen(false);
      setRejectReason('');
    } catch (e) {
      setLocalError(e?.response?.data?.message || e?.message || 'Failed to reject resolution');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setLocalError('');
    try {
      await dispatch(addTicketNote({ id: ticketId, data: { text: noteText.trim() } })).unwrap();
      setNoteText('');
    } catch (e) {
      setLocalError(e || 'Failed to add note');
    }
  };

  const handleCloseDrawer = () => {
    dispatch(clearCurrentTicket());
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={handleCloseDrawer}
          />
          <motion.div
            key="drawer-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-[560px] bg-white shadow-xl"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-charcoal-100 px-6 py-4">
                <div className="min-w-0 flex-1 pr-4">
                  {currentTicketLoading ? (
                    <div className="h-5 w-3/4 animate-pulse rounded bg-charcoal-200/60" />
                  ) : (
                    <>
                      <h2 className="truncate font-heading text-lg font-bold text-charcoal-950">
                        {t?.title || 'Ticket'}
                      </h2>
                      {t?.status && (
                        <span
                          className={`mt-1 inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${STATUS_COLORS[t.status] || 'bg-charcoal-100 text-charcoal-600'}`}
                        >
                          {t.status}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <button
                  onClick={handleCloseDrawer}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-charcoal-400 transition-colors hover:bg-charcoal-100 hover:text-charcoal-700"
                >
                  <MdClose className="text-lg" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {currentTicketLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 w-full animate-pulse rounded bg-charcoal-200/60" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-charcoal-200/60" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-charcoal-200/60" />
                  </div>
                ) : t ? (
                  <div className="space-y-6">
                    {t.description && (
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Description
                        </h3>
                        <p className="mt-1.5 font-body text-sm leading-relaxed text-charcoal-700">
                          {t.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Category
                        </h3>
                        <span
                          className={`mt-1 inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${CATEGORY_COLORS[t.category] || 'bg-charcoal-100 text-charcoal-600'}`}
                        >
                          {t.category}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Priority
                        </h3>
                        <span
                          className={`mt-1 inline-block rounded-full px-2.5 py-0.5 font-body text-[11px] font-semibold ${PRIORITY_COLORS[t.priority] || 'bg-charcoal-100 text-charcoal-600'}`}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Property
                        </h3>
                        <p className="mt-1 font-body text-sm text-charcoal-700">
                          {t.propertyId?.name || t.propertyName || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Unit
                        </h3>
                        <p className="mt-1 font-body text-sm text-charcoal-700">
                          {t.unitNumber || t.unitId || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Tenant
                        </h3>
                        <p className="mt-1 font-body text-sm text-charcoal-700">
                          {t.tenantId?.name || t.tenantName || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Created
                        </h3>
                        <p className="mt-1 font-body text-sm text-charcoal-700">
                          {t.createdAt ? formatDistanceToNow(new Date(t.createdAt), { addSuffix: true }) : '-'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Contractor
                        </h3>
                        <p className="mt-1 font-body text-sm text-charcoal-700">
                          {t.contractorId?.name || '-'}
                        </p>
                      </div>
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Technician
                        </h3>
                        <p className="mt-1 font-body text-sm text-charcoal-700">
                          {t.technicianId?.name || '-'}
                        </p>
                      </div>
                    </div>

                    {userRole === 'CONTRACTOR' && t.jobId && (
                      <div className="rounded-xl border border-charcoal-100 bg-charcoal-50/50 p-4">
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Job Estimate
                        </h3>
                        {jobLoading ? (
                          <div className="mt-2 space-y-2">
                            <div className="h-4 w-1/2 animate-pulse rounded bg-charcoal-200/60" />
                            <div className="h-4 w-1/3 animate-pulse rounded bg-charcoal-200/60" />
                          </div>
                        ) : currentJob ? (
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-body text-xs text-charcoal-500">Estimated Cost</span>
                              <span className="font-body text-sm font-semibold text-charcoal-900">
                                ${currentJob.estimatedCost?.toLocaleString() ?? '-'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="font-body text-xs text-charcoal-500">Approval</span>
                              <span
                                className={`rounded-full px-2 py-0.5 font-body text-[11px] font-semibold ${
                                  currentJob.approvalStatus === 'APPROVED'
                                    ? 'bg-sage-100 text-sage-700'
                                    : currentJob.approvalStatus === 'REJECTED'
                                      ? 'bg-primary-100 text-primary-700'
                                      : 'bg-amber-100 text-amber-700'
                                }`}
                              >
                                {currentJob.approvalStatus || 'PENDING'}
                              </span>
                            </div>
                            {currentJob.technicianId && (
                              <div className="flex items-center justify-between">
                                <span className="font-body text-xs text-charcoal-500">Assigned To</span>
                                <span className="font-body text-sm text-charcoal-700">
                                  {currentJob.technicianId?.name || '-'}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="mt-2 font-body text-xs text-charcoal-400">Job details unavailable.</p>
                        )}
                      </div>
                    )}

                    {t.attachments && t.attachments.length > 0 && (
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Attachments ({t.attachments.length})
                        </h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {t.attachments.map((att, i) => {
                            const isVideo = att.type?.startsWith('video') || att.url?.match(/\.(mp4|webm|mov)$/i);
                            return (
                              <a
                                key={i}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 rounded-lg border border-charcoal-200/70 bg-charcoal-50 px-3 py-2 font-body text-xs text-charcoal-600 transition-colors hover:bg-charcoal-100"
                              >
                                {isVideo ? (
                                  <MdVideocam className="text-sm text-primary-500" />
                                ) : (
                                  <MdImage className="text-sm text-sage-500" />
                                )}
                                <span className="truncate max-w-[120px]">{att.type || 'file'}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {t.auditTrail && t.auditTrail.length > 0 && (
                      <div>
                        <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                          Audit Trail
                        </h3>
                        <div className="mt-2 space-y-3">
                          {t.auditTrail.map((entry, i) => (
                            <div key={i} className="relative pl-5">
                              <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full border-2 border-primary-400 bg-white" />
                              {i < t.auditTrail.length - 1 && (
                                <div className="absolute left-[3px] top-[14px] h-full w-px bg-charcoal-200" />
                              )}
                              <div className="font-body text-xs text-charcoal-600">
                                <span className="font-semibold text-charcoal-800">
                                  {entry.actorId?.name || 'System'}
                                </span>{' '}
                                changed status from{' '}
                                <span className="font-medium text-charcoal-700">
                                  {entry.fromStatus || '—'}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium text-charcoal-700">{entry.toStatus}</span>
                              </div>
                              {entry.reason && (
                                <p className="mt-0.5 font-body text-[11px] text-charcoal-500">
                                  Reason: {entry.reason}
                                </p>
                              )}
                              <p className="font-body text-[11px] text-charcoal-400">
                                {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-500">
                        Notes
                      </h3>
                      {t.notes && t.notes.length > 0 ? (
                        <div className="mt-2 space-y-3">
                          {[...t.notes].reverse().map((note, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-charcoal-100 bg-charcoal-50/50 px-4 py-3"
                            >
                              <p className="font-body text-sm text-charcoal-700">{note.text}</p>
                              <p className="mt-1 font-body text-[11px] text-charcoal-400">
                                {note.addedBy?.name || 'System'} —{' '}
                                {note.createdAt
                                  ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })
                                  : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 font-body text-sm text-charcoal-400">No notes yet.</p>
                      )}

                      <form onSubmit={handleAddNote} className="mt-3 flex items-end gap-2">
                        <div className="flex-1">
                          <input
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            className={inputClass}
                            placeholder="Add a note..."
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!noteText.trim() || operationLoading}
                          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                        >
                          <MdSend className="text-lg" />
                        </button>
                      </form>
                    </div>

                    {localError && (
                      <p className="font-body text-xs text-primary-500">{localError}</p>
                    )}
                  </div>
                ) : null}
              </div>

              {t && !currentTicketLoading && (
                <div className="flex items-center gap-3 border-t border-charcoal-100 px-6 py-4">
                  {t.status === 'REPORTED' && userRole !== 'CONTRACTOR' && (
                    <button
                      onClick={handleTriage}
                      disabled={operationLoading}
                      className="flex-1 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
                    >
                      {operationLoading ? 'Triage...' : 'Triage'}
                    </button>
                  )}
                  {t.status === 'TRIAGED' && userRole !== 'CONTRACTOR' && (
                    <button
                      onClick={() => {
                        handleCloseDrawer();
                        onAssign?.(ticketId);
                      }}
                      disabled={operationLoading}
                      className="flex-1 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
                    >
                      Assign Contractor
                    </button>
                  )}
                  {userRole === 'CONTRACTOR' && t.status === 'ASSIGNED' && !t.jobId && (
                    <button
                      onClick={() => {
                        handleCloseDrawer();
                        onSubmitEstimate?.(t);
                      }}
                      className="flex-1 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                    >
                      Submit Estimate
                    </button>
                  )}
                  {userRole === 'CONTRACTOR' && t.status === 'ASSIGNED' && !!t.jobId && (
                    <p className="w-full text-center font-body text-xs text-charcoal-400">
                      Awaiting landlord approval
                    </p>
                  )}
                  {userRole === 'CONTRACTOR' && t.status === 'IN_PROGRESS' && t.jobId && !currentJob?.technicianId && (
                    <button
                      onClick={() => {
                        handleCloseDrawer();
                        onDispatchTechnician?.(t);
                      }}
                      className="flex-1 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                    >
                      Dispatch Technician
                    </button>
                  )}
                  {userRole === 'CONTRACTOR' && t.status === 'IN_PROGRESS' && currentJob?.technicianId && (
                    <p className="w-full text-center font-body text-xs text-charcoal-400">
                      Technician assigned — work in progress
                    </p>
                  )}
                  {t.status === 'PENDING_REVIEW' && userRole === 'TENANT' && (
                    <div className="flex w-full flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleConfirmResolution}
                          disabled={operationLoading}
                          className="flex-1 rounded-xl bg-sage-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-sage-600 disabled:opacity-60"
                        >
                          {operationLoading ? 'Confirming...' : 'Confirm Resolution'}
                        </button>
                        <button
                          onClick={() => setRejectOpen(true)}
                          disabled={operationLoading}
                          className="flex-1 rounded-xl border border-primary-200/80 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-60"
                        >
                          Reject Resolution
                        </button>
                      </div>
                      {rejectOpen && (
                        <div className="space-y-2 rounded-xl border border-charcoal-200/70 bg-charcoal-50/50 p-3">
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Reason for rejecting this resolution..."
                            rows={3}
                            className="w-full rounded-lg border border-charcoal-200/80 bg-white px-3 py-2 font-body text-sm text-charcoal-700 outline-none transition placeholder:text-charcoal-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleRejectResolution}
                              disabled={!rejectReason.trim() || operationLoading}
                              className="rounded-lg bg-primary-500 px-4 py-1.5 font-heading text-xs font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                            >
                              {operationLoading ? 'Submitting...' : 'Submit'}
                            </button>
                            <button
                              onClick={() => { setRejectOpen(false); setRejectReason(''); }}
                              disabled={operationLoading}
                              className="rounded-lg border border-charcoal-200/70 bg-white px-4 py-1.5 font-body text-xs font-medium text-charcoal-600 transition-colors hover:bg-charcoal-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {t.status === 'PENDING_REVIEW' && userRole !== 'TENANT' && userRole !== 'CONTRACTOR' && (
                    <>
                      {t.jobId && (
                        <button
                          onClick={handleApproveEstimate}
                          disabled={approveLoading}
                          className="flex-1 rounded-xl bg-sage-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-sage-600 disabled:opacity-60"
                        >
                          {approveLoading ? 'Approving...' : 'Approve Estimate'}
                        </button>
                      )}
                      <button
                        onClick={handleClose}
                        disabled={operationLoading}
                        className="flex-1 rounded-xl border border-charcoal-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900 transition-colors hover:bg-charcoal-50 disabled:opacity-60"
                      >
                        {operationLoading ? 'Closing...' : 'Close'}
                      </button>
                    </>
                  )}
                  {!['REPORTED', 'TRIAGED', 'PENDING_REVIEW', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status) && (
                    <p className="w-full text-center font-body text-xs text-charcoal-400">
                      No actions available
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TicketDetailDrawer;