import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Modal from '@components/ui/Modal';
import { addUnit } from '@store/slices/propertySlice';

const schema = z.object({
  unitNumber: z.string().trim().min(1, 'Unit number is required').max(50),
});

const inputClass =
  'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const AddUnitModal = ({ isOpen, onClose, propertyId }) => {
  const dispatch = useDispatch();
  const { operationLoading } = useSelector((s) => s.properties);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { unitNumber: '' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      await dispatch(addUnit({ propertyId, data })).unwrap();
      reset();
      onClose();
    } catch (err) {
      setServerError(err || 'Failed to add unit');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Unit">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600">
            Unit Number
          </label>
          <input
            {...register('unitNumber')}
            className={inputClass}
            placeholder="e.g. 2A, 101, Penthouse"
          />
          {errors.unitNumber && (
            <p className="mt-1 font-body text-xs text-primary-500">{errors.unitNumber.message}</p>
          )}
        </div>
        {serverError && (
          <p className="font-body text-xs text-primary-500">{serverError}</p>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-charcoal-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900 transition-colors hover:bg-charcoal-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={operationLoading}
            className="rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
          >
            {operationLoading ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUnitModal;