import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MdCopyAll, MdCheck } from 'react-icons/md';
import Modal from '@components/ui/Modal';
import { inviteContractor } from '@store/slices/contractorSlice';

const CATEGORIES = ['PLUMBING', 'ELECTRICAL', 'STRUCTURAL', 'APPLIANCE', 'HVAC', 'OTHER'];

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

const inputClass =
  'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const InviteContractorModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState('form');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const onSubmit = async ({ email }) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await dispatch(
        inviteContractor({ role: 'CONTRACTOR', email, meta: { serviceCategories: selectedCategories } })
      ).unwrap();
      const link = `${window.location.origin}/register/invite?token=${res.token}`;
      setInviteLink(link);
      setStep('link');
    } catch (err) {
      setServerError(err?.response?.data?.message || err?.message || 'Failed to generate invite');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.querySelector('#contractor-invite-link');
      if (el) el.select();
    }
  };

  const handleClose = () => {
    setStep('form');
    setInviteLink('');
    setCopied(false);
    setSelectedCategories([]);
    setServerError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Contractor">
      {step === 'form' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600">
              Contractor Email
            </label>
            <input
              {...register('email')}
              className={inputClass}
              placeholder="contractor@example.com"
              type="email"
            />
            {errors.email && (
              <p className="mt-1 font-body text-xs text-primary-500">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600">
              Service Categories
            </label>
            <p className="mt-0.5 font-body text-[11px] text-charcoal-400">
              Select the categories this contractor can handle.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const selected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full px-3 py-1.5 font-heading text-xs font-semibold transition-colors ${
                      selected
                        ? 'bg-primary-500 text-white'
                        : 'border border-charcoal-200/90 bg-white text-charcoal-600 hover:border-primary-300'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
          {serverError && (
            <p className="font-body text-xs text-primary-500">{serverError}</p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-charcoal-200/90 bg-white px-5 py-2.5 font-heading text-sm font-semibold text-charcoal-900 transition-colors hover:bg-charcoal-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
            >
              {loading ? 'Generating...' : 'Generate Invite'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="font-body text-sm text-charcoal-600">
            Share this link with the contractor to complete registration:
          </p>
          <div className="flex items-center gap-2">
            <input
              id="contractor-invite-link"
              readOnly
              value={inviteLink}
              className="flex-1 rounded-xl border border-charcoal-200/90 bg-charcoal-50 px-4 py-2.5 font-body text-sm text-charcoal-700 outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-charcoal-200/90 bg-white transition-colors hover:bg-charcoal-50"
            >
              {copied ? (
                <MdCheck className="text-lg text-sage-600" />
              ) : (
                <MdCopyAll className="text-lg text-charcoal-500" />
              )}
            </button>
          </div>
          {copied && (
            <p className="font-body text-xs text-sage-600">Copied to clipboard!</p>
          )}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleClose}
              className="rounded-xl bg-primary-500 px-5 py-2.5 font-heading text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default InviteContractorModal;