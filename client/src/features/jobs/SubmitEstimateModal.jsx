import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@components/ui/Modal';
import NumberInput from '@components/ui/NumberInput';
import { createEstimate, fetchContractorJobs } from '@store/slices/jobSlice';

const SubmitEstimateModal = ({ isOpen, onClose, ticket }) => {
  const dispatch = useDispatch();
  const { estimateSubmitting } = useSelector((s) => s.jobs);
  const [estimatedCost, setEstimatedCost] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!estimatedCost || Number(estimatedCost) <= 0) {
      setError('Please enter a valid estimated cost');
      return;
    }
    setError('');
    try {
      await dispatch(
        createEstimate({
          ticketId: ticket?._id || ticket?.id,
          estimatedCost: Number(estimatedCost),
        })
      ).unwrap();
      dispatch(fetchContractorJobs());
      setEstimatedCost('');
      onClose();
    } catch (err) {
      setError(err || 'Failed to submit estimate');
    }
  };

  const handleClose = () => {
    setEstimatedCost('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Submit Estimate">
      <form onSubmit={handleSubmit} className="space-y-4">
        {ticket && (
          <div className="rounded-xl bg-charcoal-50/50 px-4 py-3">
            <p className="font-body text-xs text-charcoal-500">Estimate for</p>
            <p className="mt-0.5 truncate font-body text-sm font-medium text-charcoal-900">
              {ticket.title}
            </p>
          </div>
        )}

        <NumberInput
          label="Estimated Cost"
          name="estimatedCost"
          prefix="$"
          min={0}
          required
          value={estimatedCost}
          onChange={(e) => setEstimatedCost(e.target.value)}
          placeholder="0.00"
        />

        {error && <p className="font-body text-xs text-primary-500">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={estimateSubmitting}
            className="flex-1 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
          >
            {estimateSubmitting ? 'Submitting...' : 'Submit Estimate'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={estimateSubmitting}
            className="flex-1 rounded-xl border border-charcoal-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900 transition-colors hover:bg-charcoal-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SubmitEstimateModal;
