import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { MdCopyAll, MdCheck } from 'react-icons/md';
import Modal from '@components/ui/Modal';
import { generateInvite } from '@services/invite.api';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
});

const inputClass =
  'mt-1.5 w-full rounded-xl border border-charcoal-200/90 bg-white px-4 py-2.5 text-charcoal-950 text-sm outline-none transition duration-200 placeholder:text-charcoal-400 placeholder:text-xs focus:border-primary-400 focus:ring-4 focus:ring-primary-100';

const InviteTenantModal = ({ isOpen, onClose, propertyId, unitNumber }) => {
  const [step, setStep] = useState('form');
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
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

  const onSubmit = async ({ email }) => {
    setServerError('');
    setLoading(true);
    try {
      const res = await generateInvite({
        role: 'TENANT',
        email,
        meta: { propertyId, unitNumber },
      });
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
      // Fallback: select the input text
      const el = document.querySelector('#invite-link-input');
      if (el) el.select();
    }
  };

  const handleClose = () => {
    setStep('form');
    setInviteLink('');
    setCopied(false);
    setServerError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Tenant">
      {step === 'form' ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="font-body text-xs font-semibold uppercase tracking-[0.08em] text-charcoal-600">
              Tenant Email
            </label>
            <input
              {...register('email')}
              className={inputClass}
              placeholder="tenant@example.com"
              type="email"
            />
            {errors.email && (
              <p className="mt-1 font-body text-xs text-primary-500">{errors.email.message}</p>
            )}
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
            Share this link with the tenant to complete registration:
          </p>
          <div className="flex items-center gap-2">
            <input
              id="invite-link-input"
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

export default InviteTenantModal;