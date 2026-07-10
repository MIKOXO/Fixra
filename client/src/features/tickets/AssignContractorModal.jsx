import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@components/ui/Modal';
import { getContractors } from '@services/contractor.api';
import { transitionTicketStatus } from '@store/slices/ticketSlice';

const selectClass =
  'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const AssignContractorModal = ({ isOpen, onClose, ticketId }) => {
  const dispatch = useDispatch();
  const { operationLoading } = useSelector((s) => s.tickets);
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError('');
    setSelected('');
    getContractors()
      .then((res) => {
        const links = res.data || [];
        setContractors(links);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || err?.message || 'Failed to load contractors');
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selected) return;
    setError('');
    try {
      await dispatch(
        transitionTicketStatus({ id: ticketId, data: { status: 'ASSIGNED', contractorId: selected } })
      ).unwrap();
      onClose();
    } catch (err) {
      setError(err || 'Failed to assign');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Contractor">
      {loading ? (
        <p className="font-body text-sm text-charcoal-500">Loading contractors...</p>
      ) : error && contractors.length === 0 ? (
        <div>
          <p className="font-body text-sm text-primary-500">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 rounded-xl border border-charcoal-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900"
          >
            Close
          </button>
        </div>
      ) : contractors.length === 0 ? (
        <div>
          <p className="font-body text-sm text-charcoal-600">
            No linked contractors found. Please link a contractor first.
          </p>
          <button
            onClick={onClose}
            className="mt-4 rounded-xl border border-charcoal-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600">
              Select Contractor
            </label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className={selectClass}
            >
              <option value="">Choose a contractor...</option>
              {contractors.map((link) => {
                const c = link.contractorId;
                return (
                  <option key={link._id} value={c._id || c.id}>
                    {c.name}
                    {c.profile?.businessName ? ` — ${c.profile.businessName}` : ''}
                  </option>
                );
              })}
            </select>
          </div>
          {error && <p className="font-body text-xs text-primary-500">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-charcoal-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900 transition-colors hover:bg-charcoal-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selected || operationLoading}
              className="rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
            >
              {operationLoading ? 'Assigning...' : 'Assign'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default AssignContractorModal;