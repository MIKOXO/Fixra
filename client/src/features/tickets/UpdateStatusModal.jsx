import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@components/ui/Modal';
import Select from '@components/ui/Select';
import { transitionTicketStatus, addTicketNote } from '@store/slices/ticketSlice';

const STATUS_OPTIONS = [{ value: 'PENDING_REVIEW', label: 'Pending Review' }];

const textareaClass =
  'w-full rounded-xl border border-charcoal-200/90 bg-white px-3.5 py-2.5 font-body text-sm text-charcoal-700 outline-none transition duration-200 placeholder:text-charcoal-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const UpdateStatusModal = ({ isOpen, ticketId, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { operationLoading } = useSelector((s) => s.tickets);
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) return;
    setError('');
    try {
      await dispatch(
        transitionTicketStatus({ id: ticketId, data: { status } })
      ).unwrap();
      if (note.trim()) {
        await dispatch(
          addTicketNote({ id: ticketId, data: { text: note.trim() } })
        ).unwrap();
      }
      setNote('');
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err || 'Failed to update status');
    }
  };

  const handleClose = () => {
    setNote('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update Status">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-[0.06em] text-charcoal-500">
            New Status
          </label>
          <Select
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            placeholder="Select status..."
          />
        </div>

        <div>
          <label className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-[0.06em] text-charcoal-500">
            Progress Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe the work completed or current status..."
            rows={4}
            className={textareaClass}
          />
        </div>

        {error && (
          <p className="font-body text-xs text-primary-500">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!status || operationLoading}
            className="flex-1 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
          >
            {operationLoading ? 'Updating...' : 'Update Status'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={operationLoading}
            className="flex-1 rounded-xl border border-charcoal-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900 transition-colors hover:bg-charcoal-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateStatusModal;
