import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { MdPerson } from 'react-icons/md';
import Button from '@components/ui/Button';
import Skeleton from '@components/ui/Skeleton';
import { updateProfile } from '@services/user.api';
import { fetchCurrentUser } from '@store/slices/authSlice';
import useNotification from '@hooks/useNotification';
import {
  SettingsCard,
  Toggle,
  NotificationBanner,
} from '@features/settings/SettingsComponents';

const SPECIALIZATIONS = [
  'PLUMBING',
  'ELECTRICAL',
  'STRUCTURAL',
  'APPLIANCE',
  'HVAC',
  'PAINTING',
  'CARPENTRY',
  'OTHER',
];

const containerVariants = {
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};

function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading profile">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>

      <Skeleton className="h-4 w-80 rounded" />

      <div className="max-w-lg rounded-2xl border border-charcoal-200/70 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-charcoal-100/70 px-5 py-4">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="space-y-5 p-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-36" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-charcoal-50/60 px-4 py-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-9 rounded-full" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((s) => s.auth);
  const [saving, setSaving] = useState(false);
  const [specializations, setSpecializations] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [serverError, setServerError] = useState(null);
  const { notification, dismiss, showSuccess } = useNotification(serverError, {
    onErrorDismiss: () => setServerError(null),
  });

  useEffect(() => {
    if (user) {
      setSpecializations(user.profile?.specializations ?? []);
      setIsAvailable(user.profile?.isAvailable ?? true);
    }
  }, [user]);

  const toggleSpecialization = (spec) =>
    setSpecializations((prev) =>
      prev.includes(spec)
        ? prev.filter((s) => s !== spec)
        : [...prev, spec]
    );

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        profile: {
          ...user?.profile,
          specializations,
          isAvailable,
        },
      });
      await dispatch(fetchCurrentUser()).unwrap();
      showSuccess('Profile updated successfully.');
    } catch (err) {
      setServerError(err?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 py-8">
      {isLoading || !user ? (
        <PageSkeleton />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-x-6 gap-y-6"
        >
          <motion.div variants={itemVariants}>
            <p className="font-heading text-[11px] font-semibold uppercase tracking-[0.35em] text-primary-500">
              Technician
            </p>
            <h1 className="mt-1 font-heading text-3xl font-bold text-charcoal-950">
              Profile
            </h1>
          </motion.div>

          <motion.div variants={itemVariants}>
            <p className="font-body text-sm text-charcoal-500">
              Your contractor sees this when assigning jobs.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <SettingsCard
              icon={MdPerson}
              title="Professional Info"
              description="Update your specializations and availability"
              iconBg="bg-primary-50"
              iconColor="text-primary-500"
            >
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block font-body text-xs font-semibold uppercase tracking-[0.06em] text-charcoal-500">
                    Specializations
                  </label>
                  <p className="mb-2 font-body text-[11px] text-charcoal-400">
                    Select all areas of expertise.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALIZATIONS.map((spec) => (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialization(spec)}
                        className={`rounded-full px-3 py-1.5 font-heading text-xs font-semibold transition-colors ${
                          specializations.includes(spec)
                            ? 'bg-primary-500 text-white'
                            : 'border border-charcoal-200/90 bg-white text-charcoal-600 hover:border-primary-300'
                        }`}
                      >
                        {spec}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-charcoal-50/60 px-4 py-3">
                  <div>
                    <p className="font-body text-sm font-medium text-charcoal-800">
                      Available for work
                    </p>
                    <p className="font-body text-[11px] text-charcoal-400">
                      Contractors can assign you jobs when enabled.
                    </p>
                  </div>
                  <Toggle
                    checked={isAvailable}
                    onChange={setIsAvailable}
                  />
                </div>

                <NotificationBanner
                  notification={notification}
                  onDismiss={dismiss}
                />

                <Button type="submit" loading={saving} className="!w-auto">
                  Save Changes
                </Button>
              </form>
            </SettingsCard>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
