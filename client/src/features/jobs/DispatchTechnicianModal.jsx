import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@components/ui/Modal';
import Select from '@components/ui/Select';
import { fetchTechnicians, dispatchTechnician, fetchContractorJobs } from '@store/slices/jobSlice';

const DispatchTechnicianModal = ({ isOpen, onClose, ticket, jobId }) => {
  const dispatch = useDispatch();
  const { technicians, techniciansLoading, dispatchSubmitting } = useSelector((s) => s.jobs);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchTechnicians());
      setSelectedTechnician('');
      setError('');
    }
  }, [isOpen, dispatch]);

  const techOptions = [
    { value: '', label: 'Select a technician...' },
    ...(technicians ?? [])
      .filter((tech) => tech.isAvailable !== false)
      .map((tech) => ({
        value: tech._id || tech.id,
        label: tech.name || tech.email || 'Unnamed',
      })),
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTechnician) {
      setError('Please select a technician');
      return;
    }
    setError('');
    try {
      await dispatch(
        dispatchTechnician({
          jobId,
          technicianId: selectedTechnician,
        })
      ).unwrap();
      dispatch(fetchContractorJobs());
      setSelectedTechnician('');
      onClose();
    } catch (err) {
      setError(err || 'Failed to dispatch technician');
    }
  };

  const handleClose = () => {
    setSelectedTechnician('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Dispatch Technician">
      <form onSubmit={handleSubmit} className="space-y-4">
        {ticket && (
          <div className="rounded-xl bg-charcoal-50/50 px-4 py-3">
            <p className="font-body text-xs text-charcoal-500">Dispatching for</p>
            <p className="mt-0.5 truncate font-body text-sm font-medium text-charcoal-900">
              {ticket.title}
            </p>
          </div>
        )}

        <Select
          value={selectedTechnician}
          onChange={setSelectedTechnician}
          options={techOptions}
          placeholder={techniciansLoading ? 'Loading technicians...' : 'Select a technician...'}
        />

        {!techniciansLoading && technicians.length === 0 && (
          <p className="font-body text-xs text-charcoal-400">
            No technicians available. Add technicians first.
          </p>
        )}

        {error && <p className="font-body text-xs text-primary-500">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={dispatchSubmitting || !selectedTechnician}
            className="flex-1 rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
          >
            {dispatchSubmitting ? 'Dispatching...' : 'Dispatch'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={dispatchSubmitting}
            className="flex-1 rounded-xl border border-charcoal-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900 transition-colors hover:bg-charcoal-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default DispatchTechnicianModal;
