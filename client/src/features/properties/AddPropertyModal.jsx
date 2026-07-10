import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Modal from '@components/ui/Modal';
import { createProperty } from '@store/slices/propertySlice';

const schema = z.object({
  name: z.string().trim().min(1, 'Property name is required').max(200),
  street: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  state: z.string().trim().max(100).optional().or(z.literal('')),
});

const inputClass =
  'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const AddPropertyModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { operationLoading } = useSelector((s) => s.properties);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', street: '', city: '', state: '' },
  });

  const onSubmit = async (data) => {
    setServerError('');
    const filtered = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== '')
    );
    try {
      await dispatch(createProperty(filtered)).unwrap();
      onClose();
    } catch (err) {
      setServerError(err || 'Failed to create property');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Property">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600">
            Property Name
          </label>
          <input {...register('name')} className={inputClass} placeholder="e.g. Sunset Apartments" />
          {errors.name && (
            <p className="mt-1 font-body text-xs text-primary-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600">
            Street
          </label>
          <input {...register('street')} className={inputClass} placeholder="123 Main St" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600">
              City
            </label>
            <input {...register('city')} className={inputClass} placeholder="City" />
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600">
              State
            </label>
            <input {...register('state')} className={inputClass} placeholder="State" />
          </div>
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
            {operationLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddPropertyModal;